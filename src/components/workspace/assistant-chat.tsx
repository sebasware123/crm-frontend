"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Message = { role: "user" | "model"; text: string };
type ChatResponse = { data?: { answer?: string }; error?: { message?: string } };

const screenNames: Record<string, string> = {
  dashboard: "Resumen",
  companies: "Empresas",
  contacts: "Contactos",
  deals: "Oportunidades",
  tasks: "Tareas",
  activity: "Actividad"
};

const suggestions: Record<string, string[]> = {
  dashboard: ["Resume mi pipeline", "¿Cuántas tareas están pendientes?"],
  companies: ["Resume las empresas registradas", "¿Qué información puedo organizar aquí?"],
  contacts: ["Resume mis contactos", "¿Qué empresas tienen contactos asociados?"],
  deals: ["Resume mis oportunidades", "¿Qué etapa concentra más valor?"],
  tasks: ["Resume mis tareas pendientes", "¿Qué puedo priorizar hoy?"],
  activity: ["Resume la actividad reciente", "¿Qué tipos de cambios se registran?"]
};

export function AssistantChat() {
  const pathname = usePathname();
  const route = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  const screen = screenNames[route] ? route : "dashboard";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  async function sendMessage(suggestedText?: string) {
    const message = (suggestedText ?? text).trim();
    if (!message || sending) return;
    const history = messages.slice(-8);
    setMessages((current) => [...current, { role: "user", text: message }]);
    setText("");
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/crm/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screen, message, history })
      });
      const payload = await response.json() as ChatResponse;
      if (!response.ok || !payload.data?.answer) throw new Error(payload.error?.message ?? "El asistente no pudo responder.");
      setMessages((current) => [...current, { role: "model", text: payload.data!.answer! }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible conectar con el asistente.");
    } finally {
      setSending(false);
    }
  }

  return <div className="assistant-widget">
    {open && <section className="assistant-panel" role="dialog" aria-label="Asistente de Nexo CRM" aria-modal="false">
      <header className="assistant-header"><span className="assistant-avatar" aria-hidden="true">✦</span><div><strong>Asistente Nexo</strong><small>Contexto: {screenNames[screen]}</small></div><button type="button" className="assistant-close" onClick={() => setOpen(false)} aria-label="Cerrar asistente">×</button></header>
      <div className="assistant-privacy">El contexto de esta sección y tus mensajes se envían a Gemini Free; Google puede usarlos para mejorar sus productos. Usa datos demo, no información real o sensible.</div>
      <div className="assistant-messages" aria-live="polite">
        {!messages.length && <div className="assistant-welcome"><span>✦</span><strong>¿En qué te ayudo?</strong><p>Puedo responder sobre la sección actual y sus datos.</p><div className="assistant-suggestions">{suggestions[screen].map((suggestion) => <button type="button" key={suggestion} disabled={sending} onClick={() => void sendMessage(suggestion)}>{suggestion}</button>)}</div></div>}
        {messages.map((message, index) => <div className={`assistant-message assistant-message-${message.role}`} key={`${index}-${message.role}`}><span>{message.text}</span></div>)}
        {sending && <div className="assistant-typing" role="status">Pensando…</div>}
        {error && <div className="assistant-error" role="alert">{error}</div>}
        <div ref={endRef} />
      </div>
      <form className="assistant-form" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}><textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Escribe tu pregunta…" aria-label="Escribe tu pregunta" maxLength={1000} rows={2} disabled={sending} /><button type="submit" disabled={sending || !text.trim()} aria-label="Enviar mensaje">↑</button></form>
      <div className="assistant-footer">Las respuestas pueden contener errores.</div>
    </section>}
    <button type="button" className={`assistant-launcher${open ? " is-open" : ""}`} onClick={() => setOpen((current) => !current)} aria-label={open ? "Cerrar asistente" : "Abrir asistente de Nexo CRM"} aria-expanded={open}><span aria-hidden="true">{open ? "×" : "✦"}</span>{!open && <span className="assistant-launcher-label">Asistente</span>}</button>
  </div>;
}
