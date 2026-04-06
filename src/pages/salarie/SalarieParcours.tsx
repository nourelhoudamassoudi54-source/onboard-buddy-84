import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader, ProgressBar, StatusBadge } from '@/components/shared/DashboardWidgets';
import { mockParcours, mockTaches } from '@/data/mock-data';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle } from 'lucide-react';

const SalarieParcours = () => {
  const parcours = mockParcours[0];
  const taches = mockTaches.filter(t => t.parcoursId === '1');

  return (
    <DashboardLayout>
      <PageHeader title="Mon parcours" description={parcours.intitule} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
        <div className="flex items-center justify-between mb-2">
          <StatusBadge statut={parcours.statut} />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(parcours.dateDebut).toLocaleDateString('fr-FR')} — {new Date(parcours.dateFin).toLocaleDateString('fr-FR')}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{parcours.description}</p>
        <div className="flex items-center gap-3">
          <ProgressBar value={parcours.progression} className="flex-1" colorClass="bg-salarie" />
          <span className="text-lg font-bold text-foreground">{parcours.progression}%</span>
        </div>
      </motion.div>

      <div className="space-y-3">
        {taches.map((tache, i) => (
          <motion.div key={tache.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card flex items-center gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
              style={{ backgroundColor: tache.termine ? 'hsl(152,69%,40%)' : 'hsl(220,14%,96%)' }}>
              {tache.termine
                ? <CheckCircle className="w-4 h-4 text-salarie-foreground" />
                : <span className="text-xs font-semibold text-muted-foreground">{tache.ordre}</span>}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${tache.termine ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{tache.titre}</p>
              <p className="text-xs text-muted-foreground">{tache.description}</p>
            </div>
            <StatusBadge statut={tache.statut} />
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default SalarieParcours;
