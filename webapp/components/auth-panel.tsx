"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { authApi, isApiError, type AuthSessionDto } from "../lib/api";

type AuthMode = "login" | "register";

export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [session, setSession] = useState<AuthSessionDto | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    void authApi
      .me()
      .then((data) => {
        if (!active) {
          return;
        }

        setSession(data);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setSession(null);
      })
      .finally(() => {
        if (!active) {
          return;
        }

        setIsCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (mode === "register" && password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === "login") {
        await authApi.login({ email, password });
        setSuccessMessage("Sesion iniciada correctamente.");
      } else {
        await authApi.register({
          email,
          password,
          fullName: buildNameFromEmail(email),
          tenantName: buildTenantNameFromEmail(email),
        });
        setSuccessMessage("Cuenta creada correctamente.");
      }

      const nextSession = await authApi.me();
      setSession(nextSession);
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      setErrorMessage(
        isApiError(error) ? error.message : "No se pudo completar la solicitud. Intenta de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await authApi.logout();
      setSession(null);
      setSuccessMessage("Sesion cerrada.");
      router.refresh();
    } catch {
      setErrorMessage("No se pudo cerrar la sesion.");
    }
  }

  if (isCheckingSession) {
    return (
      <section className="auth-card">
        <p className="auth-card__eyebrow">Acceso</p>
        <h1>Conectando con Lucia AI...</h1>
      </section>
    );
  }

  if (session) {
    return (
      <section className="auth-card">
        <p className="auth-card__eyebrow">Sesion activa</p>
        <h1>Ya iniciaste sesión.</h1>
        <p className="auth-card__lead">
          Estás dentro como <strong>{session.user.email}</strong> en <strong>{session.tenant.name}</strong>.
        </p>
        <div className="auth-card__actions">
          <Link className="button primary" href="/">
            Volver al inicio
          </Link>
          <button className="button secondary auth-button-reset" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-card">
      <p className="auth-card__eyebrow">Acceso</p>
      <h1>{mode === "login" ? "Inicia sesión en Lucia AI" : "Crea tu cuenta"}</h1>
      <p className="auth-card__lead">
        {mode === "login"
          ? "Entra con tu correo y contraseña para seguir configurando tu negocio."
          : "Registra tu cuenta en segundos. El nombre y tenant inicial se generan automáticamente por ahora."}
      </p>

      <div className="auth-switch" role="tablist" aria-label="Cambiar entre iniciar sesión y registro">
        <button
          className={`auth-switch__item ${mode === "login" ? "is-active" : ""}`}
          type="button"
          onClick={() => {
            setMode("login");
            setErrorMessage("");
            setSuccessMessage("");
          }}
        >
          Iniciar sesión
        </button>
        <button
          className={`auth-switch__item ${mode === "register" ? "is-active" : ""}`}
          type="button"
          onClick={() => {
            setMode("register");
            setErrorMessage("");
            setSuccessMessage("");
          }}
        >
          Registrarse
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Email</span>
          <input
            autoComplete="email"
            inputMode="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@empresa.com"
            required
          />
        </label>

        <label className="auth-field">
          <span>Contraseña</span>
          <input
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimo 8 caracteres"
            minLength={8}
            required
          />
        </label>

        {mode === "register" ? (
          <label className="auth-field">
            <span>Confirmar contraseña</span>
            <input
              autoComplete="new-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repite tu contraseña"
              minLength={8}
              required
            />
          </label>
        ) : null}

        {errorMessage ? <p className="auth-feedback is-error">{errorMessage}</p> : null}
        {successMessage ? <p className="auth-feedback is-success">{successMessage}</p> : null}

        <button className="button primary auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Procesando..."
            : mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
        </button>
      </form>
    </section>
  );
}

function buildNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "usuario";
  const words = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  return words.join(" ") || "Nuevo Usuario";
}

function buildTenantNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "workspace";
  const normalized = localPart.replace(/[._-]+/g, " ").trim();
  const label = normalized
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return label ? `${label} Workspace` : "Lucia Workspace";
}
