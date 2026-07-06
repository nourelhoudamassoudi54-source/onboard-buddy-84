
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('client', 'agent', 'admin');
CREATE TYPE public.reclamation_statut AS ENUM ('nouvelle', 'en_cours', 'resolue', 'rejetee', 'cloturee');
CREATE TYPE public.urgence_niveau AS ENUM ('faible', 'moyen', 'eleve');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL DEFAULT '',
  prenom TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  telephone TEXT,
  actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============ HAS_ROLE FUNCTION ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT ON public.categories TO anon;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ============ RECLAMATIONS ============
CREATE TABLE public.reclamations (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  categorie_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  statut reclamation_statut NOT NULL DEFAULT 'nouvelle',
  urgence urgence_niveau NOT NULL DEFAULT 'moyen',
  date_echeance TIMESTAMPTZ,
  date_cloture TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reclamations TO authenticated;
GRANT ALL ON public.reclamations TO service_role;
ALTER TABLE public.reclamations ENABLE ROW LEVEL SECURITY;

-- ============ PIECES JOINTES ============
CREATE TABLE public.pieces_jointes (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  reclamation_id UUID NOT NULL REFERENCES public.reclamations(id) ON DELETE CASCADE,
  url_fichier TEXT NOT NULL,
  nom_fichier TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pieces_jointes TO authenticated;
GRANT ALL ON public.pieces_jointes TO service_role;
ALTER TABLE public.pieces_jointes ENABLE ROW LEVEL SECURITY;

-- ============ COMMENTAIRES ============
CREATE TABLE public.commentaires (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  reclamation_id UUID NOT NULL REFERENCES public.reclamations(id) ON DELETE CASCADE,
  auteur_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commentaires TO authenticated;
GRANT ALL ON public.commentaires TO service_role;
ALTER TABLE public.commentaires ENABLE ROW LEVEL SECURITY;

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  lien TEXT,
  lu BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============ UPDATED_AT TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_reclamations_updated BEFORE UPDATE ON public.reclamations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ HANDLE NEW USER ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
BEGIN
  INSERT INTO public.profiles (id, nom, prenom, email, telephone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'telephone'
  );

  _role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'client');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ HELPER: is member of a reclamation ============
CREATE OR REPLACE FUNCTION public.can_access_reclamation(_reclamation_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.reclamations r
    WHERE r.id = _reclamation_id
      AND (r.client_id = _user_id OR r.agent_id = _user_id)
  ) OR public.has_role(_user_id, 'admin')
$$;

-- ============ RLS POLICIES: profiles ============
CREATE POLICY "Profiles: view own" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'agent'));
CREATE POLICY "Profiles: update own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Profiles: admin insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ============ RLS POLICIES: user_roles ============
CREATE POLICY "Roles: view own or admin" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Roles: admin manage" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ RLS POLICIES: categories ============
CREATE POLICY "Categories: everyone reads" ON public.categories
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Categories: admin manage" ON public.categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ RLS POLICIES: reclamations ============
CREATE POLICY "Reclamations: view relevant" ON public.reclamations
  FOR SELECT TO authenticated
  USING (
    client_id = auth.uid()
    OR agent_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'agent')
  );
CREATE POLICY "Reclamations: client creates own" ON public.reclamations
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());
CREATE POLICY "Reclamations: agent/admin update" ON public.reclamations
  FOR UPDATE TO authenticated
  USING (
    agent_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'agent')
    OR client_id = auth.uid()
  );
CREATE POLICY "Reclamations: admin delete" ON public.reclamations
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ RLS POLICIES: pieces_jointes ============
CREATE POLICY "Pieces: view if access" ON public.pieces_jointes
  FOR SELECT TO authenticated
  USING (public.can_access_reclamation(reclamation_id, auth.uid()));
CREATE POLICY "Pieces: insert if access" ON public.pieces_jointes
  FOR INSERT TO authenticated
  WITH CHECK (public.can_access_reclamation(reclamation_id, auth.uid()));
CREATE POLICY "Pieces: delete if access" ON public.pieces_jointes
  FOR DELETE TO authenticated
  USING (public.can_access_reclamation(reclamation_id, auth.uid()));

-- ============ RLS POLICIES: commentaires ============
CREATE POLICY "Commentaires: view if access" ON public.commentaires
  FOR SELECT TO authenticated
  USING (public.can_access_reclamation(reclamation_id, auth.uid()));
CREATE POLICY "Commentaires: insert if access" ON public.commentaires
  FOR INSERT TO authenticated
  WITH CHECK (auteur_id = auth.uid() AND public.can_access_reclamation(reclamation_id, auth.uid()));

-- ============ RLS POLICIES: notifications ============
CREATE POLICY "Notifications: view own" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Notifications: update own" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Notifications: insert any authenticated" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- ============ SEED CATEGORIES ============
INSERT INTO public.categories (nom, description) VALUES
  ('Carte bancaire', 'Problèmes liés aux cartes de paiement'),
  ('Virement', 'Réclamations concernant les virements'),
  ('Prélèvement', 'Problèmes de prélèvements automatiques'),
  ('Service en ligne', 'Application mobile et espace web'),
  ('Agence', 'Réclamations liées à une agence'),
  ('Autre', 'Autres types de réclamations');
