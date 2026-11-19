import Link from "next/link";
import type { Metadata } from "next";
import { getCRMData } from "@/lib/server/crm";
import type { DashboardSummary, Deal } from "@/types/crm";

export const metadata: Metadata = { title: "Resumen" };

const stageLabels: Record<string, string> = { lead: "Nuevo lead", qualified: "Calificado", proposal: "Propuesta", won: "Ganado", lost: "Perdido" };
const stageColors: Record<string, string> = { lead: "#93a6fa", qualified: "#6f84e8", proposal: "#8c6ce8", won: "#29a982", lost: "#e38d83" };

function money(value: number) { return new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value); }

export default async function DashboardPage() {
  const [summary, recentDeals] = await Promise.all([
    getCRMData<DashboardSummary>("dashboard"),
    getCRMData<Deal[]>("deals?limit=5")
  ]);
  const stats = summary ?? { companies: 0, contacts: 0, deals: 0, open_tasks: 0, pipeline_by_stage: {} };
  const recentDealItems = recentDeals ?? [];
  const today = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Bogota" }).format(new Date()).toUpperCase();
  const pipeline = Object.entries(stats.pipeline_by_stage ?? {}).sort((a, b) => Number(b[1]) - Number(a[1]));
  const pipelineTotal = pipeline.reduce((total, [, amount]) => total + Number(amount), 0);

  return (
    <div className="dashboard-page">
      <div className="page-heading dashboard-heading"><div><span className="eyebrow">{today}</span><h1>Tu negocio, en perspectiva<span className="heading-spark">✦</span></h1><p>Una mirada clara a lo que pasa en tu espacio comercial.</p></div><Link className="button button-primary" href="/deals"><span>＋</span> Nueva oportunidad</Link></div>
      {!summary && <div className="inline-notice">No logramos cargar las métricas. Verifica que la API esté disponible.</div>}
      <section className="metric-grid" aria-label="Métricas del CRM">
        <Metric label="Oportunidades registradas" value={stats.deals} detail="En todo el pipeline" icon="↗" tint="violet" />
        <Metric label="Valor del pipeline" value={money(pipelineTotal)} detail="Suma de oportunidades" icon="$" tint="blue" />
        <Metric label="Contactos" value={stats.contacts} detail="Relaciones registradas" icon="♙" tint="mint" />
        <Metric label="Tareas pendientes" value={stats.open_tasks} detail="Por completar" icon="☷" tint="peach" />
      </section>
      <section className="dashboard-grid">
        <div className="panel pipeline-panel"><div className="panel-heading"><div><h2>Pipeline comercial</h2><p>Valor agrupado por etapa</p></div><Link href="/deals" className="text-link">Ver oportunidades <span>→</span></Link></div>
          {pipeline.length ? <div className="pipeline-content"><div className="pipeline-total"><strong>{money(pipelineTotal)}</strong><span>valor total</span></div><div className="pipeline-bars">{pipeline.map(([stage, amount]) => <div className="pipeline-row" key={stage}><div className="pipeline-label"><span className="stage-dot" style={{ backgroundColor: stageColors[stage] ?? "#93a6fa" }} />{stageLabels[stage] ?? stage}<strong>{money(Number(amount))}</strong></div><div className="pipeline-track"><span style={{ width: `${pipelineTotal ? Math.max(4, Number(amount) / pipelineTotal * 100) : 0}%`, backgroundColor: stageColors[stage] ?? "#93a6fa" }} /></div></div>)}</div></div> : <EmptyPanel title="Tu pipeline empieza aquí" text="Crea una oportunidad y sigue su avance desde un solo lugar." href="/deals" action="Crear oportunidad" />}
        </div>
        <div className="panel focus-panel"><div className="panel-heading"><div><h2>Enfoque de hoy</h2><p>Lo que merece tu atención</p></div><span className="focus-icon">✦</span></div><div className="focus-item"><span className="focus-number">01</span><div><strong>{stats.open_tasks} tareas pendientes</strong><p>Avanza una cosa importante a la vez.</p></div></div><div className="focus-item"><span className="focus-number">02</span><div><strong>{stats.contacts} relaciones activas</strong><p>Un buen seguimiento abre puertas.</p></div></div><Link className="focus-cta" href="/tasks">Ir a mis tareas <span>→</span></Link></div>
      </section>
      <section className="panel recent-panel"><div className="panel-heading"><div><h2>Oportunidades recientes</h2><p>Movimientos nuevos en tu equipo</p></div><Link href="/deals" className="text-link">Ver todas <span>→</span></Link></div>
          {recentDealItems.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>OPORTUNIDAD</th><th>ETAPA</th><th>FECHA DE CIERRE</th><th className="align-right">VALOR</th></tr></thead><tbody>{recentDealItems.map((deal) => <tr key={deal.id}><td><span className="deal-avatar">{deal.title.slice(0, 1).toUpperCase()}</span><strong>{deal.title}</strong></td><td><span className={`pill stage-${deal.stage}`}>{stageLabels[deal.stage] ?? deal.stage}</span></td><td>{deal.expected_close_date ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(`${deal.expected_close_date}T12:00:00`)) : "Sin fecha"}</td><td className="align-right amount-cell">{money(Number(deal.amount))}</td></tr>)}</tbody></table></div> : <EmptyPanel title="Todavía no hay oportunidades" text="Cuando registres una, aparecerá aquí para que puedas seguirla." href="/deals" action="Añadir oportunidad" />}
      </section>
      <div className="dashboard-footnote"><span className="status-dot" /> Datos sincronizados con tu espacio de trabajo</div>
    </div>
  );
}

function Metric({ label, value, detail, icon, tint }: { label: string; value: string | number; detail: string; icon: string; tint: string }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tint}`}>{icon}</span></div><strong className="metric-value">{value}</strong><div className="metric-detail"><span className="metric-trend">↗</span>{detail}</div></article>;
}

function EmptyPanel({ title, text, href, action }: { title: string; text: string; href: string; action: string }) {
  return <div className="empty-panel"><span className="empty-orbit">✦</span><strong>{title}</strong><p>{text}</p><Link href={href} className="text-link">{action} <span>→</span></Link></div>;
}
