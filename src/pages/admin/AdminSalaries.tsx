import { useMemo, useState } from 'react';
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

const statutBadge = (s: Candidature['statut']) => {
  switch (s) {
    case 'EN_COURS': return <Badge variant="secondary">En cours</Badge>;
    case 'EN_ATTENTE_VALIDATION': return <Badge className="bg-admin/10 text-admin hover:bg-admin/20">Prêt à valider</Badge>;
    case 'VALIDE': return <Badge className="bg-salarie/10 text-salarie hover:bg-salarie/20">Validé</Badge>;
    case 'REFUSE': return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Refusé</Badge>;
  }
};

const AdminSalaries = () => {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewing, setReviewing] = useState<Candidature | null>(null);
  const { toast } = useToast();
  const { candidatures, promus, validateCandidature, refuseCandidature } = useCandidatures();

  // Salariés actifs = mock + promus depuis les candidatures validées
  const allUsers = useMemo(() => [...promus, ...mockUsers], [promus]);
  const filtered = allUsers.filter(u =>
    `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const enAttente = candidatures.filter(c => c.statut === 'EN_ATTENTE_VALIDATION' || c.statut === 'EN_COURS');
  const traitees = candidatures.filter(c => c.statut === 'VALIDE' || c.statut === 'REFUSE');

  // Validation finale possible uniquement si dossier complet ET parcours d'onboarding terminé
  const canFinalValidate = (c: Candidature) =>
    c.statut === 'EN_ATTENTE_VALIDATION' && c.parcoursProgression === 100;

  const handleValidate = (c: Candidature) => {
    if (!canFinalValidate(c)) {
      toast({
        title: 'Validation impossible',
        description: 'Le parcours d\'onboarding du candidat doit être terminé à 100%.',
        variant: 'destructive',
      });
      return;
    }
    const { email, password } = validateCandidature(c.id);
    setReviewing(null);
    toast({
      title: 'Compte activé ✓',
      description: `${c.prenom} ${c.nom} ajouté(e) aux salariés actifs. Identifiants envoyés à ${email} (mot de passe : ${password}).`,
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {['Candidat', 'Poste', 'Manager', 'Parcours', 'Progression', 'Statut', 'Détails'].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {enAttente.map((c, i) => (
                      <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-accent/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-salarie/10 text-salarie flex items-center justify-center text-xs font-semibold">
                              {c.prenom[0]}{c.nom[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{c.prenom} {c.nom}</p>
                              <p className="text-xs text-muted-foreground">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{c.posteTitre}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{c.managerNom || '—'}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{c.parcoursIntitule || '—'}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <Progress value={c.parcoursProgression} className="h-2 flex-1" />
                            <span className="text-xs font-semibold tabular-nums w-10 text-right">{c.parcoursProgression}%</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">Dossier {c.progression}%</p>
                        </td>
                        <td className="px-5 py-4">{statutBadge(c.statut)}</td>
                        <td className="px-5 py-4">
                          <Button variant="outline" size="sm" onClick={() => setReviewing(c)}>
                            <Eye className="w-4 h-4 mr-1.5" /> Détails
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
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
                    {statutBadge(c.statut)}
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
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 bg-muted/40 rounded"><span className="text-xs text-muted-foreground">Poste</span><p>{reviewing.posteTitre}</p></div>
                  <div className="p-2 bg-muted/40 rounded"><span className="text-xs text-muted-foreground">Manager</span><p>{reviewing.managerNom || '—'}</p></div>
                  <div className="p-2 bg-muted/40 rounded col-span-2"><span className="text-xs text-muted-foreground">Parcours d'onboarding</span><p>{reviewing.parcoursIntitule}</p></div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Progression du parcours d'onboarding</h4>
                  <div className="flex items-center gap-3">
                    <Progress value={reviewing.parcoursProgression} className="flex-1 h-2" />
                    <span className="text-sm font-semibold tabular-nums w-12 text-right">{reviewing.parcoursProgression}%</span>
                  </div>
                  {reviewing.parcoursProgression < 100 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Le candidat doit terminer son parcours pour pouvoir être validé définitivement.
                    </p>
                  )}
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
                  <h4 className="text-sm font-semibold mb-2">Étapes du parcours</h4>
                  <div className="space-y-2">
                    {reviewing.etapes.map(e => {
                      const pieces = (e.piecesAttendues || []).map(nom => ({
                        nom,
                        doc: reviewing.documents.find(d => d.nom.toLowerCase() === nom.toLowerCase()),
                      }));
                      return (
                        <div key={e.id} className="p-3 border border-border rounded-lg">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2">
                              {e.termine
                                ? <Check className="w-4 h-4 text-salarie mt-0.5" />
                                : <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />}
                              <div>
                                <p className="text-sm font-medium">{e.titre}</p>
                                <p className="text-xs text-muted-foreground">{e.description}</p>
                              </div>
                            </div>
                            {e.termine
                              ? <Badge className="bg-salarie/10 text-salarie hover:bg-salarie/20">Fait</Badge>
                              : <Badge variant="secondary">En attente</Badge>}
                          </div>

                          {pieces.length > 0 && (
                            <div className="mt-3 pl-6 space-y-1">
                              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Pièces justificatives</p>
                              {pieces.map(p => (
                                <div key={p.nom} className="flex items-center gap-2 text-sm">
                                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="flex-1">{p.nom}</span>
                                  {p.doc
                                    ? <span className="inline-flex items-center gap-1 text-xs text-salarie"><Check className="w-3 h-3" /> Fournie</span>
                                    : <span className="inline-flex items-center gap-1 text-xs text-destructive"><X className="w-3 h-3" /> Manquante</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2 mt-4">
                <Button variant="outline" onClick={() => handleRefuse(reviewing)}>
                  <X className="w-4 h-4 mr-1.5" /> Refuser
                </Button>
                <Button
                  onClick={() => handleValidate(reviewing)}
                  disabled={!canFinalValidate(reviewing)}
                  className="bg-salarie hover:bg-salarie/90"
                >
                  <Mail className="w-4 h-4 mr-1.5" /> Valider et activer le compte
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
