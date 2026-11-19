"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/crm";

const genderLabels: Record<UserProfile["gender"], string> = {
  "": "Prefiero no indicarlo",
  female: "Mujer",
  male: "Hombre",
  other: "Otro",
  prefer_not_to_say: "Prefiero no decirlo"
};

export function ProfileForm({ initialProfile }: { initialProfile: UserProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/crm/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? "").trim(),
          gender: String(form.get("gender") ?? ""),
          date_of_birth: String(form.get("date_of_birth") ?? ""),
          role: String(form.get("role") ?? profile.role)
        })
      });
      const payload = await response.json() as { data?: Partial<UserProfile>; error?: { message?: string } };
      if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "No se pudo guardar el perfil.");
      setProfile((current) => ({ ...current, ...payload.data }));
      setNotice("Perfil actualizado correctamente.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible conectar con el servidor.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="panel profile-panel">
    <div className="profile-card-heading"><span className="avatar profile-avatar">{profile.name.slice(0, 1).toUpperCase()}</span><div><h2>{profile.name}</h2><p>{profile.email}</p></div></div>
    <form className="profile-form" onSubmit={save}>
      <label>Nombre completo<input name="name" type="text" required maxLength={100} defaultValue={profile.name} /></label>
      <label>Correo electrónico<input type="email" value={profile.email} readOnly /><small>El correo se utiliza para iniciar sesión y no se puede cambiar aquí.</small></label>
      <label>Sexo<select name="gender" defaultValue={profile.gender}>{Object.entries(genderLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Fecha de nacimiento<input name="date_of_birth" type="date" max={new Date().toISOString().slice(0, 10)} defaultValue={profile.date_of_birth} /></label>
      <label>Rol en {profile.organization_name}<select name="role" defaultValue={profile.role} disabled={profile.role !== "admin"}><option value="admin">Administrador</option><option value="member">Miembro</option></select><small>{profile.role === "admin" ? "Solo un administrador puede cambiar el rol. La organización debe conservar al menos uno." : "Solo un administrador puede cambiar los roles de la organización."}</small></label>
      {notice && <p className="inline-success" role="status">{notice}</p>}{error && <p className="inline-notice" role="alert">{error}</p>}
      <div className="profile-actions"><button className="button button-primary" type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</button></div>
    </form>
  </section>;
}
