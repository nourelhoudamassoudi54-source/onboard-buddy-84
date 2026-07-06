import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppRole } from "@/lib/types";
import { ROLE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";
import {
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  Users,
  Tags,
  CalendarClock,
  UserCircle,
  LogOut,
  Menu,
  X,
  Landmark,
  Inbox,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const NAV: Record<AppRole, NavItem[]> = {
  client: [
    { label: "Tableau de bord", path: "/client/dashboard", icon: LayoutDashboard },
    { label: "Nouvelle réclamation", path: "/client/nouvelle", icon: FilePlus2 },
    { label: "Mes réclamations", path: "/client/reclamations", icon: ClipboardList },
    { label: "Mon profil", path: "/profil", icon: UserCircle },
  ],
  agent: [
    { label: "Tableau de bord", path: "/agent/dashboard", icon: LayoutDashboard },
    { label: "Réclamations affectées", path: "/agent/dashboard", icon: Inbox },
    { label: "Calendrier SLA", path: "/agent/calendrier", icon: CalendarClock },
    { label: "Mon profil", path: "/profil", icon: UserCircle },
  ],
  admin: [
    { label: "Tableau de bord", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Réclamations", path: "/admin/reclamations", icon: ClipboardList },
    { label: "Utilisateurs", path: "/admin/utilisateurs", icon: Users },
    { label: "Catégories", path: "/admin/categories", icon: Tags },
    { label: "Mon profil", path: "/profil", icon: UserCircle },
  ],
};

export function AppLayout({
  children,
  title,
  description,
  actions,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}) {
  const { profile, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!role) return null;
  const nav = NAV[role];
  const initials =
    `${profile?.prenom?.[0] ?? ""}${profile?.nom?.[0] ?? ""}`.toUpperCase() || "?";

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Landmark className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div className="leading-tight">
          <p className="text-base font-bold text-sidebar-accent-foreground">ReclamBank</p>
          <p className="text-[11px] font-medium text-sidebar-primary">
            {ROLE_CONFIG[role].label}
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item, i) => {
          const active =
            location.pathname === item.path ||
            (item.path !== "/profil" && location.pathname.startsWith(item.path + "/"));
          return (
            <Link
              key={`${item.path}-${i}`}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => {
            logout();
            navigate("/auth");
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col bg-sidebar md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-navy-deep/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-sidebar">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <p className="hidden text-sm text-muted-foreground sm:block">
              Bonjour,{" "}
              <span className="font-semibold text-foreground">
                {profile?.prenom} {profile?.nom}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link
              to="/profil"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-primary-foreground"
            >
              {initials}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {(title || actions) && (
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
