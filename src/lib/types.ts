export type AppRole = "client" | "agent" | "admin";

export type ReclamationStatut =
  | "nouvelle"
  | "en_cours"
  | "resolue"
  | "rejetee"
  | "cloturee";

export type UrgenceNiveau = "faible" | "moyen" | "eleve";

export interface Profile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface Categorie {
  id: string;
  nom: string;
  description: string | null;
  created_at: string;
}

export interface Reclamation {
  id: string;
  client_id: string;
  agent_id: string | null;
  categorie_id: string | null;
  titre: string;
  description: string;
  statut: ReclamationStatut;
  urgence: UrgenceNiveau;
  date_echeance: string | null;
  date_cloture: string | null;
  created_at: string;
  updated_at: string;
  // Joined (optional)
  categorie?: Categorie | null;
  client?: Profile | null;
  agent?: Profile | null;
}

export interface PieceJointe {
  id: string;
  reclamation_id: string;
  url_fichier: string;
  nom_fichier: string;
  created_at: string;
}

export interface Commentaire {
  id: string;
  reclamation_id: string;
  auteur_id: string;
  message: string;
  created_at: string;
  auteur?: Profile | null;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  lien: string | null;
  lu: boolean;
  created_at: string;
}

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: AppRole;
}
