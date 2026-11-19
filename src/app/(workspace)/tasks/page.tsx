import type { Metadata } from "next";
import { getCRMData } from "@/lib/server/crm";
import { ResourceManager } from "@/features/crm/components/resource-manager";
import type { Contact, Deal, Task } from "@/types/crm";

export const metadata: Metadata = { title: "Tareas" };
export default async function TasksPage() {
  const [tasks, deals, contacts] = await Promise.all([getCRMData<Task[]>("tasks?limit=100"), getCRMData<Deal[]>("deals?limit=100"), getCRMData<Contact[]>("contacts?limit=100")]);
  return <ResourceManager resource="tasks" initialItems={tasks ?? []} relations={{ companies: [], contacts: contacts ?? [], deals: deals ?? [] }} />;
}
