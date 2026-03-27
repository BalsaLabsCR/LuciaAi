type Plan = {
  name: string;
  price: string;
  hook: string;
  items: string[];
  fit: string;
  ctaLabel: string;
  ctaHref: string;
  ctaVariant: "primary" | "tertiary";
  featured?: boolean;
};

const plans: Plan[] = [
  {
    name: "Básico",
    price: "$70",
    hook: "Para empezar a automatizar",
    items: [
      "Respuestas automáticas en WhatsApp",
      "FAQs personalizadas: horarios, precios y servicios",
      "1 flujo simple de información o citas",
      "Configuración inicial incluida",
      "1 ajuste al mes",
    ],
    fit: "Ideal para negocios pequeños que solo quieren no perder mensajes.",
    ctaLabel: "Quiero este plan",
    ctaHref: "mailto:info@getluciachat.com?subject=Interes%20Plan%20Basico",
    ctaVariant: "tertiary",
  },
  {
    name: "Pro",
    price: "$100",
    hook: "Para no perder ventas",
    items: [
      "Todo lo del plan Básico",
      "Captura automática de leads",
      "Seguimiento automático a clientes que no respondieron",
      "Integración simple con Google Sheets o CRM básico",
      "Mejor comprensión de contexto y respuestas más inteligentes",
      "2 a 3 ajustes al mes",
    ],
    fit: "El mejor balance para negocios que quieren responder y vender más.",
    ctaLabel: "Quiero el Pro",
    ctaHref: "https://wa.me/50686224228?text=Hola%2C%20me%20interesa%20el%20plan%20Pro%20de%20Lucia%20AI",
    ctaVariant: "primary",
    featured: true,
  },
  {
    name: "Premium",
    price: "$180",
    hook: "Automatización completa",
    items: [
      "Todo lo de los planes anteriores",
      "Múltiples flujos: ventas, soporte y citas",
      "Integraciones avanzadas con APIs y CRM real",
      "Lógica personalizada: reglas, condiciones y segmentación",
      "Soporte prioritario",
      "Optimización continua",
    ],
    fit: "Pensado para negocios con mayor volumen y necesidades más complejas.",
    ctaLabel: "Hablar sobre Premium",
    ctaHref: "mailto:info@getluciachat.com?subject=Interes%20Plan%20Premium",
    ctaVariant: "tertiary",
  },
];

export function PricingSection() {
  return (
    <section className="pricing" id="planes">
      <div className="section-heading">
        <p className="eyebrow">Planes Lucia AI</p>
        <h2>Empieza simple o automatiza tu operación completa.</h2>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <article className={`price-card${plan.featured ? " featured" : ""}`} key={plan.name}>
            {plan.featured ? <div className="featured-badge">Plan principal</div> : null}
            <div className="price-head">
              <p className="plan-name">{plan.name}</p>
              <p className="price">
                {plan.price} <span>/ mes</span>
              </p>
              <p className="plan-hook">{plan.hook}</p>
            </div>
            <ul>
              {plan.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="plan-fit">{plan.fit}</p>
            <a
              className={`button ${plan.ctaVariant}`}
              href={plan.ctaHref}
              target={plan.ctaHref.startsWith("http") ? "_blank" : undefined}
              rel={plan.ctaHref.startsWith("http") ? "noreferrer" : undefined}
            >
              {plan.ctaLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
