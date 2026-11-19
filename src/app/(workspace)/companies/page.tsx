import type { Metadata } from "next";
import { getCRMData } from "@/lib/server/crm";
import { ResourceManager } from "@/features/crm/components/resource-manager";
import type { Company } from "@/types/crm";

export const metadata: Metadata = { title: "Empresas" };
export default async function CompaniesPage() { const companies = await getCRMData<Company[]>("companies?limit=100"); return <ResourceManager resource="companies" initialItems={companies ?? []} />; }
