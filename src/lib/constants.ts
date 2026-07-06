import { ReclamationStatut, UrgenceNiveau, AppRole } from "./types";

export const STATUT_CONFIG: Record<
  ReclamationStatut,
  { label: string; badge: string; dot: string }
> = {
  nouvelle: {
    label: "Nouvelle",
    badge: "bg-status-nouvelle-bg text-status-nouvelle",
    dot: "bg-status-nouvelle",
  },
  en_cours: {
    label: "En cours",
    badge: "bg-status-encours-bg text-status-encours",
    dot: "bg-status-encours",
  },
  resolue: {
    label: "Résolue",
    badge: "bg-status-resolue-bg text-status-resolue",
    dot: "bg-status-resolue",
  },
  rejetee: {
    label: "Rejetée",
    badge: "bg-status-rejetee-bg text-status-rejetee",
    dot: "bg-status-rejetee",
  },
  cloturee: {
    label: "Clôturée",
    badge: "bg-status-cloturee-bg text-status-cloturee",
    dot: "bg-status-cloturee",
  },
};

export const STATUT_ORDER: ReclamationStatut[] = [
  "nouvelle",
  "en_cours",
  "resolue",
  "rejetee",
  "cloturee",
];

export const URGENCE_CONFIG: Record<
  UrgenceNiveau,
  { label: string; badge: string; slaHeures: number }
> = {
  faible: {
    label: "Faible",
    badge: "bg-urgence-faible/10 text-urgence-faible border border-urgence-faible/30",
    slaHeures: 120, // 5 jours
  },
  moyen: {
    label: "Moyen",
    badge: "bg-urgence-moyen/10 text-urgence-moyen border border-urgence-moyen/30",
    slaHeures: 72, // 3 jours
  },
  eleve: {
    label: "Élevé",
    badge: "bg-urgence-eleve/10 text-urgence-eleve border border-urgence-eleve/30",
    slaHeures: 24, // 1 jour
  },
};

export const ROLE_CONFIG: Record<AppRole, { label: string; home: string }> = {
  client: { label: "Client", home: "/client/dashboard" },
  agent: { label: "Agent", home: "/agent/dashboard" },
  admin: { label: "Administrateur", home: "/admin/dashboard" },
};

export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--navy-deep))",
];
