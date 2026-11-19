import type { Metadata } from "next";
import { getCRMData } from "@/lib/server/crm";
import { ResourceManager } from "@/features/crm/components/resource-manager";
import type { Company, Contact } from "@/types/crm";

export const metadata: Metadata = { title: "Contactos" };
export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([getCRMData<Contact[]>("contacts?limit=100"), getCRMData<Company[]>("companies?limit=100")]);
  return <ResourceManager resource="contacts" initialItems={contacts ?? []} relations={{ companies: companies ?? [], contacts: [], deals: [] }} />;
}
