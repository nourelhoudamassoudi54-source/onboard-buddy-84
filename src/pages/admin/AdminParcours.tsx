import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader, StatusBadge, ProgressBar } from '@/components/shared/DashboardWidgets';
import { mockParcours, mockTaches } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminParcours = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <PageHeader title="Gestion des parcours" description="Gérer les parcours d'onboarding et leurs tâches">
        <Button><Plus className="w-4 h-4 mr-2" /> Nouveau parcours</Button>
      </PageHeader>

      <div className="space-y-4">
        {mockParcours.map((parcours, i) => (
          <motion.div key={parcours.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === parcours.id ? null : parcours.id)}
              className="w-full p-5 flex items-center gap-4 hover:bg-accent/30 transition-colors text-left"
            >
              {expanded === parcours.id ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-semibold text-foreground">{parcours.intitule}</h3>
                  <StatusBadge statut={parcours.statut} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {parcours.salarie?.prenom} {parcours.salarie?.nom} · {parcours.taches?.length || 0} tâches
                </p>
              </div>
              <div className="w-28 flex-shrink-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{parcours.progression}%</span>
                </div>
                <ProgressBar value={parcours.progression} colorClass="bg-admin" />
              </div>
            </button>

            <AnimatePresence>
              {expanded === parcours.id && parcours.taches && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="border-t border-border divide-y divide-border">
                    {parcours.taches.map(tache => (
                      <div key={tache.id} className="px-5 py-3 flex items-center gap-4 pl-12">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          tache.statut === 'TERMINE' ? 'bg-salarie' : tache.statut === 'EN_COURS' ? 'bg-primary' : 'bg-muted-foreground'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{tache.titre}</p>
                          <p className="text-xs text-muted-foreground">Échéance: {new Date(tache.dateEcheance).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <StatusBadge statut={tache.statut} />
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MessageSquare className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminParcours;
