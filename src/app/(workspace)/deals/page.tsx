import type { Metadata } from "next";
import { getCRMData } from "@/lib/server/crm";
import { ResourceManager } from "@/features/crm/components/resource-manager";
import type { Company, Contact, Deal } from "@/types/crm";

export const metadata: Metadata = { title: "Oportunidades" };
export default async function DealsPage() {
  const [deals, companies, contacts] = await Promise.all([getCRMData<Deal[]>("deals?limit=100"), getCRMData<Company[]>("companies?limit=100"), getCRMData<Contact[]>("contacts?limit=100")]);
  return <ResourceManager resource="deals" initialItems={deals ?? []} relations={{ companies: companies ?? [], contacts: contacts ?? [], deals: [] }} />;
}
