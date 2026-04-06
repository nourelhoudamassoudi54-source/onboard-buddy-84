import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader, ProgressBar } from '@/components/shared/DashboardWidgets';
import { mockParcours, mockUsers } from '@/data/mock-data';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSuivi = () => {
  const salaries = mockUsers.filter(u => u.role === 'SALARIE');

  return (
    <DashboardLayout>
      <PageHeader title="Suivi RH" description="Suivez la progression de l'onboarding de chaque salarié" />

      <div className="space-y-4">
        {salaries.map((user, i) => {
          const parcours = mockParcours.find(p => p.salarieId === user.id);
          return (
            <motion.div key={user.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-admin-muted flex items-center justify-center text-sm font-semibold text-admin">
                  {user.prenom[0]}{user.nom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{user.prenom} {user.nom}</p>
                  <p className="text-xs text-muted-foreground">{user.poste?.titre} · {user.poste?.departement}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">{parcours?.intitule || 'Aucun parcours'}</p>
                    {parcours && (
                      <div className="flex items-center gap-2">
                        <ProgressBar value={parcours.progression} className="w-24" colorClass="bg-admin" />
                        <span className="text-xs font-medium text-foreground">{parcours.progression}%</span>
                      </div>
                    )}
                  </div>
                  {parcours && (
                    <div className="flex-shrink-0">
                      {parcours.progression === 100 ? <CheckCircle className="w-5 h-5 text-salarie" />
                        : parcours.progression > 50 ? <Clock className="w-5 h-5 text-chart-4" />
                        : <AlertTriangle className="w-5 h-5 text-destructive" />}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default AdminSuivi;
