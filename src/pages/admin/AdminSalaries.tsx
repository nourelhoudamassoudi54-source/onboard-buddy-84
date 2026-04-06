import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader, StatusBadge } from '@/components/shared/DashboardWidgets';
import { mockUsers, mockPostes } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal, Mail, UserCheck, UserX } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const AdminSalaries = () => {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const filtered = mockUsers.filter(u =>
    `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader title="Gestion des salariés" description="Créer, modifier et gérer les comptes utilisateurs">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Nouveau salarié</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau salarié</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Prénom</Label><Input placeholder="Prénom" /></div>
                <div className="space-y-2"><Label>Nom</Label><Input placeholder="Nom" /></div>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="email@company.com" /></div>
              <div className="space-y-2"><Label>Téléphone</Label><Input placeholder="06 12 34 56 78" /></div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select><SelectTrigger><SelectValue placeholder="Sélectionner un rôle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN_RH">Admin RH</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="SALARIE">Salarié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Poste</Label>
                <Select><SelectTrigger><SelectValue placeholder="Sélectionner un poste" /></SelectTrigger>
                  <SelectContent>
                    {mockPostes.map(p => <SelectItem key={p.id} value={p.id}>{p.titre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => { setDialogOpen(false); toast({ title: 'Salarié créé', description: 'Un email d\'invitation a été envoyé' }); }}>
                <Mail className="w-4 h-4 mr-2" /> Créer et envoyer l'invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un salarié..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Salarié', 'Email', 'Rôle', 'Poste', 'Statut', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user, i) => (
                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-accent/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
                        {user.prenom[0]}{user.nom[0]}
                      </div>
                      <span className="text-sm font-medium text-foreground">{user.prenom} {user.nom}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN_RH' ? 'bg-admin/10 text-admin'
                      : user.role === 'MANAGER' ? 'bg-manager/10 text-manager'
                      : 'bg-salarie/10 text-salarie'
                    }`}>
                      {user.role === 'ADMIN_RH' ? 'Admin RH' : user.role === 'MANAGER' ? 'Manager' : 'Salarié'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{user.poste?.titre || '—'}</td>
                  <td className="px-5 py-4">
                    {user.actif
                      ? <span className="inline-flex items-center gap-1 text-xs font-medium text-salarie"><UserCheck className="w-3.5 h-3.5" /> Actif</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><UserX className="w-3.5 h-3.5" /> Inactif</span>
                    }
                  </td>
                  <td className="px-5 py-4">
                    <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSalaries;
