import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verify if the environment variables are correctly populated
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

// Helper to check if the app is running in a local or preview/development environment
export const isDevelopmentEnvironment = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('ais-dev') ||
  window.location.hostname.includes('webcontainer-api') ||
  window.location.hostname.includes('stackblitz')
);

// Check if email belongs to the administrator/tutor
export const isTutorOrAllowedEmail = (emailStr: string): boolean => {
  if (!emailStr) return false;
  const norm = emailStr.trim().toLowerCase();
  return (
    norm === 'luizalacerdapapelaria@gmail.com' ||
    norm === 'luizalacerdaatelie@gmail.com'
  );
};

// We use fallback placeholders here so the app never crashes during bundle or startup, 
// even if of the user hasn't configured the keys in settings yet.
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);
