import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { StatCard, PageHeader, ProgressBar, StatusBadge } from '@/components/shared/DashboardWidgets';
import { mockParcours, mockTaches, mockDocuments } from '@/data/mock-data';
import { Route, CheckSquare, FileText, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const SalarieDashboard = () => {
  const parcours = mockParcours[0];
  const taches = mockTaches.filter(t => t.parcoursId === '1');
  const done = taches.filter(t => t.termine).length;

  return (
    <DashboardLayout>
      <PageHeader title="Mon espace" description="Bienvenue dans votre espace d'onboarding" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Mon parcours" value={`${parcours.progression}%`} icon={Route} colorClass="text-salarie" />
        <StatCard label="Tâches complétées" value={`${done}/${taches.length}`} icon={CheckSquare} colorClass="text-salarie" />
        <StatCard label="Documents déposés" value={3} icon={FileText} colorClass="text-primary" />
        <StatCard label="Jours restants" value={12} icon={Clock} colorClass="text-chart-4" />
      </div>

      {/* Current parcours */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{parcours.intitule}</h3>
            <p className="text-xs text-muted-foreground mt-1">{parcours.description}</p>
          </div>
          <StatusBadge statut={parcours.statut} />
        </div>
        <div className="flex items-center gap-3">
          <ProgressBar value={parcours.progression} className="flex-1" colorClass="bg-salarie" />
          <span className="text-sm font-bold text-foreground">{parcours.progression}%</span>
        </div>
      </motion.div>

      {/* Tasks preview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Mes prochaines tâches</h3>
        </div>
        <div className="divide-y divide-border">
          {taches.filter(t => !t.termine).slice(0, 3).map(tache => (
            <div key={tache.id} className="p-4 flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                tache.statut === 'EN_COURS' ? 'bg-salarie' : 'bg-muted-foreground'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-foreground">{tache.titre}</p>
                <p className="text-xs text-muted-foreground">Échéance: {new Date(tache.dateEcheance).toLocaleDateString('fr-FR')}</p>
              </div>
              <StatusBadge statut={tache.statut} />
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default SalarieDashboard;
