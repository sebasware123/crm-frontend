"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Resumen", icon: "◫" },
  { href: "/contacts", label: "Contactos", icon: "♙" },
  { href: "/companies", label: "Empresas", icon: "▦" },
  { href: "/deals", label: "Oportunidades", icon: "↗" },
  { href: "/tasks", label: "Tareas", icon: "☷" },
  { href: "/activity", label: "Actividad", icon: "◷" },
  { href: "/profile", label: "Perfil", icon: "◎" }
];

export function Sidebar({ organizationName }: { organizationName: string }) {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="brand"><span className="brand-mark">n</span><span>nexo<span className="brand-dot">.</span></span></Link>
      <div className="workspace-switcher"><span className="workspace-icon">{organizationName.slice(0, 1).toUpperCase()}</span><span className="workspace-name"><small>ESPACIO DE TRABAJO</small><strong>{organizationName}</strong></span><span className="chevron">⌄</span></div>
      <span className="nav-caption">MENÚ PRINCIPAL</span>
      <nav className="main-nav" aria-label="Navegación principal">
        {links.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return <Link className={`nav-link${active ? " active" : ""}`} href={item.href} key={item.href} aria-current={active ? "page" : undefined}><span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}</Link>;
        })}
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-spark">✦</span><strong>¿Necesitas una mano?</strong><p>Revisa tus próximos pasos y mantén el ritmo.</p><Link href="/tasks" className="help-link">Ir a mis tareas <span>→</span></Link></div><div className="sidebar-version"><span className="status-dot" /> Todos los sistemas operativos</div></div>
    </aside>
  );
}
