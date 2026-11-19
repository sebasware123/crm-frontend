"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CRMRecord, Company, Contact, Deal, ResourceName } from "@/types/crm";

type DataRow = CRMRecord & Record<string, unknown>;
type Field = { name: string; label: string; type?: "text" | "email" | "tel" | "number" | "date" | "datetime-local" | "textarea" | "select"; required?: boolean; placeholder?: string; relation?: "companies" | "contacts" | "deals"; options?: { label: string; value: string }[] };
type ResourceConfig = { title: string; singular: string; description: string; columns: { key: string; label: string; kind?: "stage" | "status" | "money" | "date" | "relation" }[]; fields: Field[] };
type Relations = { companies: Company[]; contacts: Contact[]; deals: Deal[] };

const configs: Record<ResourceName, ResourceConfig> = {
  companies: {
    title: "Empresas", singular: "empresa", description: "Organiza las compañías y cuentas que forman parte de tu red comercial.",
    columns: [{ key: "name", label: "EMPRESA" }, { key: "website", label: "SITIO WEB" }, { key: "phone", label: "TELÉFONO" }, { key: "created_at", label: "AGREGADA", kind: "date" }],
    fields: [{ name: "name", label: "Nombre de la empresa", required: true, placeholder: "Acme Studio" }, { name: "website", label: "Sitio web", placeholder: "https://acme.com" }, { name: "phone", label: "Teléfono", type: "tel", placeholder: "+57 300 000 0000" }]
  },
  contacts: {
    title: "Contactos", singular: "contacto", description: "Cuida cada relación y mantén los datos de tus contactos siempre a mano.",
    columns: [{ key: "first_name", label: "CONTACTO" }, { key: "company_id", label: "EMPRESA", kind: "relation" }, { key: "email", label: "CORREO" }, { key: "phone", label: "TELÉFONO" }, { key: "created_at", label: "AGREGADO", kind: "date" }],
    fields: [{ name: "first_name", label: "Nombre", required: true, placeholder: "Grace" }, { name: "last_name", label: "Apellido", required: true, placeholder: "Hopper" }, { name: "email", label: "Correo electrónico", type: "email", placeholder: "grace@empresa.com" }, { name: "phone", label: "Teléfono", type: "tel", placeholder: "+57 300 000 0000" }, { name: "company_id", label: "Empresa (opcional)", type: "select", relation: "companies" }]
  },
  deals: {
    title: "Oportunidades", singular: "oportunidad", description: "Haz seguimiento a cada negocio desde el primer contacto hasta el cierre.",
    columns: [{ key: "title", label: "OPORTUNIDAD" }, { key: "contact_id", label: "CONTACTO", kind: "relation" }, { key: "stage", label: "ETAPA", kind: "stage" }, { key: "expected_close_date", label: "CIERRE ESTIMADO", kind: "date" }, { key: "amount", label: "VALOR", kind: "money" }],
    fields: [{ name: "title", label: "Nombre de la oportunidad", required: true, placeholder: "Plan anual · Acme" }, { name: "amount", label: "Valor estimado (USD)", type: "number", placeholder: "12000" }, { name: "stage", label: "Etapa", type: "select", options: [{ label: "Nuevo lead", value: "lead" }, { label: "Calificado", value: "qualified" }, { label: "Propuesta", value: "proposal" }, { label: "Ganado", value: "won" }, { label: "Perdido", value: "lost" }] }, { name: "expected_close_date", label: "Fecha estimada de cierre", type: "date" }, { name: "contact_id", label: "Contacto (opcional)", type: "select", relation: "contacts" }, { name: "company_id", label: "Empresa (opcional)", type: "select", relation: "companies" }]
  },
  tasks: {
    title: "Tareas", singular: "tarea", description: "Convierte tus próximos pasos en acciones concretas y fáciles de seguir.",
    columns: [{ key: "title", label: "TAREA" }, { key: "contact_id", label: "CONTACTO", kind: "relation" }, { key: "status", label: "ESTADO", kind: "status" }, { key: "due_at", label: "FECHA LÍMITE", kind: "date" }, { key: "description", label: "DETALLE" }],
    fields: [{ name: "title", label: "Nombre de la tarea", required: true, placeholder: "Agendar llamada de seguimiento" }, { name: "description", label: "Descripción", type: "textarea", placeholder: "Añade contexto para tu equipo" }, { name: "due_at", label: "Fecha y hora límite", type: "datetime-local" }, { name: "status", label: "Estado", type: "select", options: [{ label: "Pendiente", value: "pending" }, { label: "Completada", value: "completed" }] }, { name: "contact_id", label: "Contacto (opcional)", type: "select", relation: "contacts" }, { name: "deal_id", label: "Oportunidad (opcional)", type: "select", relation: "deals" }]
  }
};

const labels: Record<string, string> = { lead: "Nuevo lead", qualified: "Calificado", proposal: "Propuesta", won: "Ganado", lost: "Perdido", pending: "Pendiente", completed: "Completada" };

export function ResourceManager({ resource, initialItems, relations }: { resource: ResourceName; initialItems: CRMRecord[]; relations?: Relations }) {
  const baseConfig = configs[resource];
  const config: ResourceConfig = { ...baseConfig, fields: baseConfig.fields.map((field) => field.relation ? { ...field, options: [{ label: "Sin asociación", value: "" }, ...(relations?.[field.relation] ?? []).map((record) => ({ label: relationLabel(record), value: record.id }))] } : field) };
  const [items, setItems] = useState<DataRow[]>(initialItems as DataRow[]);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searching, setSearching] = useState(false);
  const [editing, setEditing] = useState<DataRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (query.trim()) params.set("q", query.trim());
      if (resource === "deals" && stageFilter) params.set("stage", stageFilter);
      if (resource === "tasks" && statusFilter) params.set("status", statusFilter);
      setSearching(true);
      try {
        const response = await fetch(`/api/crm/${resource}?${params}`, { signal: controller.signal });
        const payload = await response.json() as { data?: DataRow[]; error?: { message?: string } };
        if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "No se pudieron cargar los resultados.");
        setItems(payload.data);
        setError("");
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "No se pudieron cargar los resultados.");
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, resource, stageFilter, statusFilter]);

  const filtered = useMemo(() => items, [items]);

  async function save(values: Record<string, unknown>) {
    const current = editing;
    const endpoint = `/api/crm/${resource}${current ? `/${current.id}` : ""}`;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(endpoint, { method: current ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const payload = await response.json() as { data?: DataRow; error?: { message?: string } };
      if (!response.ok || !payload.data) { setError(payload.error?.message ?? "No se pudo guardar el registro."); return; }
      setItems((previous) => current ? previous.map((item) => item.id === current.id ? payload.data! : item) : [payload.data!, ...previous]);
      setIsCreating(false); setEditing(null); setNotice(current ? "Cambios guardados." : `${config.singular} creado correctamente.`);
    } catch { setError("No fue posible conectar con el backend."); }
    finally { setBusy(false); }
  }

  async function remove(item: DataRow) {
    if (!window.confirm(`¿Eliminar ${config.singular} “${String(item.title ?? item.name ?? item.first_name)}”?`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/crm/${resource}/${item.id}`, { method: "DELETE" });
      if (!response.ok) { const payload = await response.json() as { error?: { message?: string } }; setError(payload.error?.message ?? "No se pudo eliminar el registro."); return; }
      setItems((previous) => previous.filter((row) => row.id !== item.id)); setNotice(`${config.singular} eliminado.`);
    } catch { setError("No fue posible conectar con el backend."); }
    finally { setBusy(false); }
  }

  return (
    <div className="resource-page">
      <div className="page-heading"><div><span className="eyebrow">GESTIÓN COMERCIAL</span><h1>{config.title}</h1><p>{config.description}</p></div><button className="button button-primary" onClick={() => { setEditing(null); setError(""); setIsCreating(true); }}><span>＋</span> Añadir {config.singular}</button></div>
      <section className="panel resource-panel">
        <div className="resource-toolbar"><div><strong>{items.length} {items.length === 1 ? "registro" : "registros"}</strong><span>{searching ? " · buscando…" : " en tu espacio de trabajo"}</span></div><div className="resource-tools"><label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar ${config.title.toLowerCase()}…`} aria-label={`Buscar ${config.title.toLowerCase()}`} /></label>{resource === "deals" && <label className="filter-select"><span>Etapa</span><select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}><option value="">Todas</option><option value="lead">Nuevo lead</option><option value="qualified">Calificado</option><option value="proposal">Propuesta</option><option value="won">Ganado</option><option value="lost">Perdido</option></select></label>}{resource === "tasks" && <label className="filter-select"><span>Estado</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Todos</option><option value="pending">Pendiente</option><option value="completed">Completada</option></select></label>}{(resource === "contacts" || resource === "deals") && <a className="button button-secondary export-button" href={`/api/crm/${resource}/export?${new URLSearchParams({ ...(query.trim() ? { q: query.trim() } : {}), ...(resource === "deals" && stageFilter ? { stage: stageFilter } : {}) })}`}>Exportar CSV</a>}</div></div>
        {notice && <div className="inline-success" role="status">{notice}</div>}{error && <div className="inline-notice" role="alert">{error}</div>}
        {filtered.length ? <div className="table-wrap"><table className="data-table resource-table"><thead><tr>{config.columns.map((column) => <th key={column.key}>{column.label}</th>)}<th><span className="sr-only">ACCIONES</span></th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}>{config.columns.map((column, index) => <td key={column.key}>{renderCell(item, column.key, column.kind, index === 0, relations)}</td>)}<td className="row-actions"><button type="button" className="table-action" onClick={() => { setEditing(item); setError(""); }} aria-label={`Editar ${config.singular}`}>Editar</button><button type="button" className="table-action danger-action" disabled={busy} onClick={() => void remove(item)} aria-label={`Eliminar ${config.singular}`}>Eliminar</button></td></tr>)}</tbody></table></div> : <div className="empty-panel"><span className="empty-orbit">⌕</span><strong>{query || stageFilter || statusFilter ? "Sin resultados" : `Aún no tienes ${config.title.toLowerCase()}`}</strong><p>{query || stageFilter || statusFilter ? "Ajusta la búsqueda o los filtros." : "Agrega tu primer registro para empezar a organizar tu CRM."}</p>{!query && !stageFilter && !statusFilter && <button className="text-link" onClick={() => setIsCreating(true)}>Crear {config.singular} <span>→</span></button>}</div>}
      </section>
      {(isCreating || editing) && <ResourceDialog config={config} item={editing} busy={busy} onClose={() => { setIsCreating(false); setEditing(null); setError(""); }} onSave={save} error={error} />}
    </div>
  );
}

function relationLabel(item: Company | Contact | Deal) {
  if ("first_name" in item) return `${item.first_name} ${item.last_name}`;
  if ("title" in item) return item.title;
  return item.name;
}

function renderCell(item: DataRow, key: string, kind?: string, primary = false, relations?: Relations) {
  const raw = item[key];
  const value = raw == null || raw === "" ? "—" : String(raw);
  if (primary) {
    const name = key === "first_name" ? `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim() : value;
    const avatar = name.slice(0, 1).toUpperCase();
    return <span className="table-primary-cell"><span className="table-avatar">{avatar}</span><strong>{name}</strong></span>;
  }
  if (kind === "stage" || kind === "status") return <span className={`pill ${kind === "stage" ? `stage-${value}` : `task-${value}`}`}>{labels[value] ?? value}</span>;
  if (kind === "relation") {
    const relation = key === "company_id" ? relations?.companies.find((record) => record.id === raw) : key === "contact_id" ? relations?.contacts.find((record) => record.id === raw) : relations?.deals.find((record) => record.id === raw);
    return <span className={relation ? "" : "muted-cell"}>{relation ? relationLabel(relation) : "—"}</span>;
  }
  if (kind === "money") return <span className="amount-cell">{new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(raw ?? 0))}</span>;
  if (kind === "date") {
    if (!raw) return <span className="muted-cell">Sin fecha</span>;
    const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(date);
  }
  return <span className={raw ? "" : "muted-cell"}>{value}</span>;
}

function ResourceDialog({ config, item, busy, error, onClose, onSave }: { config: ResourceConfig; item: DataRow | null; busy: boolean; error: string; onClose: () => void; onSave: (values: Record<string, unknown>) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values: Record<string, unknown> = {};
    for (const field of config.fields) {
      const value = String(formData.get(field.name) ?? "").trim();
      if (value === "") continue;
      if (field.type === "number") values[field.name] = Number(value);
      else if (field.type === "datetime-local" && value) values[field.name] = new Date(value).toISOString();
      else values[field.name] = value;
    }
    onSave(values);
  }

  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="resource-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className="dialog-heading"><div><span className="eyebrow">{item ? "ACTUALIZAR INFORMACIÓN" : "NUEVO REGISTRO"}</span><h2 id="dialog-title">{item ? `Editar ${config.singular}` : `Añadir ${config.singular}`}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">×</button></div><form className="resource-form" onSubmit={submit}>{config.fields.map((field) => <label key={field.name}>{field.label}{field.type === "textarea" ? <textarea name={field.name} placeholder={field.placeholder} required={field.required} defaultValue={String(item?.[field.name] ?? "")} rows={3} /> : field.type === "select" ? <select name={field.name} defaultValue={String(item?.[field.name] ?? field.options?.[0]?.value ?? "")} required={field.required}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input name={field.name} type={field.type ?? "text"} placeholder={field.placeholder} required={field.required} min={field.type === "number" ? "0" : undefined} step={field.type === "number" ? "0.01" : undefined} defaultValue={field.type === "datetime-local" && item?.[field.name] ? new Date(String(item[field.name])).toISOString().slice(0, 16) : String(item?.[field.name] ?? "")} />}</label>)}{error && <div className="form-alert" role="alert">{error}</div>}<div className="dialog-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancelar</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? "Guardando…" : item ? "Guardar cambios" : "Crear registro"}</button></div></form></section></div>;
}
