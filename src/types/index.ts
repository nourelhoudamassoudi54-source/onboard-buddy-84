export type RoleType = 'ADMIN_RH' | 'MANAGER' | 'SALARIE';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  actif: boolean;
  role: RoleType;
  posteId?: string;
  poste?: Poste;
  avatar?: string;
}

export interface Poste {
  id: string;
  titre: string;
  description: string;
  departement: string;
}

export interface Parcours {
  id: string;
  intitule: string;
  description: string;
  progression: number;
  statut: 'EN_COURS' | 'TERMINE' | 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
  dateDebut: string;
  dateFin: string;
  salarieId: string;
  salarie?: User;
  taches?: Tache[];
}

export interface Tache {
  id: string;
  titre: string;
  description: string;
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINE';
  termine: boolean;
  ordre: number;
  dateEcheance: string;
  parcoursId: string;
  commentaires?: Commentaire[];
}

export interface Document {
  id: string;
  nom: string;
  type: string;
  url: string;
  taille: number;
  dateDepot: string;
  salarieId: string;
}

export interface Commentaire {
  id: string;
  contenu: string;
  dateCreation: string;
  auteur: User;
  parcoursId?: string;
  tacheId?: string;
}

export interface KPIData {
  tauxAvancement: number;
  nbTachesTerminees: number;
  nbTachesEnRetard: number;
  tauxCompletionParcours: number;
  totalSalaries: number;
  parcoursActifs: number;
}
