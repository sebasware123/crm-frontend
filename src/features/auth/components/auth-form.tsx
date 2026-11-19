"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type Props = { mode: "login" | "register" };
type ApiError = { error?: { message?: string } };

export function AuthForm({ mode }: Props) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = (await response.json()) as ApiError;
      if (!response.ok) {
        setError(payload.error?.message ?? "No pudimos completar la solicitud.");
        return;
      }
      window.location.replace("/dashboard");
    } catch {
      setError("No fue posible conectar con el servidor. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card-wrap">
      <div className="auth-card-heading">
        <span className="eyebrow">TU ESPACIO DE TRABAJO</span>
        <h2>{isRegister ? "Empieza con Nexo" : "Qué bueno verte de nuevo"}</h2>
        <p>{isRegister ? "Crea tu espacio y organiza tus relaciones comerciales." : "Ingresa tus datos para continuar con tu equipo."}</p>
      </div>
      <form className="auth-form" method="post" action={`/api/auth/${mode}`} onSubmit={handleSubmit}>
        {isRegister && <label>Tu nombre<input name="name" autoComplete="name" placeholder="Alex Morgan" defaultValue="Recruiter Demo" required minLength={2} /></label>}
        <label>Correo electrónico<input name="email" type="email" autoComplete="email" placeholder="tu@empresa.com" defaultValue="recruiter.demo@nexocrm.dev" required /></label>
        <label>Contraseña<input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} placeholder="Mínimo 8 caracteres" defaultValue="NexoDemo2026!" required minLength={8} maxLength={72} /></label>
        {isRegister && <label>Nombre del espacio de trabajo<input name="organization_name" placeholder="Acme Studio" defaultValue="Nexo Demo" required minLength={2} /></label>}
        {error && <div role="alert" className="form-alert">{error}</div>}
        <button className="button button-primary button-wide" type="submit" disabled={busy}>
          {busy ? "Un momento…" : isRegister ? "Crear cuenta" : "Iniciar sesión"}<span aria-hidden="true">→</span>
        </button>
      </form>
      {!isRegister && <p className="demo-account-note">Primera vez: crea esta cuenta demo desde <Link href="/register">Crear tu espacio</Link>. Luego podrás iniciar sesión con estos datos.</p>}
      <p className="auth-switch">{isRegister ? "¿Ya tienes cuenta?" : "¿Nuevo en Nexo?"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Inicia sesión" : "Crea tu espacio"}</Link></p>
      <p className="auth-legal">Al continuar, aceptas nuestros términos de servicio y política de privacidad.</p>
    </div>
  );
}
