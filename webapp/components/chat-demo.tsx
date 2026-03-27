"use client";

import { useEffect, useRef, useState } from "react";

const chatMessages = [
  {
    author: "client",
    text: "Hola, quiero saber el precio de sus planes.",
  },
  {
    author: "bot",
    text: "Claro. Te puedo recomendar el mejor plan según tu negocio. ¿Buscas solo responder mensajes o también dar seguimiento automático para vender más?",
  },
  {
    author: "client",
    text: "También quiero que me contacten si no responden.",
  },
  {
    author: "bot",
    text: "Entonces el plan Pro te queda ideal: responde WhatsApp, captura leads y hace seguimiento automático para que no pierdas ventas.",
  },
];

export function ChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const resetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (visibleCount >= chatMessages.length) {
      resetTimeoutRef.current = window.setTimeout(() => {
        setVisibleCount(0);
      }, 2200);

      return () => {
        if (resetTimeoutRef.current !== null) {
          window.clearTimeout(resetTimeoutRef.current);
        }
      };
    }

    const revealTimeout = window.setTimeout(() => {
      setVisibleCount((count) => count + 1);
    }, 700);

    return () => {
      window.clearTimeout(revealTimeout);
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [visibleCount]);

  return (
    <div className="chat-demo">
      <div className="chat-header">
        <div>
          <strong>Lucia AI</strong>
          <span>Asistente para WhatsApp</span>
        </div>
        <span className="status-pill">En línea</span>
      </div>

      <div className="chat-messages">
        {chatMessages.map((message, index) => (
          <div
            key={`${message.author}-${index}`}
            className={`message ${message.author} ${index < visibleCount ? "visible" : ""}`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <span>Escribe tu mensaje...</span>
        <div className="typing-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
