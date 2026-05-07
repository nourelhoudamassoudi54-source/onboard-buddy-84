import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/shared/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, X, FileText, Clock, Mail, Inbox, Users as UsersIcon, Ban, PlayCircle, History, FilePlus, CheckCircle2, XCircle, Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useCandidatures, Candidature } from '@/contexts/CandidaturesContext';
import { cn } from '@/lib/utils';

type TabKey = 'attente' | 'parcours' | 'refuses' | 'salaries';

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'attente', label: 'En attente', icon: Inbox },
  { key: 'parcours', label: 'En parcours', icon: PlayCircle },
  { key: 'refuses', label: 'Refusés', icon: Ban },
  { key: 'salaries', label: 'Salariés', icon: UsersIcon },
];

const AdminCandidatures = () => {
  const [active, setActive] = useState<TabKey>('attente');
  const { toast } = useToast();
  const { candidatures, promus, validateCandidature, refuseCandidature } = useCandidatures();

  const lists = useMemo(() => ({
    attente: candidatures.filter(c => c.statut === 'EN_ATTENTE_VALIDATION'),
    parcours: candidatures.filter(c => c.statut === 'EN_COURS'),
    refuses: candidatures.filter(c => c.statut === 'REFUSE'),
    salaries: candidatures.filter(c => c.statut === 'VALIDE'),
  }), [candidatures]);

  const counts = {
    attente: lists.attente.length,
    parcours: lists.parcours.length,
    refuses: lists.refuses.length,
    salaries: lists.salaries.length + promus.length,
  };

  const handleValidate = (c: Candidature) => {
    if (c.parcoursProgression < 100) {
      toast({
        title: 'Validation impossible',
        description: "Le parcours d'onboarding doit être terminé à 100%.",
        variant: 'destructive',
      });
      return;
    }
    const { email, password } = validateCandidature(c.id);
    toast({
      title: 'Compte activé ✓',
      description: `Identifiants envoyés à ${email} (mot de passe : ${password}).`,
    });
  };

  const handleRefuse = (c: Candidature) => {
    refuseCandidature(c.id);
    toast({ title: 'Candidature refusée', description: `${c.prenom} ${c.nom} a été notifié(e).`, variant: 'destructive' });
  };

  const visible = active === 'salaries'
    ? [
        ...lists.salaries,
        // promus directs (non issus du flux candidature courant)
      ]
    : lists[active];

  return (
    <DashboardLayout>
      <PageHeader
        title="Validation des candidatures"
        description="Examinez les dossiers, validez puis suivez le parcours avant l'intégration officielle."
      />

      {/* Sub-tabs as cards */}
      <div className="flex flex-wrap gap-3 mb-6">
        {tabs.map(t => {
          const isActive = active === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={cn(
                'flex items-center gap-3 px-5 py-3 rounded-xl border transition-all',
                isActive
                  ? 'bg-card border-admin/40 shadow-card ring-1 ring-admin/30'
                  : 'bg-card/40 border-border hover:bg-card hover:border-border'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-admin' : 'text-muted-foreground')} />
              <span className={cn('text-sm font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                {t.label}
              </span>
              <Badge variant="secondary" className="text-[11px]">{counts[t.key]}</Badge>
            </button>
          );
        })}
      </div>

      {/* List of candidate cards */}
      <div className="space-y-4">
        {active === 'salaries' && promus.length > 0 && promus.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-card"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-salarie/10 text-salarie flex items-center justify-center text-sm font-semibold">
                {u.prenom[0]}{u.nom[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold">{u.prenom} {u.nom}</p>
                  <Badge className="bg-salarie/10 text-salarie hover:bg-salarie/20">Salarié actif</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{u.email}</p>
                <p className="text-sm text-muted-foreground mt-1">Poste : {u.poste?.titre || '—'}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {visible.length === 0 && (active !== 'salaries' || promus.length === 0) ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <Inbox className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Aucun élément dans cette catégorie.</p>
          </div>
        ) : (
          visible.map((c, i) => (
            <CandidatCard
              key={c.id}
              c={c}
              tab={active}
              index={i}
              onValidate={() => handleValidate(c)}
              onRefuse={() => handleRefuse(c)}
            />
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

const statutBadge = (s: Candidature['statut']) => {
  switch (s) {
    case 'EN_COURS': return <Badge variant="secondary">En parcours</Badge>;
    case 'EN_ATTENTE_VALIDATION': return <Badge className="bg-admin/10 text-admin hover:bg-admin/20">En attente</Badge>;
    case 'VALIDE': return <Badge className="bg-salarie/10 text-salarie hover:bg-salarie/20">Validé</Badge>;
    case 'REFUSE': return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Refusé</Badge>;
  }
};

const CandidatCard = ({
  c, tab, index, onValidate, onRefuse,
}: {
  c: Candidature;
  tab: TabKey;
  index: number;
  onValidate: () => void;
  onRefuse: () => void;
}) => {
  const showActions = tab === 'attente';
  const canValidate = c.parcoursProgression === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-card"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-salarie/10 text-salarie flex items-center justify-center text-sm font-semibold">
          {c.prenom[0]}{c.nom[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-semibold">{c.prenom} {c.nom}</p>
            {statutBadge(c.statut)}
          </div>
          <p className="text-sm text-muted-foreground">{c.email}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Poste demandé : <span className="text-foreground">{c.posteTitre}</span>
            <span className="mx-2">·</span>
            Manager : <span className="text-foreground">{c.managerNom || '—'}</span>
          </p>
        </div>
      </div>

      {/* Progress (parcours) */}
      {(tab === 'parcours' || tab === 'attente') && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Parcours · {c.parcoursIntitule}
            </p>
            <span className="text-xs font-semibold tabular-nums">{c.parcoursProgression}%</span>
          </div>
          <Progress value={c.parcoursProgression} className="h-2" />
        </div>
      )}

      {/* Documents */}
      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" /> Documents du dossier
        </p>
        <div className="space-y-2">
          {(() => {
            const expected = Array.from(new Set(c.etapes.flatMap(e => e.piecesAttendues || [])));
            const all = expected.length > 0 ? expected : c.documents.map(d => d.nom);
            if (all.length === 0) {
              return <p className="text-sm text-muted-foreground">Aucun document requis.</p>;
            }
            return all.map(nom => {
              const provided = c.documents.find(d => d.nom.toLowerCase() === nom.toLowerCase());
              return (
                <div key={nom} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                  <span className="text-sm">{nom}</span>
                  {provided
                    ? <Badge className="bg-salarie/10 text-salarie hover:bg-salarie/20">Fourni</Badge>
                    : <Badge className="bg-admin/10 text-admin hover:bg-admin/20">En attente</Badge>}
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Étapes (compact) for parcours tab */}
      {tab === 'parcours' && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Étapes du parcours</p>
          <div className="space-y-1.5">
            {c.etapes.map(e => (
              <div key={e.id} className="flex items-center gap-2 text-sm">
                {e.termine
                  ? <Check className="w-4 h-4 text-salarie" />
                  : <Clock className="w-4 h-4 text-muted-foreground" />}
                <span className={cn(e.termine ? '' : 'text-muted-foreground')}>{e.titre}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="mt-5 flex gap-2">
          <Button
            onClick={onValidate}
            disabled={!canValidate}
            className="bg-salarie hover:bg-salarie/90"
          >
            <Mail className="w-4 h-4 mr-1.5" />
            {canValidate ? 'Valider — activer le compte' : 'Valider — démarrer parcours'}
          </Button>
          <Button variant="outline" onClick={onRefuse}>
            <X className="w-4 h-4 mr-1.5" /> Refuser
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default AdminCandidatures;
