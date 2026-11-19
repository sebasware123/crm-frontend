import { requireSession } from "@/lib/server/session";
import { Sidebar } from "@/components/workspace/sidebar";
import { LogoutButton } from "@/components/workspace/logout-button";
import { AssistantChat } from "@/components/workspace/assistant-chat";

export default async function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();
  return (
    <div className="app-shell">
      <Sidebar organizationName={session.organization.name} />
      <div className="app-main">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">n</span> nexo<span className="brand-dot">.</span></div>
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-sep">/</span><strong>{session.organization.name}</strong></div>
          <div className="topbar-actions"><div className="topbar-user"><span className="avatar">{session.user.name.slice(0, 1).toUpperCase()}</span><span className="topbar-user-copy"><strong>{session.user.name}</strong><small>Tu cuenta</small></span><LogoutButton /></div></div>
        </header>
        <main className="page-content">{children}</main>
      </div>
      <AssistantChat />
    </div>
  );
}
