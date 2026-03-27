"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  authApi,
  billingApi,
  isApiError,
  whatsappApi,
  type AuthSessionDto,
  type SubscriptionDto,
  type WhatsAppSendTestResponse,
  type WhatsAppStartDto,
  type WhatsAppStatusDto,
} from "../lib/api";

type DashboardSection =
  | "overview"
  | "conversations"
  | "automations"
  | "integrations"
  | "tenants"
  | "billing"
  | "support"
  | PrimaryOutcomeType;

type PrimaryOutcomeType = "leads" | "appointments" | "reservations" | "support_tickets";

declare global {
  interface Window {
    FB?: {
      init: (options: {
        appId: string;
        autoLogAppEvents: boolean;
        xfbml: boolean;
        cookie?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: { authResponse?: { code?: string }; code?: string; status?: string }) => void,
        options: Record<string, unknown>,
      ) => void;
    };
  }
}

const outcomeLabel: Record<PrimaryOutcomeType, string> = {
  leads: "Leads",
  appointments: "Appointments",
  reservations: "Reservations",
  support_tickets: "Support Tickets",
};

const mockConversations = [
  {
    id: "conv-1",
    customer: "Juan Pérez",
    phone: "+506 8888 9999",
    preview: "Quiero saber el precio del plan pro.",
    status: "Nuevo lead",
    tags: ["ventas", "precio"],
    messages: [
      { sender: "customer", text: "Hola, quiero saber el precio del plan pro." },
      { sender: "lucia", text: "Claro. ¿Quieres que te enviemos una demo o una cotización?" },
      { sender: "customer", text: "Una demo, por favor." },
    ],
  },
  {
    id: "conv-2",
    customer: "Ana Solís",
    phone: "+506 7111 2233",
    preview: "Necesito reagendar mi cita.",
    status: "Escalado",
    tags: ["citas", "humano"],
    messages: [
      { sender: "customer", text: "Necesito reagendar mi cita." },
      { sender: "lucia", text: "Puedo ayudarte. ¿Qué día te funciona mejor?" },
    ],
  },
  {
    id: "conv-3",
    customer: "Clínica Verde",
    phone: "+506 6222 4433",
    preview: "¿Dónde puedo ver mi reserva?",
    status: "Automatizado",
    tags: ["reserva"],
    messages: [
      { sender: "customer", text: "¿Dónde puedo ver mi reserva?" },
      { sender: "lucia", text: "Te acabo de enviar el enlace con los detalles." },
    ],
  },
];

const mockActivity = [
  "Nuevo lead: Juan pidió una demo del plan Pro",
  "Lucia escaló una conversación a humano por intención sensible",
  "Google Sheets sincronizó 12 registros nuevos",
  "Alerta: hace 2 horas no se captura un nuevo lead",
];

export function DashboardOverview() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSessionDto | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionDto>(null);
  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppStatusDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectingWhatsApp, setIsConnectingWhatsApp] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [testSuccessMessage, setTestSuccessMessage] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Hola, este es un mensaje de prueba desde Lucia AI.");
  const [metaSdkReady, setMetaSdkReady] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const [selectedOutcomeTypes, setSelectedOutcomeTypes] = useState<PrimaryOutcomeType[]>(["leads"]);
  const [selectedConversationId, setSelectedConversationId] = useState(mockConversations[0]?.id ?? "");

  useEffect(() => {
    let active = true;

    void Promise.all([authApi.me(), billingApi.getSubscription(), whatsappApi.getStatus()])
      .then(([nextSession, billingResponse, nextWhatsappStatus]) => {
        if (!active) {
          return;
        }

        setSession(nextSession);
        setSubscription(billingResponse.subscription);
        setWhatsAppStatus(nextWhatsappStatus);
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        if (isApiError(error) && error.status === 401) {
          router.replace("/auth");
          return;
        }

        setErrorMessage("No se pudo cargar el dashboard en este momento.");
      })
      .finally(() => {
        if (!active) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const menuItems = useMemo(() => {
    return [
      { key: "overview", label: "Overview" },
      { key: "conversations", label: "Conversations" },
      ...selectedOutcomeTypes.map((type) => ({
        key: type,
        label: outcomeLabel[type],
      })),
      { key: "automations", label: "Automations / AI Config" },
      { key: "integrations", label: "Integrations" },
      { key: "tenants", label: "Tenants" },
      { key: "billing", label: "Billing" },
      { key: "support", label: "Support" },
    ] as Array<{ key: DashboardSection; label: string }>;
  }, [selectedOutcomeTypes]);

  useEffect(() => {
    if (
      (activeSection === "leads" ||
        activeSection === "appointments" ||
        activeSection === "reservations" ||
        activeSection === "support_tickets") &&
      !selectedOutcomeTypes.includes(activeSection)
    ) {
      setActiveSection("overview");
    }
  }, [activeSection, selectedOutcomeTypes]);

  const selectedConversation =
    mockConversations.find((conversation) => conversation.id === selectedConversationId) ??
    mockConversations[0];

  async function handleConnectWhatsApp() {
    try {
      setErrorMessage("");
      setTestSuccessMessage("");
      setIsConnectingWhatsApp(true);
      const startResponse = await whatsappApi.start();
      console.log("[Lucia][WhatsApp] start response", startResponse);
      const signupResult = await launchEmbeddedSignup(startResponse);
      console.log("[Lucia][WhatsApp] signup result", signupResult);
      const completeResponse = await whatsappApi.complete(signupResult);
      console.log("[Lucia][WhatsApp] complete response", completeResponse);

      setWhatsAppStatus({
        connected: Boolean(completeResponse.integration.phoneNumberId),
        status: completeResponse.integration.status,
        phoneNumber: completeResponse.integration.phoneNumber,
        wabaId: completeResponse.integration.wabaId,
      });
      setTestSuccessMessage("WhatsApp quedó conectado correctamente.");
      setActiveSection("integrations");
      router.refresh();
    } catch (error: unknown) {
      setErrorMessage(
        isApiError(error) ? error.message : "No se pudo iniciar la conexión con WhatsApp.",
      );
    } finally {
      setIsConnectingWhatsApp(false);
    }
  }

  async function handleSendTestMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setTestSuccessMessage("");

    try {
      setIsSendingTest(true);
      const response: WhatsAppSendTestResponse = await whatsappApi.sendTestMessage({
        to: testPhone,
        text: testMessage,
      });
      setTestSuccessMessage(
        response.providerMessageId
          ? `Mensaje enviado. Provider message ID: ${response.providerMessageId}`
          : "Mensaje de prueba enviado correctamente.",
      );
    } catch (error: unknown) {
      setErrorMessage(
        isApiError(error) ? error.message : "No se pudo enviar el mensaje de prueba.",
      );
    } finally {
      setIsSendingTest(false);
    }
  }

  async function handleLogout() {
    await authApi.logout();
    router.replace("/auth");
    router.refresh();
  }

  if (isLoading) {
    return (
      <section className="dashboard-shell">
        <p className="dashboard-eyebrow">Dashboard</p>
        <h1>Cargando tu espacio de trabajo...</h1>
      </section>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={() => setMetaSdkReady(true)}
      />
      <section className="dashboard-shell dashboard-shell--saas">
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar__brand">
            <p className="dashboard-eyebrow">Lucia AI</p>
            <strong>{session.tenant.name}</strong>
            <span>{session.user.email}</span>
          </div>

          <nav className="dashboard-nav" aria-label="Dashboard navigation">
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={`dashboard-nav__item ${activeSection === item.key ? "is-active" : ""}`}
                type="button"
                onClick={() => setActiveSection(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="dashboard-sidebar__footer">
            <button className="button secondary auth-button-reset dashboard-logout" type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          <header className="dashboard-main__header">
            <div>
              <p className="dashboard-eyebrow">{menuItems.find((item) => item.key === activeSection)?.label}</p>
              <h1>Hola, {session.user.fullName}.</h1>
              <p className="dashboard-identity">{session.user.email}</p>
            </div>
          </header>

          {errorMessage ? <p className="auth-feedback is-error">{errorMessage}</p> : null}
          {testSuccessMessage ? <p className="auth-feedback is-success">{testSuccessMessage}</p> : null}

          {activeSection === "overview" ? (
            <section className="dashboard-view">
              <div className="saas-metrics-grid">
                {buildOverviewMetrics(selectedOutcomeTypes).map((metric) => (
                  <article key={metric.label} className="saas-metric-card">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <small>{metric.detail}</small>
                  </article>
                ))}
              </div>

              <div className="saas-overview-grid">
                <section className="saas-panel">
                  <div className="saas-panel__header">
                    <h2>Alertas y salud operacional</h2>
                    <p>Responde rápido a lo que puede afectar conversiones o automatización.</p>
                  </div>
                  <ul className="saas-alert-list">
                    <li>{whatsAppStatus?.connected ? "WhatsApp conectado y listo para automatizar." : "Conecta WhatsApp para empezar a capturar conversaciones."}</li>
                    <li>Configura el primary outcome correcto para evitar capturas innecesarias.</li>
                    <li>{subscription?.plan?.name ? `Plan actual: ${subscription.plan.name}.` : "No tienes un plan activo asociado todavía."}</li>
                  </ul>
                </section>

                <section className="saas-panel">
                  <div className="saas-panel__header">
                    <h2>Actividad reciente</h2>
                    <p>Un feed rápido para entender qué está ocurriendo sin abrir diez pantallas.</p>
                  </div>
                  <div className="saas-activity-feed">
                    {mockActivity.map((item) => (
                      <article key={item} className="saas-activity-item">
                        <span className="saas-activity-item__dot" />
                        <p>{item}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </section>
          ) : null}

          {activeSection === "conversations" ? (
            <section className="dashboard-view saas-inbox-layout">
              <section className="saas-panel saas-chat-list">
                <div className="saas-panel__header">
                  <h2>Inbox</h2>
                  <p>Últimos mensajes con TTL corto y resumen persistente.</p>
                </div>
                {mockConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    className={`saas-chat-list__item ${selectedConversation.id === conversation.id ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <strong>{conversation.customer}</strong>
                    <span>{conversation.preview}</span>
                    <small>{conversation.status}</small>
                  </button>
                ))}
              </section>

              <section className="saas-panel saas-conversation-thread">
                <div className="saas-panel__header">
                  <h2>{selectedConversation.customer}</h2>
                  <p>{selectedConversation.phone}</p>
                </div>
                <div className="saas-thread">
                  {selectedConversation.messages.map((message) => (
                    <article
                      key={`${selectedConversation.id}-${message.sender}-${message.text}`}
                      className={`saas-thread__message ${message.sender === "lucia" ? "is-bot" : "is-customer"}`}
                    >
                      {message.text}
                    </article>
                  ))}
                </div>
                <div className="saas-thread__actions">
                  <button className="button secondary" type="button">Tomar control manual</button>
                  <button className="button secondary" type="button">
                    Marcar como {getDefaultOutcomeSingular(selectedOutcomeTypes)}
                  </button>
                  <button className="button secondary" type="button">Escalar a humano</button>
                </div>
              </section>

              <section className="saas-panel saas-conversation-meta">
                <div className="saas-panel__header">
                  <h2>Contexto</h2>
                  <p>Datos útiles para confiar en lo que Lucia está haciendo.</p>
                </div>
                <dl className="saas-definition-list">
                  <div>
                    <dt>Cliente</dt>
                    <dd>{selectedConversation.customer}</dd>
                  </div>
                  <div>
                    <dt>Teléfono</dt>
                    <dd>{selectedConversation.phone}</dd>
                  </div>
                  <div>
                    <dt>Lead status</dt>
                    <dd>{selectedConversation.status}</dd>
                  </div>
                  <div>
                    <dt>Tags</dt>
                    <dd>{selectedConversation.tags.join(", ")}</dd>
                  </div>
                  <div>
                    <dt>Historial</dt>
                    <dd>Resumen persistente + últimos mensajes por 5 días.</dd>
                  </div>
                </dl>
              </section>
            </section>
          ) : null}

          {isOutcomeSection(activeSection) ? (
            <section className="dashboard-view">
              <section className="saas-panel">
                <div className="saas-panel__header">
                  <h2>{outcomeLabel[activeSection]}</h2>
                  <p>Vista simple y accionable según el objetivo principal del tenant.</p>
                </div>
                <div className="saas-table">
                  <div className="saas-table__row saas-table__row--head">
                    <span>Nombre</span>
                    <span>Teléfono</span>
                    <span>Estado</span>
                    <span>Fuente</span>
                    <span>Fecha</span>
                  </div>
                  {mockConversations.map((conversation, index) => (
                    <div key={conversation.id} className="saas-table__row">
                      <span>{conversation.customer}</span>
                      <span>{conversation.phone}</span>
                      <span>{index === 0 ? "Nuevo" : index === 1 ? "Contactado" : "Cerrado"}</span>
                      <span>WhatsApp</span>
                      <span>{index + 1}h atrás</span>
                    </div>
                  ))}
                </div>
                <div className="saas-inline-actions">
                  <button className="button secondary" type="button">Exportar</button>
                  <button className="button secondary" type="button">Sincronizar</button>
                </div>
              </section>
            </section>
          ) : null}

          {activeSection === "automations" ? (
            <section className="dashboard-view saas-config-grid">
              <section className="saas-panel">
                <div className="saas-panel__header">
                  <h2>Capture Goals</h2>
                  <p>Selecciona qué resultados quieres que Lucia detecte y empuje en este tenant.</p>
                </div>
                <div className="saas-checkbox-grid">
                  {(
                    [
                      ["leads", "Leads"],
                      ["appointments", "Appointments"],
                      ["reservations", "Reservations"],
                      ["support_tickets", "Support tickets"],
                    ] as Array<[PrimaryOutcomeType, string]>
                  ).map(([type, label]) => (
                    <label key={type} className="saas-checkbox-card">
                      <input
                        type="checkbox"
                        checked={selectedOutcomeTypes.includes(type)}
                        onChange={(event) => {
                          setSelectedOutcomeTypes((current) => {
                            if (event.target.checked) {
                              return current.includes(type) ? current : [...current, type];
                            }

                            if (current.length === 1) {
                              return current;
                            }

                            return current.filter((item) => item !== type);
                          });
                        }}
                      />
                      <div>
                        <strong>{label}</strong>
                        <span>Lucia puede capturar este resultado y mostrarlo en el menú.</span>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              <section className="saas-panel">
                <div className="saas-panel__header">
                  <h2>Business Knowledge</h2>
                  <p>FAQ, productos, horarios y políticas sin meter al usuario en JSON.</p>
                </div>
                <textarea className="saas-textarea" defaultValue={"FAQ:\n- Horarios de atención\n- Precios base\n- Políticas de cancelación"} />
              </section>

              <section className="saas-panel">
                <div className="saas-panel__header">
                  <h2>Behavior Rules</h2>
                  <p>Cuándo capturar, cuándo escalar y cómo debe sonar Lucia.</p>
                </div>
                <div className="saas-form-stack">
                  <label className="auth-field">
                    <span>Cuándo generar un outcome</span>
                    <input type="text" defaultValue="Si preguntan precio o disponibilidad" />
                  </label>
                  <label className="auth-field">
                    <span>Cuándo escalar a humano</span>
                    <input type="text" defaultValue='Si dicen "hablar con humano" o muestran frustración' />
                  </label>
                  <label className="auth-field">
                    <span>Tono de voz</span>
                    <select defaultValue="ventas">
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                      <option value="ventas">Ventas</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="saas-panel">
                <div className="saas-panel__header">
                  <h2>Playbooks</h2>
                  <p>Flujos rápidos para ventas, soporte o seguimiento.</p>
                </div>
                <div className="saas-pill-grid">
                  <span>Ventas</span>
                  <span>Soporte</span>
                  <span>Seguimiento</span>
                </div>
              </section>

              <section className="saas-panel">
                <div className="saas-panel__header">
                  <h2>Test Playground</h2>
                  <p>Simula una conversación y mira cómo respondería Lucia.</p>
                </div>
                <textarea className="saas-textarea" defaultValue="Cliente: Hola, quiero saber el precio para 20 personas." />
                <div className="saas-playground-response">
                  Lucia respondería con una propuesta clara, pediría el dato faltante y capturaría el outcome si hay intención comercial.
                </div>
              </section>
            </section>
          ) : null}

          {activeSection === "integrations" ? (
            <section className="dashboard-view">
              <section className="saas-panel">
                <div className="saas-panel__header">
                  <h2>Integrations</h2>
                  <p>Todo con estado visible y acciones simples.</p>
                </div>

                <div className="saas-integration-list">
                  <article className="saas-integration-row">
                    <div>
                      <strong>WhatsApp</strong>
                      <p>{whatsAppStatus?.connected ? `Conectado${whatsAppStatus.phoneNumber ? ` · ${whatsAppStatus.phoneNumber}` : ""}` : "No conectado"}</p>
                    </div>
                    <button
                      className="button primary dashboard-connect-button"
                      type="button"
                      onClick={handleConnectWhatsApp}
                      disabled={isConnectingWhatsApp || !metaSdkReady}
                    >
                      {isConnectingWhatsApp ? "Conectando..." : !metaSdkReady ? "Cargando Meta..." : whatsAppStatus?.connected ? "Reconectar" : "Conectar"}
                    </button>
                  </article>

                  <article className="saas-integration-row">
                    <div>
                      <strong>Google Sheets</strong>
                      <p>Desconectado · última sincronización pendiente</p>
                    </div>
                    <button className="button secondary" type="button">Conectar</button>
                  </article>

                  <article className="saas-integration-row">
                    <div>
                      <strong>CRM</strong>
                      <p>Próximamente</p>
                    </div>
                    <button className="button secondary" type="button" disabled>Próximamente</button>
                  </article>
                </div>

                {whatsAppStatus?.connected ? (
                  <form className="dashboard-test-form dashboard-test-form--compact saas-secondary-form" onSubmit={handleSendTestMessage}>
                    <label className="auth-field">
                      <span>Número de teléfono</span>
                      <input
                        type="tel"
                        inputMode="tel"
                        placeholder="+50688889999"
                        value={testPhone}
                        onChange={(event) => setTestPhone(event.target.value)}
                        required
                        disabled={isSendingTest}
                      />
                    </label>

                    <label className="auth-field">
                      <span>Mensaje de prueba</span>
                      <input
                        type="text"
                        placeholder="Hola, este es un mensaje de prueba..."
                        value={testMessage}
                        onChange={(event) => setTestMessage(event.target.value)}
                        required
                        disabled={isSendingTest}
                      />
                    </label>

                    <button className="button secondary dashboard-test-button" type="submit" disabled={isSendingTest}>
                      {isSendingTest ? "Enviando..." : "Enviar prueba"}
                    </button>
                  </form>
                ) : null}
              </section>
            </section>
          ) : null}

          {activeSection === "tenants" ? (
            <section className="dashboard-view">
              <section className="saas-panel">
                <div className="saas-panel__header">
                  <h2>Tenants</h2>
                  <p>Multi-negocio sin esconder el estado operativo.</p>
                </div>
                <div className="saas-tenant-list">
                  <article className="saas-tenant-row is-active">
                    <div>
                      <strong>{session.tenant.name}</strong>
                      <p>{whatsAppStatus?.connected ? "Número conectado" : "Sin número conectado"}</p>
                    </div>
                    <span className="saas-tenant-pill">Activo</span>
                  </article>
                  <div className="saas-inline-actions">
                    <button className="button secondary" type="button">Crear nuevo tenant</button>
                    <button className="button secondary" type="button">Cambiar activo</button>
                    <button className="button secondary" type="button">Eliminar</button>
                  </div>
                </div>
              </section>
            </section>
          ) : null}

          {activeSection === "billing" ? (
            <section className="dashboard-view">
              <section className="saas-panel">
                <div className="saas-panel__header">
                  <h2>Billing</h2>
                  <p>Simple, visible y sin esconder nada importante.</p>
                </div>
                <div className="saas-billing-stack">
                  <div className="dashboard-info-row">
                    <span>Plan actual</span>
                    <strong>{subscription?.plan?.name ?? "Sin plan"}</strong>
                    <small>{subscription?.plan ? `${subscription.plan.currency} ${subscription.plan.priceMonthly}/mes` : "Aún no hay plan asignado."}</small>
                  </div>
                  <div className="dashboard-info-row">
                    <span>Próximo cobro</span>
                    <strong>{subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString("es-CR") : "Pendiente"}</strong>
                    <small>{subscription?.cancelAtPeriodEnd ? "La suscripción se cancelará al final del periodo." : "Cobro recurrente activo."}</small>
                  </div>
                </div>
                <div className="saas-inline-actions">
                  <button className="button secondary" type="button">Cambiar plan</button>
                  <button className="button secondary" type="button">Cancelar</button>
                </div>
              </section>
            </section>
          ) : null}

          {activeSection === "support" ? (
            <section className="dashboard-view saas-support-grid">
              <section className="saas-panel">
                <div className="saas-panel__header">
                  <h2>Support</h2>
                  <p>Canales simples para resolver bloqueos rápido.</p>
                </div>
                <div className="saas-support-links">
                  <button className="button secondary" type="button">Chat en vivo</button>
                  <button className="button secondary" type="button">Email</button>
                  <button className="button secondary" type="button">Docs</button>
                </div>
              </section>

              <section className="saas-panel">
                <div className="saas-panel__header">
                  <h2>Problemas comunes</h2>
                  <p>Guías rápidas sin lenguaje técnico innecesario.</p>
                </div>
                <ul className="saas-alert-list">
                  <li>Cómo conectar WhatsApp</li>
                  <li>Cómo recibir {formatOutcomeList(selectedOutcomeTypes)}</li>
                  <li>Cómo validar si Lucia está respondiendo bien</li>
                </ul>
              </section>
            </section>
          ) : null}
        </main>
      </section>
    </>
  );
}

function buildOverviewMetrics(selectedOutcomeTypes: PrimaryOutcomeType[]) {
  const primaryOutcome = selectedOutcomeTypes[0] ?? "leads";
  const outcomeValue =
    primaryOutcome === "leads"
      ? "18 leads"
      : primaryOutcome === "appointments"
        ? "9 citas"
        : primaryOutcome === "reservations"
          ? "14 reservas"
          : "11 tickets";

  return [
    { label: "Mensajes recibidos", value: "126", detail: "Hoy: 18 · Semana: 126" },
    {
      label: selectedOutcomeTypes.length > 1 ? "Outcomes activos" : outcomeLabel[primaryOutcome],
      value: selectedOutcomeTypes.length > 1 ? String(selectedOutcomeTypes.length) : outcomeValue,
      detail:
        selectedOutcomeTypes.length > 1
          ? formatOutcomeList(selectedOutcomeTypes)
          : "Resultado principal capturado",
    },
    { label: "Tasa de conversión", value: "23%", detail: "Mensaje → outcome principal" },
    { label: "Tiempo de respuesta", value: "42s", detail: "Promedio en conversaciones activas" },
    { label: "Automatizado vs humano", value: "78 / 22", detail: "Distribución operacional" },
    { label: "Alertas activas", value: "2", detail: "Una requiere atención hoy" },
  ];
}

function isOutcomeSection(section: DashboardSection): section is PrimaryOutcomeType {
  return (
    section === "leads" ||
    section === "appointments" ||
    section === "reservations" ||
    section === "support_tickets"
  );
}

function formatOutcomeList(selectedOutcomeTypes: PrimaryOutcomeType[]) {
  return selectedOutcomeTypes.map((type) => outcomeLabel[type].toLowerCase()).join(", ");
}

function getDefaultOutcomeSingular(selectedOutcomeTypes: PrimaryOutcomeType[]) {
  const first = selectedOutcomeTypes[0] ?? "leads";
  return first === "leads"
    ? "lead"
    : first === "appointments"
      ? "appointment"
      : first === "reservations"
        ? "reservation"
        : "ticket";
}

async function launchEmbeddedSignup(startResponse: WhatsAppStartDto) {
  if (!window.FB) {
    throw new Error("Meta SDK is not available yet.");
  }

  window.FB.init({
    appId: startResponse.appId,
    autoLogAppEvents: true,
    xfbml: true,
    cookie: true,
    version: "v22.0",
  });

  return new Promise<{
    code: string;
    state: string;
    wabaId?: string;
    phoneNumberId?: string;
    businessAccountName?: string;
    displayPhoneNumber?: string;
  }>((resolve, reject) => {
    let authCode: string | null = null;
    let signupData: {
      wabaId?: string;
      phoneNumberId?: string;
      businessAccountName?: string;
      displayPhoneNumber?: string;
    } | null = null;

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "Meta no devolvió los datos finales de WhatsApp a tiempo. Revisa que el flujo llegue al paso final y que la configuración de Embedded Signup soporte sessionInfoVersion 3.",
        ),
      );
    }, 90_000);

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("message", handleMessage);
    };

    const tryResolve = () => {
      if (authCode && signupData?.wabaId && signupData.phoneNumberId) {
        cleanup();
        resolve({
          code: authCode,
          state: startResponse.state,
          wabaId: signupData.wabaId,
          phoneNumberId: signupData.phoneNumberId,
          businessAccountName: signupData.businessAccountName,
          displayPhoneNumber: signupData.displayPhoneNumber,
        });
      }
    };

    const fallbackResolveWithCodeOnly = () => {
      if (!authCode) {
        return;
      }

      cleanup();
      resolve({
        code: authCode,
        state: startResponse.state,
        wabaId: signupData?.wabaId,
        phoneNumberId: signupData?.phoneNumberId,
        businessAccountName: signupData?.businessAccountName,
        displayPhoneNumber: signupData?.displayPhoneNumber,
      });
    };

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("facebook.com")) {
        return;
      }

      console.log("[Lucia][WhatsApp] raw postMessage event", {
        origin: event.origin,
        data: event.data,
      });

      try {
        const raw = typeof event.data === "string" ? event.data : JSON.stringify(event.data);
        const parsed = (typeof raw === "string" ? JSON.parse(raw) : raw) as {
          type?: string;
          event?: string;
          data?: {
            waba_id?: string;
            phone_number_id?: string;
            business_account_name?: string;
            display_phone_number?: string;
            error_message?: string;
            current_step?: string;
            wabaId?: string;
            phoneNumberId?: string;
            businessAccountName?: string;
            displayPhoneNumber?: string;
          };
        } | null;

        if (!parsed || parsed.type !== "WA_EMBEDDED_SIGNUP") {
          return;
        }

        console.log("[Lucia][WhatsApp] parsed embedded signup event", parsed);

        if (parsed.event?.startsWith("FINISH") && parsed.data) {
          signupData = {
            wabaId: parsed.data.waba_id ?? parsed.data.wabaId,
            phoneNumberId: parsed.data.phone_number_id ?? parsed.data.phoneNumberId,
            businessAccountName: parsed.data.business_account_name ?? parsed.data.businessAccountName,
            displayPhoneNumber: parsed.data.display_phone_number ?? parsed.data.displayPhoneNumber,
          };
          tryResolve();
        }

        if (parsed.event === "ERROR") {
          cleanup();
          reject(new Error(parsed.data?.error_message ?? "Meta devolvió un error durante el Embedded Signup."));
        }

        if (parsed.event === "CANCEL") {
          cleanup();
          reject(
            new Error(
              parsed.data?.current_step
                ? `El onboarding fue cancelado en el paso: ${parsed.data.current_step}.`
                : "WhatsApp Embedded Signup was cancelled.",
            ),
          );
        }
      } catch {
        // Ignore unrelated postMessage payloads.
      }
    };

    window.addEventListener("message", handleMessage);

    window.FB!.login(
      (response) => {
        console.log("[Lucia][WhatsApp] FB.login callback", response);
        const code = response.authResponse?.code ?? response.code;
        if (!code) {
          cleanup();
          reject(new Error("Meta did not return an authorization code."));
          return;
        }

        authCode = code;
        tryResolve();
        window.setTimeout(() => {
          fallbackResolveWithCodeOnly();
        }, 4000);
      },
      {
        config_id: startResponse.configId,
        response_type: startResponse.responseType,
        override_default_response_type: startResponse.overrideDefaultResponseType,
        extras: {
          feature: "whatsapp_embedded_signup",
          sessionInfoVersion: 3,
        },
      },
    );
  });
}
