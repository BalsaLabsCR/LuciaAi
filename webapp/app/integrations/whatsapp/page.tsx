import { Suspense } from "react";
import { WhatsAppConnectionStatus } from "../../../components/whatsapp-connection-status";

export default function WhatsAppIntegrationPage() {
  return (
    <main className="auth-page">
      <Suspense fallback={<section className="auth-card integration-card"><h1>Cargando estado...</h1></section>}>
        <WhatsAppConnectionStatus />
      </Suspense>
    </main>
  );
}
