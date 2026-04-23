import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CandidatureDocument {
  nom: string;
  type: string;
  taille: number;
}

export interface EtapeProfil {
  id: string;
  titre: string;
  description: string;
  termine: boolean;
}

export type CandidatureStatut = 'EN_COURS' | 'EN_ATTENTE_VALIDATION' | 'VALIDE' | 'REFUSE';

export interface Candidature {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateNaissance: string;
  posteId: string;
  posteTitre: string;
  documents: CandidatureDocument[];
  etapes: EtapeProfil[];
  progression: number;
  statut: CandidatureStatut;
  dateCreation: string;
  motDePasseGenere?: string;
}

interface CandidaturesContextType {
  candidatures: Candidature[];
  addCandidature: (c: Omit<Candidature, 'id' | 'dateCreation' | 'statut' | 'progression'>) => Candidature;
  updateCandidature: (id: string, patch: Partial<Candidature>) => void;
  validateCandidature: (id: string) => { email: string; password: string };
  refuseCandidature: (id: string) => void;
  getCandidatureByEmail: (email: string) => Candidature | undefined;
}

const CandidaturesContext = createContext<CandidaturesContextType | undefined>(undefined);

const computeProgression = (c: Pick<Candidature, 'prenom' | 'nom' | 'email' | 'telephone' | 'adresse' | 'dateNaissance' | 'posteId' | 'documents' | 'etapes'>) => {
  let total = 0;
  let done = 0;
  // Infos perso (6 champs)
  const fields = [c.prenom, c.nom, c.email, c.telephone, c.adresse, c.dateNaissance];
  total += fields.length;
  done += fields.filter(Boolean).length;
  // Poste (1)
  total += 1;
  if (c.posteId) done += 1;
  // Documents (au moins 3)
  total += 3;
  done += Math.min(3, c.documents.length);
  // Étapes
  total += c.etapes.length;
  done += c.etapes.filter(e => e.termine).length;
  return Math.round((done / total) * 100);
};

export const CandidaturesProvider = ({ children }: { children: ReactNode }) => {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);

  const addCandidature: CandidaturesContextType['addCandidature'] = (data) => {
    const progression = computeProgression(data);
    const candidature: Candidature = {
      ...data,
      id: `cand-${Date.now()}`,
      dateCreation: new Date().toISOString(),
      statut: progression === 100 ? 'EN_ATTENTE_VALIDATION' : 'EN_COURS',
      progression,
    };
    setCandidatures(prev => [candidature, ...prev]);
    return candidature;
  };

  const updateCandidature: CandidaturesContextType['updateCandidature'] = (id, patch) => {
    setCandidatures(prev => prev.map(c => {
      if (c.id !== id) return c;
      const merged = { ...c, ...patch };
      const progression = computeProgression(merged);
      const statut: CandidatureStatut =
        merged.statut === 'VALIDE' || merged.statut === 'REFUSE'
          ? merged.statut
          : progression === 100
            ? 'EN_ATTENTE_VALIDATION'
            : 'EN_COURS';
      return { ...merged, progression, statut };
    }));
  };

  const validateCandidature: CandidaturesContextType['validateCandidature'] = (id) => {
    const password = Math.random().toString(36).slice(-10);
    let email = '';
    setCandidatures(prev => prev.map(c => {
      if (c.id !== id) return c;
      email = c.email;
      return { ...c, statut: 'VALIDE', motDePasseGenere: password };
    }));
    return { email, password };
  };

  const refuseCandidature: CandidaturesContextType['refuseCandidature'] = (id) => {
    setCandidatures(prev => prev.map(c => c.id === id ? { ...c, statut: 'REFUSE' } : c));
  };

  const getCandidatureByEmail = (email: string) =>
    candidatures.find(c => c.email.toLowerCase() === email.toLowerCase());

  return (
    <CandidaturesContext.Provider value={{ candidatures, addCandidature, updateCandidature, validateCandidature, refuseCandidature, getCandidatureByEmail }}>
      {children}
    </CandidaturesContext.Provider>
  );
};

export const useCandidatures = () => {
  const ctx = useContext(CandidaturesContext);
  if (!ctx) throw new Error('useCandidatures must be used within CandidaturesProvider');
  return ctx;
};

export const ETAPES_PROFIL_DEFAUT: EtapeProfil[] = [
  { id: 'e1', titre: 'Lire le livret d\'accueil', description: 'Consulter le guide de présentation de l\'entreprise', termine: false },
  { id: 'e2', titre: 'Accepter le règlement intérieur', description: 'Lire et accepter le règlement intérieur', termine: false },
  { id: 'e3', titre: 'Compléter la fiche de renseignements', description: 'Remplir les informations administratives', termine: false },
  { id: 'e4', titre: 'Confirmer la date de prise de poste', description: 'Valider votre date de démarrage', termine: false },
];
