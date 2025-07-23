
import { createClient } from '@supabase/supabase-js';

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side environment
// as it bypasses RLS policies!
export const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(
    supabaseUrl,
    supabaseServiceKey
  );
};
