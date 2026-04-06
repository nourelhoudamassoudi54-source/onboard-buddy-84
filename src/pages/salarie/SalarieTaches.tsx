import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader, StatusBadge } from '@/components/shared/DashboardWidgets';
import { mockTaches } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const SalarieTaches = () => {
  const [taches, setTaches] = useState(mockTaches.filter(t => t.parcoursId === '1'));
  const { toast } = useToast();

  const toggleTask = (id: string) => {
    setTaches(prev => prev.map(t => t.id === id ? { ...t, termine: !t.termine, statut: t.termine ? 'EN_COURS' as const : 'TERMINE' as const } : t));
    toast({ title: 'Tâche mise à jour' });
  };

  return (
    <DashboardLayout>
      <PageHeader title="Mes tâches" description="Consultez et complétez vos tâches d'onboarding" />

      <div className="space-y-3">
        {taches.map((tache, i) => (
          <motion.div key={tache.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card flex items-start gap-4">
            <Checkbox checked={tache.termine} onCheckedChange={() => toggleTask(tache.id)} className="mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${tache.termine ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{tache.titre}</p>
              <p className="text-xs text-muted-foreground mt-1">{tache.description}</p>
              <p className="text-xs text-muted-foreground mt-2">Échéance: {new Date(tache.dateEcheance).toLocaleDateString('fr-FR')}</p>
            </div>
            <StatusBadge statut={tache.statut} />
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default SalarieTaches;
