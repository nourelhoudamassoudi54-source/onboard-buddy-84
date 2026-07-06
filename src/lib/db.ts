import { supabase } from "@/integrations/supabase/client";

// The generated types file may lag behind the latest migration.
// This lightweight wrapper gives us reliable, untyped table access while
// we keep strong app-level typing via the interfaces in `types.ts`.
export const db = supabase as unknown as {
  from: (table: string) => any;
};

export { supabase };
