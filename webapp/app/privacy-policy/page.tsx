import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Lucia AI",
  description:
    "Conoce cómo Lucia AI recopila, usa, divulga, protege y administra los datos de los usuarios.",
};

const sections = [
  {
    title: "1. Qué información recopilamos",
    body: [
      "Lucia AI puede recopilar datos de contacto como nombre, correo electrónico, número de teléfono y nombre del negocio cuando un usuario crea una cuenta, solicita una demo o interactúa con nuestros servicios.",
      "También podemos procesar contenido de conversaciones, mensajes, respuestas automáticas, resultados capturados como leads, citas, reservas o tickets, y datos de configuración del negocio necesarios para operar el servicio.",
      "Adicionalmente, recopilamos información técnica básica como dirección IP, identificadores de sesión, tipo de navegador, páginas visitadas, eventos de uso e información necesaria para proteger la plataforma y diagnosticar problemas.",
    ],
  },
  {
    title: "2. Cómo usamos la información",
    body: [
      "Usamos los datos para prestar, mantener y mejorar Lucia AI, incluyendo automatizar conversaciones, mostrar paneles operativos, gestionar integraciones y permitir que cada tenant configure sus flujos de trabajo.",
      "La información también se usa para autenticar usuarios, prevenir fraude o abuso, responder solicitudes de soporte, enviar comunicaciones operativas y cumplir obligaciones legales.",
      "Cuando un negocio conecta canales como WhatsApp o Google Sheets, utilizamos los datos estrictamente para ejecutar la integración solicitada por el cliente y entregar la funcionalidad contratada.",
    ],
  },
  {
    title: "3. Cómo compartimos la información",
    body: [
      "No vendemos información personal de nuestros usuarios.",
      "Podemos compartir datos con proveedores de infraestructura, alojamiento, autenticación, analítica, mensajería o pagos que nos ayudan a operar el servicio, siempre bajo términos que limitan su uso a la prestación del servicio.",
      "También podemos compartir información cuando sea necesario para cumplir la ley, responder solicitudes válidas de autoridades o proteger los derechos, seguridad y operaciones de Lucia AI, nuestros clientes o terceros.",
    ],
  },
  {
    title: "4. Integraciones de terceros",
    body: [
      "Si un usuario conecta servicios de terceros como WhatsApp, Meta, Google Sheets, CRMs u otras herramientas, Lucia AI accede y procesa la información mínima necesaria para habilitar esa integración.",
      "El uso de esos servicios también puede estar sujeto a las políticas y términos del tercero correspondiente.",
      "Lucia AI no controla las prácticas de privacidad de plataformas de terceros fuera de nuestra aplicación.",
    ],
  },
  {
    title: "5. Retención de datos",
    body: [
      "Conservamos la información durante el tiempo necesario para operar el servicio, cumplir con obligaciones contractuales y legales, resolver disputas y mantener la seguridad de la plataforma.",
      "Algunos datos operativos pueden conservarse por periodos más cortos o más largos según su naturaleza, por ejemplo logs de seguridad, registros contables o resúmenes de actividad necesarios para la continuidad del producto.",
    ],
  },
  {
    title: "6. Seguridad",
    body: [
      "Aplicamos medidas administrativas, técnicas y organizativas razonables para proteger la información contra acceso no autorizado, alteración, divulgación o destrucción.",
      "Sin embargo, ningún sistema es completamente infalible y no podemos garantizar seguridad absoluta.",
    ],
  },
  {
    title: "7. Derechos y elecciones del usuario",
    body: [
      "Los usuarios pueden solicitar acceso, corrección o eliminación de su información, sujeto a requisitos legales y operativos aplicables.",
      "También pueden contactarnos para preguntas sobre el tratamiento de sus datos o para solicitar asistencia sobre su cuenta o sus integraciones.",
    ],
  },
  {
    title: "8. Menores de edad",
    body: [
      "Lucia AI no está dirigida a menores de edad y no buscamos recopilar deliberadamente información personal de menores sin autorización válida.",
    ],
  },
  {
    title: "9. Cambios a esta política",
    body: [
      "Podemos actualizar esta política de privacidad ocasionalmente para reflejar cambios en el servicio, requisitos legales o mejoras operativas.",
      "Cuando hagamos cambios materiales, publicaremos la versión actualizada en esta página con su fecha de vigencia.",
    ],
  },
  {
    title: "10. Contacto",
    body: [
      "Si tienes preguntas sobre esta política o sobre cómo Lucia AI usa y administra los datos, puedes escribirnos a info@getluciachat.com.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="privacy-page">
      <section className="privacy-hero">
        <p className="eyebrow">Legal</p>
        <h1>Política de Privacidad</h1>
        <p>
          Esta política explica cómo Lucia AI usa, divulga, protege y administra los datos de los
          usuarios y de los negocios que utilizan la plataforma.
        </p>
        <p className="privacy-updated">Última actualización: 31 de marzo de 2026</p>
      </section>

      <section className="privacy-card">
        <p className="privacy-intro">
          Lucia AI es un proyecto de BalsaLabs LLC. Nuestro objetivo es procesar únicamente la
          información necesaria para operar automatizaciones, integraciones y experiencias de
          soporte dentro de la plataforma.
        </p>

        <div className="privacy-sections">
          {sections.map((section) => (
            <section key={section.title} className="privacy-section">
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
