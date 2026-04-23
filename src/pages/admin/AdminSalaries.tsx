import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/shared/DashboardWidgets';
import { mockUsers, mockPostes } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal, Mail, UserCheck, UserX, Check, X, FileText, Eye, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useCandidatures, Candidature } from '@/contexts/CandidaturesContext';

const AdminSalaries = () => {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewing, setReviewing] = useState<Candidature | null>(null);
  const { toast } = useToast();
  const { candidatures, validateCandidature, refuseCandidature } = useCandidatures();

  const filtered = mockUsers.filter(u =>
    `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const enAttente = candidatures.filter(c => c.statut === 'EN_ATTENTE_VALIDATION' || c.statut === 'EN_COURS');
  const traitees = candidatures.filter(c => c.statut === 'VALIDE' || c.statut === 'REFUSE');

  const handleValidate = (c: Candidature) => {
    const { email, password } = validateCandidature(c.id);
    setReviewing(null);
    toast({
      title: 'Compte validé ✓',
      description: `Email envoyé à ${email} avec login: ${email} / mot de passe: ${password}`,
    });
  };

  const handleRefuse = (c: Candidature) => {
    refuseCandidature(c.id);
    setReviewing(null);
    toast({ title: 'Candidature refusée', description: `${c.prenom} ${c.nom} a été notifié(e).`, variant: 'destructive' });
  };

  return (
    <DashboardLayout>
      <PageHeader title="Gestion des salariés" description="Créer, valider et gérer les comptes utilisateurs">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Nouveau salarié</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau salarié</DialogTitle></DialogHeader>
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

      <Tabs defaultValue="actifs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="actifs">Salariés actifs</TabsTrigger>
          <TabsTrigger value="attente" className="gap-2">
            En attente
            {enAttente.length > 0 && (
              <Badge variant="secondary" className="bg-admin/10 text-admin">{enAttente.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="historique">Historique ({traitees.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="actifs">
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
        </TabsContent>

        <TabsContent value="attente">
          <div className="bg-card rounded-xl border border-border shadow-card">
            {enAttente.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Aucune candidature en attente.</p>
                <p className="text-xs text-muted-foreground mt-1">Les nouveaux comptes créés depuis la page de connexion apparaîtront ici.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {enAttente.map(c => (
                  <div key={c.id} className="p-5 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-salarie/10 text-salarie flex items-center justify-center text-sm font-semibold">
                          {c.prenom[0]}{c.nom[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{c.prenom} {c.nom}</p>
                          <p className="text-xs text-muted-foreground">{c.email} · {c.posteTitre}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Progress value={c.progression} className="w-40 h-2" />
                            <span className="text-xs font-semibold tabular-nums">{c.progression}%</span>
                            {c.statut === 'EN_ATTENTE_VALIDATION'
                              ? <Badge className="bg-admin/10 text-admin hover:bg-admin/20">Prêt à valider</Badge>
                              : <Badge variant="secondary">En cours</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setReviewing(c)}>
                          <Eye className="w-4 h-4 mr-1.5" /> Voir le dossier
                        </Button>
                        <Button
                          size="sm"
                          disabled={c.statut !== 'EN_ATTENTE_VALIDATION'}
                          onClick={() => handleValidate(c)}
                          className="bg-salarie hover:bg-salarie/90"
                        >
                          <Check className="w-4 h-4 mr-1.5" /> Valider
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRefuse(c)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="historique">
          <div className="bg-card rounded-xl border border-border shadow-card">
            {traitees.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">Aucune candidature traitée pour le moment.</div>
            ) : (
              <div className="divide-y divide-border">
                {traitees.map(c => (
                  <div key={c.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                        {c.prenom[0]}{c.nom[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.prenom} {c.nom}</p>
                        <p className="text-xs text-muted-foreground">{c.email} · {c.posteTitre}</p>
                      </div>
                    </div>
                    <Badge className={c.statut === 'VALIDE' ? 'bg-salarie/10 text-salarie' : 'bg-destructive/10 text-destructive'}>
                      {c.statut === 'VALIDE' ? 'Validé' : 'Refusé'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Review dialog */}
      <Dialog open={!!reviewing} onOpenChange={(o) => !o && setReviewing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {reviewing && (
            <>
              <DialogHeader>
                <DialogTitle>Dossier de {reviewing.prenom} {reviewing.nom}</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-2">
                <div className="flex items-center gap-3">
                  <Progress value={reviewing.progression} className="flex-1 h-2" />
                  <span className="text-sm font-semibold">{reviewing.progression}%</span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Infos personnelles</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-muted/40 rounded"><span className="text-xs text-muted-foreground">Email</span><p>{reviewing.email}</p></div>
                    <div className="p-2 bg-muted/40 rounded"><span className="text-xs text-muted-foreground">Téléphone</span><p>{reviewing.telephone}</p></div>
                    <div className="p-2 bg-muted/40 rounded"><span className="text-xs text-muted-foreground">Date de naissance</span><p>{reviewing.dateNaissance}</p></div>
                    <div className="p-2 bg-muted/40 rounded"><span className="text-xs text-muted-foreground">Adresse</span><p>{reviewing.adresse}</p></div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Poste demandé</h4>
                  <div className="p-3 bg-muted/40 rounded text-sm">{reviewing.posteTitre}</div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Documents ({reviewing.documents.length})</h4>
                  <div className="space-y-1.5">
                    {reviewing.documents.map(d => (
                      <div key={d.nom} className="flex items-center gap-2 p-2 bg-muted/40 rounded text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1">{d.nom}</span>
                        <span className="text-xs text-muted-foreground">{(d.taille / 1024).toFixed(1)} Ko</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Étapes</h4>
                  <div className="space-y-1.5">
                    {reviewing.etapes.map(e => (
                      <div key={e.id} className="flex items-center gap-2 text-sm">
                        {e.termine ? <Check className="w-4 h-4 text-salarie" /> : <X className="w-4 h-4 text-muted-foreground" />}
                        <span className={e.termine ? '' : 'text-muted-foreground'}>{e.titre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2 mt-4">
                <Button variant="outline" onClick={() => handleRefuse(reviewing)}>
                  <X className="w-4 h-4 mr-1.5" /> Refuser
                </Button>
                <Button
                  onClick={() => handleValidate(reviewing)}
                  disabled={reviewing.statut !== 'EN_ATTENTE_VALIDATION'}
                  className="bg-salarie hover:bg-salarie/90"
                >
                  <Mail className="w-4 h-4 mr-1.5" /> Valider et envoyer les identifiants
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminSalaries;
