import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockUsers } from '@/data/mock-data';
import { User } from '@/types';

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
  /** Noms des pièces justificatives attendues pour cette étape (matchés sur Candidature.documents[].nom) */
  piecesAttendues?: string[];
}

export type CandidatureStatut = 'EN_COURS' | 'EN_ATTENTE_VALIDATION' | 'VALIDE' | 'REFUSE';

export type HistoriqueType = 'CREATION' | 'ETAPE_TERMINEE' | 'DOCUMENT_AJOUTE' | 'STATUT' | 'PROGRESSION' | 'VALIDATION' | 'REFUS';

export interface HistoriqueEntry {
  id: string;
  date: string;
  type: HistoriqueType;
  label: string;
  progression: number;
}

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
  managerId?: string;
  managerNom?: string;
  parcoursIntitule?: string;
  parcoursProgression: number;
  historique: HistoriqueEntry[];
}

interface CandidaturesContextType {
  candidatures: Candidature[];
  promus: User[];
  addCandidature: (c: Omit<Candidature, 'id' | 'dateCreation' | 'statut' | 'progression' | 'parcoursProgression' | 'historique'>) => Candidature;
  updateCandidature: (id: string, patch: Partial<Candidature>) => void;
  validateCandidature: (id: string) => { email: string; password: string };
  refuseCandidature: (id: string) => void;
  getCandidatureByEmail: (email: string) => Candidature | undefined;
}

const CandidaturesContext = createContext<CandidaturesContextType | undefined>(undefined);

const computeProgression = (c: Pick<Candidature, 'prenom' | 'nom' | 'email' | 'telephone' | 'adresse' | 'dateNaissance' | 'posteId' | 'documents' | 'etapes'>) => {
  let total = 0;
  let done = 0;
  const fields = [c.prenom, c.nom, c.email, c.telephone, c.adresse, c.dateNaissance];
  total += fields.length;
  done += fields.filter(Boolean).length;
  total += 1;
  if (c.posteId) done += 1;
  total += 3;
  done += Math.min(3, c.documents.length);
  total += c.etapes.length;
  done += c.etapes.filter(e => e.termine).length;
  return Math.round((done / total) * 100);
};

// Auto-assign a manager (round-robin among MANAGERS)
const managers = mockUsers.filter(u => u.role === 'MANAGER');
let managerCursor = 0;
const pickManager = () => {
  if (managers.length === 0) return undefined;
  const m = managers[managerCursor % managers.length];
  managerCursor++;
  return m;
};

const parcoursForPoste = (posteTitre: string) => `Onboarding ${posteTitre}`;

export const CandidaturesProvider = ({ children }: { children: ReactNode }) => {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [promus, setPromus] = useState<User[]>([]);

  const addCandidature: CandidaturesContextType['addCandidature'] = (data) => {
    const progression = computeProgression(data);
    const manager = pickManager();
    // Étapes du parcours d'onboarding démarrent à la progression atteinte par le candidat
    const parcoursProgression = Math.round((data.etapes.filter(e => e.termine).length / Math.max(1, data.etapes.length)) * 100);
    const candidature: Candidature = {
      ...data,
      id: `cand-${Date.now()}`,
      dateCreation: new Date().toISOString(),
      statut: progression === 100 ? 'EN_ATTENTE_VALIDATION' : 'EN_COURS',
      progression,
      managerId: manager?.id,
      managerNom: manager ? `${manager.prenom} ${manager.nom}` : undefined,
      parcoursIntitule: parcoursForPoste(data.posteTitre),
      parcoursProgression,
    };
    setCandidatures(prev => [candidature, ...prev]);
    return candidature;
  };

  const updateCandidature: CandidaturesContextType['updateCandidature'] = (id, patch) => {
    setCandidatures(prev => prev.map(c => {
      if (c.id !== id) return c;
      const merged = { ...c, ...patch };
      const progression = computeProgression(merged);
      const parcoursProgression = Math.round((merged.etapes.filter(e => e.termine).length / Math.max(1, merged.etapes.length)) * 100);
      const statut: CandidatureStatut =
        merged.statut === 'VALIDE' || merged.statut === 'REFUSE'
          ? merged.statut
          : progression === 100
            ? 'EN_ATTENTE_VALIDATION'
            : 'EN_COURS';
      return { ...merged, progression, parcoursProgression, statut };
    }));
  };

  const validateCandidature: CandidaturesContextType['validateCandidature'] = (id) => {
    const password = Math.random().toString(36).slice(-10);
    let email = '';
    let promoted: User | null = null;
    setCandidatures(prev => prev.map(c => {
      if (c.id !== id) return c;
      email = c.email;
      // Promote candidature -> User actif
      promoted = {
        id: `user-${c.id}`,
        nom: c.nom,
        prenom: c.prenom,
        email: c.email,
        telephone: c.telephone,
        actif: true,
        role: 'SALARIE',
        posteId: c.posteId,
        poste: { id: c.posteId, titre: c.posteTitre, description: '', departement: '' },
      };
      return { ...c, statut: 'VALIDE', motDePasseGenere: password };
    }));
    if (promoted) setPromus(prev => [promoted as User, ...prev]);
    return { email, password };
  };

  const refuseCandidature: CandidaturesContextType['refuseCandidature'] = (id) => {
    setCandidatures(prev => prev.map(c => c.id === id ? { ...c, statut: 'REFUSE' } : c));
  };

  const getCandidatureByEmail = (email: string) =>
    candidatures.find(c => c.email.toLowerCase() === email.toLowerCase());

  return (
    <CandidaturesContext.Provider value={{ candidatures, promus, addCandidature, updateCandidature, validateCandidature, refuseCandidature, getCandidatureByEmail }}>
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
  { id: 'e1', titre: 'Lire le livret d\'accueil', description: 'Consulter le guide de présentation de l\'entreprise', termine: false, piecesAttendues: [] },
  { id: 'e2', titre: 'Accepter le règlement intérieur', description: 'Lire et accepter le règlement intérieur', termine: false, piecesAttendues: ['Pièce d\'identité'] },
  { id: 'e3', titre: 'Compléter la fiche de renseignements', description: 'Remplir les informations administratives', termine: false, piecesAttendues: ['CV', 'RIB'] },
  { id: 'e4', titre: 'Confirmer la date de prise de poste', description: 'Valider votre date de démarrage', termine: false, piecesAttendues: [] },
];
