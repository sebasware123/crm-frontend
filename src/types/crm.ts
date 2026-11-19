export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender: "" | "female" | "male" | "other" | "prefer_not_to_say";
  date_of_birth: string;
  role: "admin" | "member";
  organization_name: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Session {
  user: User;
  organization: Organization;
}

export interface Company {
  id: string;
  organization_id: string;
  name: string;
  website: string | null;
  phone: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  organization_id: string;
  company_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface Deal {
  id: string;
  organization_id: string;
  contact_id: string | null;
  company_id: string | null;
  title: string;
  amount: number;
  stage: "lead" | "qualified" | "proposal" | "won" | "lost";
  expected_close_date: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  organization_id: string;
  deal_id: string | null;
  contact_id: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  status: "pending" | "completed";
  created_at: string;
}

export type CRMRecord = Company | Contact | Deal | Task;
export type ResourceName = "companies" | "contacts" | "deals" | "tasks";

export interface ApiEnvelope<T> {
  data: T;
}

export interface DashboardSummary {
  companies: number;
  contacts: number;
  deals: number;
  open_tasks: number;
  pipeline_by_stage: Record<string, number>;
}

export interface ActivityEvent {
  id: string;
  entity_type: ResourceName;
  entity_id: string;
  action: "created" | "updated" | "deleted";
  entity_label: string;
  actor_name: string;
  created_at: string;
}
