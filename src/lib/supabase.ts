import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from import.meta.env or from localStorage if user tested/configured in-app
const getEnvOrStored = (key: string, envVal: string | undefined): string => {
  if (envVal && !envVal.includes('your-project') && !envVal.includes('your-anon-key')) {
    return envVal.trim();
  }
  try {
    const stored = localStorage.getItem(key);
    if (stored) return stored.trim();
  } catch {
    // Ignore localStorage access errors
  }
  return '';
};

export const getStoredSupabaseCredentials = () => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  const url = getEnvOrStored('aetra_supabase_url', envUrl);
  const key = getEnvOrStored('aetra_supabase_anon_key', envKey);

  return { url, key };
};

// Check if credentials are validly provided (not empty and not placeholder)
export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getStoredSupabaseCredentials();
  return (
    Boolean(url) &&
    Boolean(key) &&
    url.startsWith('https://') &&
    !url.includes('your-project') &&
    !key.includes('your-anon-key')
  );
};

// Function to create or get client
export const getSupabaseClient = (): SupabaseClient => {
  const { url, key } = getStoredSupabaseCredentials();
  if (isSupabaseConfigured()) {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return createClient(
    'https://dummy-project.supabase.co',
    'dummy-anon-key-placeholder',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
};

// Singleton export
export let supabase = getSupabaseClient();

// Re-initialize client if user updates credentials
export const reloadSupabaseClient = () => {
  supabase = getSupabaseClient();
  return supabase;
};

export const getSupabaseConfig = () => {
  const { url, key } = getStoredSupabaseCredentials();
  return {
    url,
    anonKey: key ? `${key.substring(0, 15)}...${key.slice(-6)}` : '',
    isConfigured: isSupabaseConfigured(),
  };
};

