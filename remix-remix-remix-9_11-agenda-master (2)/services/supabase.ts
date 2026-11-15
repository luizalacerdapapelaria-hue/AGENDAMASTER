import { createClient } from '@supabase/supabase-js';
import { localStorage } from './safeStorage';

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
  window.location.hostname.includes('ais-pre') ||
  window.location.hostname.includes('run.app') ||
  window.location.hostname.includes('webcontainer-api') ||
  window.location.hostname.includes('stackblitz')
);

// Check if email belongs to the administrator/tutor
export const isTutorOrAllowedEmail = (emailStr: string): boolean => {
  if (!emailStr) return false;
  const norm = emailStr.trim().toLowerCase();
  return (
    norm === 'luizalacerdamachado@gmail.com' ||
    norm === 'luizalacerdapapelaria@gmail.com' ||
    norm === 'luizalacerdaatelie@gmail.com'
  );
};

const resolvedUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const resolvedKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key';

// Main authenticated client with non-blocking lock (prevents Chrome/Safari navigator.locks infinite hangs)
export const supabase = createClient(resolvedUrl, resolvedKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
      return await fn();
    },
  },
});

// Stateless client for pre-login checks (never attaches expired/corrupt JWTs from localStorage)
export const supabasePublic = createClient(resolvedUrl, resolvedKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'agendamaster-public-stateless',
  },
});
