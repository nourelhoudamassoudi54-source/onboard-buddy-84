import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/shared/DashboardWidgets';
import { mockUsers } from '@/data/mock-data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const SalarieProfil = () => {
  const user = mockUsers[2]; // Marie Leroy
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <PageHeader title="Mon profil" description="Complétez vos informations personnelles" />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6 shadow-card max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-salarie-muted flex items-center justify-center text-xl font-bold text-salarie">
            {user.prenom[0]}{user.nom[0]}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{user.prenom} {user.nom}</h2>
            <p className="text-sm text-muted-foreground">{user.poste?.titre} · {user.poste?.departement}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Prénom</Label><Input defaultValue={user.prenom} /></div>
            <div className="space-y-2"><Label>Nom</Label><Input defaultValue={user.nom} /></div>
          </div>
          <div className="space-y-2"><Label>Email</Label><Input defaultValue={user.email} type="email" /></div>
          <div className="space-y-2"><Label>Téléphone</Label><Input defaultValue={user.telephone} /></div>
          <div className="space-y-2"><Label>Adresse</Label><Input placeholder="Votre adresse" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Date de naissance</Label><Input type="date" /></div>
            <div className="space-y-2"><Label>Numéro SS</Label><Input placeholder="X XX XX XX XXX XXX XX" /></div>
          </div>

          <Button onClick={() => toast({ title: 'Profil enregistré', description: 'Vos informations ont été mises à jour' })}>
            Enregistrer les modifications
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default SalarieProfil;
