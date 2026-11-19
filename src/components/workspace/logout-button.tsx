"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }
  return <button type="button" className="icon-button user-menu-button" onClick={signOut} aria-label="Cerrar sesión" title="Cerrar sesión">↪</button>;
}
