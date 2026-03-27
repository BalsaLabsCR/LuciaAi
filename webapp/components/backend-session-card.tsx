"use client";

import { useEffect, useState } from "react";
import { authApi, isApiError, type AuthSessionDto } from "../lib/api";

export function BackendSessionCard() {
  const [session, setSession] = useState<AuthSessionDto | null>(null);
  const [message, setMessage] = useState("Consultando backend...");

  useEffect(() => {
    let active = true;

    void authApi
      .me()
      .then((data) => {
        if (!active) {
          return;
        }

        setSession(data);
        setMessage("Sesion detectada desde el backend.");
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setMessage(
          isApiError(error) && error.status === 401
            ? "No hay sesion activa todavia. La capa API ya esta lista para login y refresh automatico."
            : "No se pudo consultar el backend. Revisa NEXT_PUBLIC_API_URL y CORS.",
        );
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="backend-session-card" aria-live="polite">
      <p className="backend-session-card__eyebrow">Frontend conectado al backend</p>
      <h2>La capa `lib/api` ya maneja cookies y refresh automatico.</h2>
      <p>{message}</p>
      {session ? (
        <dl className="backend-session-card__details">
          <div>
            <dt>Usuario</dt>
            <dd>{session.user.fullName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{session.user.email}</dd>
          </div>
          <div>
            <dt>Tenant</dt>
            <dd>{session.tenant.name}</dd>
          </div>
        </dl>
      ) : null}
      <p className="backend-session-card__hint">
        Usa `authApi.login`, `authApi.register`, `authApi.me` y `authApi.logout` desde componentes
        cliente o server actions.
      </p>
    </section>
  );
}
