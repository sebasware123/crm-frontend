import type { Metadata } from "next";
import { ActivityFeed } from "@/features/activity/activity-feed";
import { getCRMData } from "@/lib/server/crm";
import type { ActivityEvent } from "@/types/crm";

export const metadata: Metadata = { title: "Actividad" };

export default async function ActivityPage() {
  const events = await getCRMData<ActivityEvent[]>("activity?limit=100");
  return <div className="resource-page">
    <div className="page-heading"><div><span className="eyebrow">SEGUIMIENTO DEL EQUIPO</span><h1>Historial de actividad</h1><p>Consulta quién realizó cambios en los registros de tu espacio de trabajo.</p></div></div>
    {!events && <div className="inline-notice">No se pudo cargar el historial. Comprueba que la migración 002 esté aplicada y que la API esté disponible.</div>}
    <ActivityFeed initialEvents={events ?? []} />
  </div>;
}
