import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RoleType } from '@/types';
import {
  LayoutDashboard, Users, Briefcase, Route, ClipboardList, BarChart3,
  UserCircle, FolderOpen, CheckSquare, LogOut, ChevronLeft, Menu,
  Building2
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navByRole: Record<RoleType, NavItem[]> = {
  ADMIN_RH: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Salariés', path: '/admin/salaries', icon: Users },
    { label: 'Postes', path: '/admin/postes', icon: Briefcase },
    { label: 'Parcours', path: '/admin/parcours', icon: Route },
    { label: 'Suivi RH', path: '/admin/suivi', icon: ClipboardList },
    { label: 'Reporting', path: '/admin/reporting', icon: BarChart3 },
  ],
  MANAGER: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { label: 'Mon équipe', path: '/manager/equipe', icon: Users },
    { label: 'Tâches', path: '/manager/taches', icon: CheckSquare },
    { label: 'Reporting', path: '/manager/reporting', icon: BarChart3 },
  ],
  SALARIE: [
    { label: 'Dashboard', path: '/salarie/dashboard', icon: LayoutDashboard },
    { label: 'Mon parcours', path: '/salarie/parcours', icon: Route },
    { label: 'Mes tâches', path: '/salarie/taches', icon: CheckSquare },
    { label: 'Documents', path: '/salarie/documents', icon: FolderOpen },
    { label: 'Mon profil', path: '/salarie/profil', icon: UserCircle },
  ],
};

const roleConfig: Record<RoleType, { label: string; colorClass: string; bgClass: string }> = {
  ADMIN_RH: { label: 'Admin RH', colorClass: 'text-admin', bgClass: 'bg-admin' },
  MANAGER: { label: 'Manager', colorClass: 'text-manager', bgClass: 'bg-manager' },
  SALARIE: { label: 'Salarié', colorClass: 'text-salarie', bgClass: 'bg-salarie' },
};

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const navItems = navByRole[user.role];
  const config = roleConfig[user.role];

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-30"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", config.bgClass)}>
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-sm font-semibold text-foreground">OnboardPro</p>
                <p className={cn("text-xs font-medium", config.colorClass)}>{config.label}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? cn("bg-accent text-foreground", config.colorClass)
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && config.colorClass)} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-border space-y-2">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors w-full"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!collapsed && <span className="text-xs">Réduire</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main
        className="flex-1 transition-all duration-200"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
          <div>
            <p className="text-sm text-muted-foreground">
              Bienvenue, <span className="font-medium text-foreground">{user.prenom} {user.nom}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn("px-3 py-1 rounded-full text-xs font-medium", config.bgClass, "text-primary-foreground")}>
              {config.label}
            </div>
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground">
              {user.prenom[0]}{user.nom[0]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
