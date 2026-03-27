const features = [
  {
    title: "Respuestas automáticas en WhatsApp",
    description: "Contesta preguntas frecuentes de horarios, precios, servicios y disponibilidad.",
  },
  {
    title: "Captura automática de leads",
    description: "Recolecta nombre, interés y datos clave para dar seguimiento comercial.",
  },
  {
    title: "Flujos orientados a conversión",
    description: "No solo responde: lleva al usuario hacia demo, cita, contacto o compra.",
  },
  {
    title: "Integraciones prácticas",
    description: "Conecta con Google Sheets, CRM básico o flujos más avanzados según el plan.",
  },
];

export function FeatureSection() {
  return (
    <section className="features">
      <div className="section-heading">
        <p className="eyebrow">Qué obtiene tu negocio</p>
        <h2>Más orden, menos mensajes perdidos, más oportunidades atendidas.</h2>
      </div>

      <div className="feature-grid">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
