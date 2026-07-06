
-- Tighten helper function execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_access_reclamation(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_reclamation(uuid, uuid) TO authenticated;

-- Replace permissive notifications insert policy with self-only
DROP POLICY IF EXISTS "Notifications: insert any authenticated" ON public.notifications;
CREATE POLICY "Notifications: insert own" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Auto-notify client when reclamation status changes
CREATE OR REPLACE FUNCTION public.notify_reclamation_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.statut IS DISTINCT FROM OLD.statut THEN
    INSERT INTO public.notifications (user_id, message, lien)
    VALUES (
      NEW.client_id,
      'Le statut de votre réclamation "' || NEW.titre || '" est passé à ' || NEW.statut,
      '/client/reclamations/' || NEW.id
    );
  END IF;
  IF NEW.agent_id IS DISTINCT FROM OLD.agent_id AND NEW.agent_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, message, lien)
    VALUES (
      NEW.agent_id,
      'Une réclamation vous a été affectée : "' || NEW.titre || '"',
      '/agent/reclamations/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_reclamation_status() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_notify_status AFTER UPDATE ON public.reclamations
  FOR EACH ROW EXECUTE FUNCTION public.notify_reclamation_status();

-- Auto-notify the other party when a new comment is posted
CREATE OR REPLACE FUNCTION public.notify_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rec public.reclamations%ROWTYPE;
  _target UUID;
BEGIN
  SELECT * INTO _rec FROM public.reclamations WHERE id = NEW.reclamation_id;
  IF _rec.client_id = NEW.auteur_id THEN
    _target := _rec.agent_id;
  ELSE
    _target := _rec.client_id;
  END IF;
  IF _target IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, message, lien)
    VALUES (
      _target,
      'Nouveau message sur la réclamation "' || _rec.titre || '"',
      '/reclamations/' || _rec.id
    );
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_new_comment() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_notify_comment AFTER INSERT ON public.commentaires
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_comment();
