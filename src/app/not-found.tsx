import Link from "next/link";

export default function NotFound() {
  return <main className="not-found"><span className="eyebrow">ERROR 404</span><h1>Esta página tomó otro camino.</h1><p>El enlace no existe o ya no está disponible.</p><Link href="/dashboard" className="button button-primary">Volver al resumen</Link></main>;
}
