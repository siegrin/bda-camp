
import { createBrowserClient } from '@supabase/ssr';

// This function creates a Supabase client for use in browser components.
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
