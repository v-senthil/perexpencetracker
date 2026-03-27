import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function isSupabaseConfigured() {
  return !!supabase;
}

export async function checkDbConnection() {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('trips').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
