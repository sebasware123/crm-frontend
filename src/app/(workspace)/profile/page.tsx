import type { Metadata } from "next";
import { ProfileForm } from "@/features/profile/profile-form";
import { getCRMData } from "@/lib/server/crm";
import type { UserProfile } from "@/types/crm";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const profile = await getCRMData<UserProfile>("profile");
  return <div className="resource-page profile-page">
    <div className="page-heading"><div><span className="eyebrow">TU CUENTA</span><h1>Perfil</h1><p>Administra tus datos personales y consulta tu rol en el espacio de trabajo.</p></div></div>
    {profile ? <ProfileForm initialProfile={profile} /> : <div className="inline-notice">No pudimos cargar tu perfil. Comprueba que la migración 003 esté aplicada y que la API esté disponible.</div>}
  </div>;
}
