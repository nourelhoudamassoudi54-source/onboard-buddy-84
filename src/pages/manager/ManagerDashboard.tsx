import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { StatCard, PageHeader, ProgressBar } from '@/components/shared/DashboardWidgets';
import { mockParcours, mockUsers, mockChartData } from '@/data/mock-data';
import { Users, CheckSquare, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const ManagerDashboard = () => {
  const team = mockUsers.filter(u => u.role === 'SALARIE');

  return (
    <DashboardLayout>
      <PageHeader title="Dashboard Manager" description="Vue d'ensemble de votre équipe" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Membres d'équipe" value={team.length} icon={Users} colorClass="text-manager" />
        <StatCard label="Taux d'avancement" value="58%" icon={TrendingUp} trend="+5% cette semaine" trendUp colorClass="text-manager" />
        <StatCard label="Tâches complétées" value={14} icon={CheckSquare} colorClass="text-salarie" />
        <StatCard label="En retard" value={2} icon={Clock} colorClass="text-destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Progression de l'équipe</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="mois" tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(220,9%,46%)' }} />
              <Tooltip />
              <Bar dataKey="onboardes" fill="hsl(270,67%,47%)" radius={[4, 4, 0, 0]} name="Actifs" />
              <Bar dataKey="termines" fill="hsl(152,69%,40%)" radius={[4, 4, 0, 0]} name="Terminés" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border shadow-card">
          <div className="p-5 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Mon équipe</h3>
          </div>
          <div className="divide-y divide-border">
            {team.map(user => {
              const parcours = mockParcours.find(p => p.salarieId === user.id);
              return (
                <div key={user.id} className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-manager-muted flex items-center justify-center text-xs font-semibold text-manager">
                    {user.prenom[0]}{user.nom[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{user.prenom} {user.nom}</p>
                    <p className="text-xs text-muted-foreground">{user.poste?.titre}</p>
                  </div>
                  {parcours && (
                    <div className="w-20">
                      <ProgressBar value={parcours.progression} colorClass="bg-manager" />
                      <p className="text-xs text-muted-foreground mt-1 text-right">{parcours.progression}%</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
