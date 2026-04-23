import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, ArrowRight, Check, Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { mockPostes } from '@/data/mock-data';
import { useCandidatures, ETAPES_PROFIL_DEFAUT, EtapeProfil, CandidatureDocument } from '@/contexts/CandidaturesContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'infos', label: 'Infos personnelles' },
  { key: 'poste', label: 'Choix du poste' },
  { key: 'documents', label: 'Documents' },
  { key: 'etapes', label: 'Étapes du parcours' },
  { key: 'recap', label: 'Récapitulatif' },
] as const;

const Signup = () => {
  const navigate = useNavigate();
  const { addCandidature } = useCandidatures();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [infos, setInfos] = useState({
    prenom: '', nom: '', email: '', telephone: '', adresse: '', dateNaissance: '',
  });
  const [posteId, setPosteId] = useState('');
  const [documents, setDocuments] = useState<CandidatureDocument[]>([]);
  const [etapes, setEtapes] = useState<EtapeProfil[]>(ETAPES_PROFIL_DEFAUT.map(e => ({ ...e })));

  const progression = useMemo(() => {
    let total = 0, done = 0;
    const fields = Object.values(infos);
    total += fields.length; done += fields.filter(Boolean).length;
    total += 1; if (posteId) done += 1;
    total += 3; done += Math.min(3, documents.length);
    total += etapes.length; done += etapes.filter(e => e.termine).length;
    return Math.round((done / total) * 100);
  }, [infos, posteId, documents, etapes]);

  const requiredDocs = ['CV', 'Pièce d\'identité', 'RIB'];

  const handleFile = (label: string, file?: File) => {
    if (!file) return;
    setDocuments(prev => [...prev.filter(d => d.nom !== label), { nom: label, type: file.type || 'PDF', taille: file.size }]);
  };

  const removeDoc = (nom: string) => setDocuments(prev => prev.filter(d => d.nom !== nom));

  const toggleEtape = (id: string) =>
    setEtapes(prev => prev.map(e => e.id === id ? { ...e, termine: !e.termine } : e));

  const canNext = () => {
    if (step === 0) return Object.values(infos).every(Boolean);
    if (step === 1) return !!posteId;
    if (step === 2) return documents.length >= 3;
    if (step === 3) return etapes.every(e => e.termine);
    return true;
  };

  const submit = () => {
    const poste = mockPostes.find(p => p.id === posteId);
    addCandidature({
      ...infos,
      posteId,
      posteTitre: poste?.titre || '',
      documents,
      etapes,
    });
    setSubmitted(true);
    toast({ title: 'Demande envoyée !', description: 'Votre dossier est en attente de validation par l\'Admin RH.' });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-card">
          <div className="w-16 h-16 rounded-full bg-salarie/10 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-salarie" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Dossier complet à 100% !</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Votre demande a bien été transmise à l'équipe RH. Une fois validée, vos identifiants de connexion vous seront envoyés par email à <span className="font-medium text-foreground">{infos.email}</span>.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">Retour à la connexion</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border bg-card flex items-center px-6 justify-between">
        <Link to="/login" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">OnboardPro</span>
        </Link>
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Annuler</Link>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Créer mon compte salarié</h1>
          <p className="text-sm text-muted-foreground">Complétez votre dossier à 100% pour soumission à l'Admin RH.</p>
        </div>

        {/* Stepper */}
        <div className="mb-6 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex-1 flex flex-col items-center text-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mb-1 transition-colors",
                  i < step ? 'bg-salarie text-primary-foreground'
                  : i === step ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                )}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn("text-[10px] sm:text-xs", i === step ? 'text-foreground font-medium' : 'text-muted-foreground')}>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Progress value={progression} className="h-2" />
            <span className="text-xs font-semibold text-foreground tabular-nums">{progression}%</span>
          </div>
        </div>

        {/* Step content */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              {step === 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold mb-2">Vos informations</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Prénom *</Label><Input value={infos.prenom} onChange={e => setInfos({ ...infos, prenom: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Nom *</Label><Input value={infos.nom} onChange={e => setInfos({ ...infos, nom: e.target.value })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Email *</Label><Input type="email" value={infos.email} onChange={e => setInfos({ ...infos, email: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Téléphone *</Label><Input value={infos.telephone} onChange={e => setInfos({ ...infos, telephone: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Date de naissance *</Label><Input type="date" value={infos.dateNaissance} onChange={e => setInfos({ ...infos, dateNaissance: e.target.value })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Adresse *</Label><Input value={infos.adresse} onChange={e => setInfos({ ...infos, adresse: e.target.value })} /></div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold mb-2">Choisissez votre poste</h3>
                  <p className="text-sm text-muted-foreground mb-4">Sélectionnez le poste pour lequel vous postulez parmi ceux proposés.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {mockPostes.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setPosteId(p.id)}
                        className={cn(
                          "text-left p-4 rounded-lg border transition-all",
                          posteId === p.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/40'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{p.titre}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{p.departement}</p>
                          </div>
                          {posteId === p.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{p.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold mb-2">Documents requis</h3>
                  <p className="text-sm text-muted-foreground mb-4">Uploadez vos 3 documents obligatoires.</p>
                  <div className="space-y-3">
                    {requiredDocs.map(label => {
                      const uploaded = documents.find(d => d.nom === label);
                      return (
                        <div key={label} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{label}</p>
                              {uploaded && <p className="text-xs text-muted-foreground">{(uploaded.taille / 1024).toFixed(1)} Ko</p>}
                            </div>
                          </div>
                          {uploaded ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-salarie inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Ajouté</span>
                              <Button variant="ghost" size="icon" onClick={() => removeDoc(label)}><X className="w-4 h-4" /></Button>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <input type="file" className="hidden" onChange={e => handleFile(label, e.target.files?.[0])} />
                              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-accent">
                                <Upload className="w-3.5 h-3.5" /> Choisir
                              </span>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold mb-2">Étapes du parcours</h3>
                  <p className="text-sm text-muted-foreground mb-4">Validez chaque étape pour finaliser votre profil.</p>
                  <div className="space-y-2">
                    {etapes.map(e => (
                      <label key={e.id} className={cn(
                        "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                        e.termine ? 'border-salarie/40 bg-salarie/5' : 'border-border hover:bg-accent/50'
                      )}>
                        <Checkbox checked={e.termine} onCheckedChange={() => toggleEtape(e.id)} className="mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{e.titre}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold mb-2">Récapitulatif</h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-muted/40 rounded-lg"><p className="text-xs text-muted-foreground">Nom complet</p><p className="font-medium">{infos.prenom} {infos.nom}</p></div>
                    <div className="p-3 bg-muted/40 rounded-lg"><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{infos.email}</p></div>
                    <div className="p-3 bg-muted/40 rounded-lg"><p className="text-xs text-muted-foreground">Téléphone</p><p className="font-medium">{infos.telephone}</p></div>
                    <div className="p-3 bg-muted/40 rounded-lg"><p className="text-xs text-muted-foreground">Poste</p><p className="font-medium">{mockPostes.find(p => p.id === posteId)?.titre}</p></div>
                    <div className="p-3 bg-muted/40 rounded-lg"><p className="text-xs text-muted-foreground">Documents</p><p className="font-medium">{documents.length} fichier(s)</p></div>
                    <div className="p-3 bg-muted/40 rounded-lg"><p className="text-xs text-muted-foreground">Étapes complétées</p><p className="font-medium">{etapes.filter(e => e.termine).length}/{etapes.length}</p></div>
                  </div>
                  <div className="p-4 rounded-lg border border-salarie/30 bg-salarie/5 mt-4">
                    <p className="text-sm font-medium text-foreground">Dossier complet à {progression}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {progression === 100
                        ? 'Vous pouvez soumettre votre dossier. L\'Admin RH validera et vous recevrez vos identifiants par email.'
                        : 'Complétez toutes les étapes pour pouvoir soumettre.'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Précédent
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
              Suivant <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={progression < 100} className="bg-salarie hover:bg-salarie/90">
              <Check className="w-4 h-4 mr-2" /> Soumettre mon dossier
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
