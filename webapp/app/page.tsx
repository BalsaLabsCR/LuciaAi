import { ChatDemo } from "../components/chat-demo";
import { ContactCta } from "../components/contact-cta";
import { FeatureSection } from "../components/feature-section";
import { PricingSection } from "../components/pricing-section";
import { ProblemSolution } from "../components/problem-solution";
import { StepsSection } from "../components/steps-section";

export default function HomePage() {
  return (
    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">WhatsApp convertido en canal de ventas</p>
          <h1>Responde, califica y da seguimiento a tus clientes con Lucia AI.</h1>
          <p className="hero-text">
            Lucia AI automatiza conversaciones en WhatsApp para que tu negocio no pierda mensajes,
            capture leads y convierta más chats en ventas, incluso fuera de horario.
          </p>

          <div className="hero-actions">
            <a
              className="button primary"
              href="https://wa.me/50686224228"
              target="_blank"
              rel="noreferrer"
            >
              Hablar por WhatsApp
            </a>
            <a className="button secondary" href="mailto:info@getluciachat.com">
              Solicitar demo
            </a>
          </div>

          <ul className="trust-points">
            <li>Disponible 24/7</li>
            <li>Respuestas naturales y orientadas a ventas</li>
            <li>Integración con hojas de cálculo y CRM básico</li>
          </ul>
        </div>

        <div className="hero-visual">
          <ChatDemo />

          <div className="floating-card metric-card">
            <span className="metric-label">Objetivo</span>
            <strong>Convertir chats en ventas</strong>
          </div>

          <div className="floating-card info-card">
            <span className="metric-label">Lo que hace</span>
            <strong>Responde, entiende y guía al cliente</strong>
          </div>
        </div>
      </section>

      <ProblemSolution />
      <StepsSection />
      <FeatureSection />
      <PricingSection />

      <ContactCta />
    </main>
  );
}
