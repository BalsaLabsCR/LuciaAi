"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { isApiError, whatsappApi, type WhatsAppStatusDto } from "../lib/api";

export function WhatsAppConnectionStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<WhatsAppStatusDto | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (typeof window !== "undefined" && window.location.hash === "#_=_") {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }

    void whatsappApi
      .getStatus()
      .then((data) => {
        if (!active) {
          return;
        }

        setStatus(data);
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        if (isApiError(error) && error.status === 401) {
          router.replace("/auth");
          return;
        }

        setErrorMessage("No se pudo consultar el estado actual de WhatsApp.");
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

  const connectedFlag = searchParams.get("connected") === "1";

  return (
    <section className="auth-card integration-card">
      <p className="auth-card__eyebrow">Integración de Meta</p>
      <h1>
        {isLoading
          ? "Verificando conexión..."
          : status?.connected
            ? "Cuenta de Meta enlazada"
            : connectedFlag
              ? "Conexión recibida"
              : "Estado de la integración"}
      </h1>
      <p className="auth-card__lead">
        {status?.connected
          ? "La cuenta de negocio fue enlazada correctamente y ya podemos continuar con la configuración."
          : connectedFlag
            ? "Recibimos el retorno de Meta. Si el estado no aparece como enlazado, revisa la configuración o vuelve a intentar."
            : "Aquí verás el resultado del onboarding de Meta para la cuenta de negocio."}
      </p>

      {errorMessage ? <p className="auth-feedback is-error">{errorMessage}</p> : null}

      {!isLoading && status ? (
        <div className="integration-card__details">
          <div>
            <span>Estado</span>
            <strong>{status.status}</strong>
          </div>
          <div>
            <span>Referencia visible</span>
            <strong>{status.phoneNumber ?? "Pendiente de configuración"}</strong>
          </div>
        </div>
      ) : null}

      <div className="auth-card__actions">
        <Link className="button primary" href="/dashboard">
          Volver al dashboard
        </Link>
        <Link className="button secondary" href="/">
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}
