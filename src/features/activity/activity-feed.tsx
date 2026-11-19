"use client";

import { useEffect, useState } from "react";
import type { ActivityEvent, ResourceName } from "@/types/crm";

const entityLabels: Record<ResourceName, string> = { companies: "Empresa", contacts: "Contacto", deals: "Oportunidad", tasks: "Tarea" };
const actionLabels: Record<ActivityEvent["action"], string> = { created: "creó", updated: "actualizó", deleted: "eliminó" };

export function ActivityFeed({ initialEvents }: { initialEvents: ActivityEvent[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ limit: "100" });
    if (entity) params.set("entity_type", entity);
    if (action) params.set("action", action);
    fetch(`/api/crm/activity?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { data?: ActivityEvent[]; error?: { message?: string } };
        if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "No se pudo cargar el historial.");
        setEvents(payload.data);
        setError("");
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "No se pudo cargar el historial.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [entity, action]);

  return <section className="panel activity-panel">
    <div className="activity-toolbar">
      <div><strong>{loading ? "Actualizando…" : `${events.length} actividades`}</strong><span> · últimos movimientos del espacio de trabajo</span></div>
      <div className="resource-tools">
        <label className="filter-select"><span>Tipo</span><select value={entity} onChange={(event) => { setLoading(true); setEntity(event.target.value); }}><option value="">Todos</option><option value="companies">Empresas</option><option value="contacts">Contactos</option><option value="deals">Oportunidades</option><option value="tasks">Tareas</option></select></label>
        <label className="filter-select"><span>Acción</span><select value={action} onChange={(event) => { setLoading(true); setAction(event.target.value); }}><option value="">Todas</option><option value="created">Creaciones</option><option value="updated">Actualizaciones</option><option value="deleted">Eliminaciones</option></select></label>
      </div>
    </div>
    {error && <div className="inline-notice" role="alert">{error}</div>}
    {events.length ? <ol className="activity-list">{events.map((event) => <li key={event.id}>
      <span className={`activity-mark activity-${event.action}`} aria-hidden="true">{event.action === "created" ? "+" : event.action === "updated" ? "↻" : "−"}</span>
      <div className="activity-copy"><p><strong>{event.actor_name}</strong> {actionLabels[event.action]} {entityLabels[event.entity_type].toLowerCase()} <strong>{event.entity_label}</strong></p><span>{entityLabels[event.entity_type]} · {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.created_at))}</span></div>
    </li>)}</ol> : <div className="empty-panel"><strong>No hay actividad para mostrar</strong><p>Los cambios que realices en el CRM aparecerán aquí.</p></div>}
  </section>;
}
