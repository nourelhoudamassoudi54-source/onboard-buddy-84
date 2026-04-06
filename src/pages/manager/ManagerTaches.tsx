import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader, StatusBadge } from '@/components/shared/DashboardWidgets';
import { mockTaches } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const ManagerTaches = () => {
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <PageHeader title="Tâches de l'équipe" description="Consulter et valider les tâches de vos salariés" />

      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="divide-y divide-border">
          {mockTaches.map((tache, i) => (
            <motion.div key={tache.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="p-5 flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                tache.statut === 'TERMINE' ? 'bg-salarie' : tache.statut === 'EN_COURS' ? 'bg-manager' : 'bg-muted-foreground'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{tache.titre}</p>
                <p className="text-xs text-muted-foreground">{tache.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Échéance: {new Date(tache.dateEcheance).toLocaleDateString('fr-FR')}</p>
              </div>
              <StatusBadge statut={tache.statut} />
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><MessageSquare className="w-3.5 h-3.5" /></Button>
                {tache.statut !== 'TERMINE' && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-salarie" onClick={() => toast({ title: 'Tâche validée' })}>
                    <CheckCircle className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerTaches;
