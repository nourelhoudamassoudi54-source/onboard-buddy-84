import { User, Poste, Parcours, Tache, Document, KPIData } from '@/types';

export const mockPostes: Poste[] = [
  { id: '1', titre: 'Développeur Frontend', description: 'Développement des interfaces utilisateur', departement: 'Tech' },
  { id: '2', titre: 'Chef de Projet', description: 'Gestion de projets digitaux', departement: 'Management' },
  { id: '3', titre: 'Designer UX', description: 'Conception des expériences utilisateur', departement: 'Design' },
  { id: '4', titre: 'Analyste RH', description: 'Analyse et reporting RH', departement: 'Ressources Humaines' },
  { id: '5', titre: 'Commercial B2B', description: 'Développement commercial B2B', departement: 'Commercial' },
];

export const mockUsers: User[] = [
  { id: '1', nom: 'Martin', prenom: 'Sophie', email: 'sophie.martin@company.com', telephone: '06 12 34 56 78', actif: true, role: 'ADMIN_RH', posteId: '4', poste: mockPostes[3] },
  { id: '2', nom: 'Dubois', prenom: 'Pierre', email: 'pierre.dubois@company.com', telephone: '06 23 45 67 89', actif: true, role: 'MANAGER', posteId: '2', poste: mockPostes[1] },
  { id: '3', nom: 'Leroy', prenom: 'Marie', email: 'marie.leroy@company.com', telephone: '06 34 56 78 90', actif: true, role: 'SALARIE', posteId: '1', poste: mockPostes[0] },
  { id: '4', nom: 'Bernard', prenom: 'Lucas', email: 'lucas.bernard@company.com', telephone: '06 45 67 89 01', actif: true, role: 'SALARIE', posteId: '3', poste: mockPostes[2] },
  { id: '5', nom: 'Petit', prenom: 'Emma', email: 'emma.petit@company.com', telephone: '06 56 78 90 12', actif: false, role: 'SALARIE', posteId: '5', poste: mockPostes[4] },
  { id: '6', nom: 'Moreau', prenom: 'Thomas', email: 'thomas.moreau@company.com', telephone: '06 67 89 01 23', actif: true, role: 'SALARIE', posteId: '1', poste: mockPostes[0] },
  { id: '7', nom: 'Garcia', prenom: 'Léa', email: 'lea.garcia@company.com', telephone: '06 78 90 12 34', actif: true, role: 'MANAGER', posteId: '2', poste: mockPostes[1] },
];

export const mockTaches: Tache[] = [
  { id: '1', titre: 'Signer le contrat de travail', description: 'Signer et retourner le contrat', statut: 'TERMINE', termine: true, ordre: 1, dateEcheance: '2024-01-15', parcoursId: '1' },
  { id: '2', titre: 'Configurer le poste de travail', description: 'Installer les logiciels nécessaires', statut: 'TERMINE', termine: true, ordre: 2, dateEcheance: '2024-01-16', parcoursId: '1' },
  { id: '3', titre: 'Formation sécurité', description: 'Suivre la formation sécurité obligatoire', statut: 'EN_COURS', termine: false, ordre: 3, dateEcheance: '2024-01-20', parcoursId: '1' },
  { id: '4', titre: 'Rencontre avec l\'équipe', description: 'Réunion de présentation avec l\'équipe', statut: 'A_FAIRE', termine: false, ordre: 4, dateEcheance: '2024-01-22', parcoursId: '1' },
  { id: '5', titre: 'Formation outils internes', description: 'Formation sur les outils de l\'entreprise', statut: 'A_FAIRE', termine: false, ordre: 5, dateEcheance: '2024-01-25', parcoursId: '1' },
  { id: '6', titre: 'Compléter le profil', description: 'Remplir toutes les informations personnelles', statut: 'EN_COURS', termine: false, ordre: 1, dateEcheance: '2024-02-01', parcoursId: '2' },
  { id: '7', titre: 'Lire le guide d\'accueil', description: 'Consulter le livret d\'accueil', statut: 'TERMINE', termine: true, ordre: 2, dateEcheance: '2024-02-03', parcoursId: '2' },
  { id: '8', titre: 'Formation design system', description: 'Formation sur le design system de l\'entreprise', statut: 'A_FAIRE', termine: false, ordre: 3, dateEcheance: '2024-02-10', parcoursId: '2' },
];

export const mockParcours: Parcours[] = [
  { id: '1', intitule: 'Onboarding Développeur', description: 'Parcours d\'intégration pour les développeurs', progression: 40, statut: 'EN_COURS', dateDebut: '2024-01-10', dateFin: '2024-02-10', salarieId: '3', salarie: mockUsers[2], taches: mockTaches.filter(t => t.parcoursId === '1') },
  { id: '2', intitule: 'Onboarding Designer', description: 'Parcours d\'intégration pour les designers', progression: 33, statut: 'EN_COURS', dateDebut: '2024-01-15', dateFin: '2024-02-15', salarieId: '4', salarie: mockUsers[3], taches: mockTaches.filter(t => t.parcoursId === '2') },
  { id: '3', intitule: 'Onboarding Commercial', description: 'Parcours d\'intégration pour les commerciaux', progression: 0, statut: 'EN_ATTENTE', dateDebut: '2024-02-01', dateFin: '2024-03-01', salarieId: '5', salarie: mockUsers[4] },
  { id: '4', intitule: 'Onboarding Dev Senior', description: 'Parcours avancé pour développeurs seniors', progression: 75, statut: 'EN_COURS', dateDebut: '2024-01-05', dateFin: '2024-02-05', salarieId: '6', salarie: mockUsers[5] },
];

export const mockDocuments: Document[] = [
  { id: '1', nom: 'Carte d\'identité.pdf', type: 'PDF', url: '#', taille: 2048, dateDepot: '2024-01-10', salarieId: '3' },
  { id: '2', nom: 'RIB.pdf', type: 'PDF', url: '#', taille: 512, dateDepot: '2024-01-10', salarieId: '3' },
  { id: '3', nom: 'Diplôme.pdf', type: 'PDF', url: '#', taille: 4096, dateDepot: '2024-01-11', salarieId: '3' },
  { id: '4', nom: 'CV.pdf', type: 'PDF', url: '#', taille: 1024, dateDepot: '2024-01-15', salarieId: '4' },
];

export const mockKPI: KPIData = {
  tauxAvancement: 67,
  nbTachesTerminees: 24,
  nbTachesEnRetard: 3,
  tauxCompletionParcours: 42,
  totalSalaries: 28,
  parcoursActifs: 12,
};

export const mockChartData = [
  { mois: 'Jan', onboardes: 4, termines: 2 },
  { mois: 'Fév', onboardes: 6, termines: 5 },
  { mois: 'Mar', onboardes: 3, termines: 3 },
  { mois: 'Avr', onboardes: 8, termines: 6 },
  { mois: 'Mai', onboardes: 5, termines: 4 },
  { mois: 'Jun', onboardes: 7, termines: 7 },
];

export const mockPieData = [
  { name: 'Terminés', value: 42, fill: 'hsl(152, 69%, 40%)' },
  { name: 'En cours', value: 35, fill: 'hsl(217, 91%, 50%)' },
  { name: 'En attente', value: 15, fill: 'hsl(38, 92%, 50%)' },
  { name: 'En retard', value: 8, fill: 'hsl(0, 84%, 60%)' },
];
