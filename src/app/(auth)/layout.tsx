import Link from "next/link";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="auth-layout">
      <section className="auth-aside">
        <Link className="brand brand-light" href="/login"><span className="brand-mark">n</span><span>nexo<span className="brand-dot">.</span></span></Link>
        <div className="auth-pitch">
          <span className="eyebrow eyebrow-light">RELATIONSHIPS, IN FOCUS</span>
          <h1>Construye relaciones que mueven tu negocio.</h1>
          <p>Todo tu proceso comercial, conectado en un espacio pensado para avanzar.</p>
          <div className="auth-quote"><span className="quote-mark">“</span><p>Una vista más clara. Mejores conversaciones. Un equipo que sabe qué sigue.</p><small>NEXO CRM · SALES WORKSPACE</small></div>
        </div>
        <span className="auth-footer">© 2026 Nexo CRM · Hecho para equipos que crecen</span>
      </section>
      <section className="auth-main"><div className="auth-mobile-brand"><span className="brand-mark">n</span> nexo<span className="brand-dot">.</span></div>{children}</section>
    </main>
  );
}
