const steps = [
  {
    step: "1",
    title: "El cliente escribe",
    description: "La conversación entra por WhatsApp como siempre, sin fricción para el usuario.",
  },
  {
    step: "2",
    title: "Lucia entiende la intención",
    description: "Detecta si busca información, una cita, soporte o si está listo para comprar.",
  },
  {
    step: "3",
    title: "Responde y guía",
    description: "Entrega respuestas útiles, hace preguntas clave y avanza la conversación.",
  },
  {
    step: "4",
    title: "Captura y sigue el lead",
    description: "Guarda datos y puede activar seguimiento para que no se enfríe la oportunidad.",
  },
];

export function StepsSection() {
  return (
    <section className="steps" id="como-funciona">
      <div className="section-heading">
        <p className="eyebrow">Cómo funciona</p>
        <h2>Simple para tu cliente, potente para tu negocio.</h2>
      </div>

      <div className="step-grid">
        {steps.map((item) => (
          <article className="step-card" key={item.step}>
            <span>{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
