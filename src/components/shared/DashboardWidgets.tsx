import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
}

export const StatCard = ({ label, value, icon: Icon, trend, trendUp, colorClass = 'text-primary' }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card rounded-xl p-5 border border-border shadow-card"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {trend && (
          <p className={cn("text-xs mt-1 font-medium", trendUp ? "text-salarie" : "text-destructive")}>
            {trend}
          </p>
        )}
      </div>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-muted", colorClass)}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </motion.div>
);

export const PageHeader = ({ title, description, children }: { title: string; description?: string; children?: ReactNode }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
    {children && <div className="flex gap-2">{children}</div>}
  </div>
);

export const ProgressBar = ({ value, className, colorClass }: { value: number; className?: string; colorClass?: string }) => (
  <div className={cn("w-full bg-muted rounded-full h-2", className)}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={cn("h-full rounded-full", colorClass || "bg-primary")}
    />
  </div>
);

export const StatusBadge = ({ statut }: { statut: string }) => {
  const config: Record<string, string> = {
    EN_COURS: 'bg-primary/10 text-primary',
    TERMINE: 'bg-salarie/10 text-salarie',
    VALIDE: 'bg-salarie/10 text-salarie',
    EN_ATTENTE: 'bg-chart-4/10 text-chart-4',
    REFUSE: 'bg-destructive/10 text-destructive',
    A_FAIRE: 'bg-muted text-muted-foreground',
  };

  const labels: Record<string, string> = {
    EN_COURS: 'En cours',
    TERMINE: 'Terminé',
    VALIDE: 'Validé',
    EN_ATTENTE: 'En attente',
    REFUSE: 'Refusé',
    A_FAIRE: 'À faire',
  };

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", config[statut] || 'bg-muted text-muted-foreground')}>
      {labels[statut] || statut}
    </span>
  );
};
