"use client";

export default function WorkspaceError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="panel error-state"><span className="empty-orbit">!</span><h2>No pudimos validar tu sesión</h2><p>El servicio no está disponible temporalmente. Tu sesión no se cerró; vuelve a intentarlo en unos segundos.</p><button className="button button-primary" onClick={reset}>Intentar de nuevo</button></div>;
}
