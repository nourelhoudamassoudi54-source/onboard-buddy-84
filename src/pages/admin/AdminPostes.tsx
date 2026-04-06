import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/shared/DashboardWidgets';
import { mockPostes } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Building } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const AdminPostes = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <PageHeader title="Gestion des postes" description="Créer et gérer les postes de l'entreprise">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Nouveau poste</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau poste</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Titre</Label><Input placeholder="Titre du poste" /></div>
              <div className="space-y-2"><Label>Département</Label><Input placeholder="Département" /></div>
              <div className="space-y-2"><Label>Description</Label><Input placeholder="Description du poste" /></div>
              <Button className="w-full" onClick={() => { setDialogOpen(false); toast({ title: 'Poste créé' }); }}>Créer le poste</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockPostes.map((poste, i) => (
          <motion.div key={poste.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-admin-muted flex items-center justify-center">
                <Building className="w-5 h-5 text-admin" />
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{poste.titre}</h3>
            <p className="text-xs text-muted-foreground mb-3">{poste.description}</p>
            <span className="text-xs font-medium text-admin bg-admin-muted px-2.5 py-1 rounded-full">{poste.departement}</span>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminPostes;
