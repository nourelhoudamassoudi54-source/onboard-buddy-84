import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/shared/DashboardWidgets';
import { mockDocuments } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Download, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const SalarieDocuments = () => {
  const { toast } = useToast();
  const docs = mockDocuments.filter(d => d.salarieId === '3');

  return (
    <DashboardLayout>
      <PageHeader title="Mes documents" description="Gérez vos documents personnels">
        <Button onClick={() => toast({ title: 'Upload', description: 'Fonctionnalité disponible avec le backend' })}>
          <Upload className="w-4 h-4 mr-2" /> Ajouter un document
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc, i) => (
          <motion.div key={doc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-salarie-muted flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-salarie" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.nom}</p>
                <p className="text-xs text-muted-foreground mt-1">{doc.type} · {(doc.taille / 1024).toFixed(1)} Mo</p>
                <p className="text-xs text-muted-foreground">Déposé le {new Date(doc.dateDepot).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1"><Download className="w-3.5 h-3.5 mr-1" /> Télécharger</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default SalarieDocuments;
