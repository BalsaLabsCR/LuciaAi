"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authApi } from "../lib/api";
import { BrandLogo } from "./brand-logo";

export function SiteHeader() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let active = true;

    void authApi
      .me()
      .then(() => {
        if (!active) {
          return;
        }

        setHasSession(true);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setHasSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Lucia AI">
        <BrandLogo />
        <span className="brand-text">Lucia AI</span>
      </Link>

      <nav className="nav">
        <Link href="/">Inicio</Link>
        <Link href="/#como-funciona">Cómo funciona</Link>
        <Link href="/#planes">Planes</Link>
        <Link href="/#contacto">Contacto</Link>
        <Link className="nav-login-link" href={hasSession ? "/dashboard" : "/auth"}>
          {hasSession ? "Mi cuenta" : "Iniciar sesión"}
        </Link>
      </nav>
    </header>
  );
}
