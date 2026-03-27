import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lucia AI | Automatiza ventas por WhatsApp",
  description:
    "Lucia AI automatiza conversaciones de WhatsApp para responder clientes, capturar leads y convertir chats en ventas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="page-shell">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
