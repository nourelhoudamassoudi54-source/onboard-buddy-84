
CREATE POLICY "PJ: read own folder" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'pieces-jointes' AND (auth.uid())::text = (storage.foldername(name))[1]);
CREATE POLICY "PJ: upload own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pieces-jointes' AND (auth.uid())::text = (storage.foldername(name))[1]);
CREATE POLICY "PJ: delete own folder" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'pieces-jointes' AND (auth.uid())::text = (storage.foldername(name))[1]);
CREATE POLICY "PJ: agents and admins read all" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'pieces-jointes' AND (public.has_role(auth.uid(),'agent') OR public.has_role(auth.uid(),'admin')));
