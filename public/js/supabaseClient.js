import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CONFIG_WARNING = 'Supabase configuration missing. Provide supabase-url and supabase-anon-key meta tags or window.__AAA_CONFIG__.';

let cachedConfig = null;
let supabaseClient = null;

function readMeta(name) {
  if (typeof document === 'undefined') {
    return null;
  }
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || null;
}

function resolveConfig() {
  if (typeof window !== 'undefined' && window.__AAA_CONFIG__) {
    const { supabaseUrl, supabaseAnonKey } = window.__AAA_CONFIG__;
    if (supabaseUrl && supabaseAnonKey) {
      return { supabaseUrl, supabaseAnonKey };
    }
  }
  const supabaseUrl = readMeta('supabase-url');
  const supabaseAnonKey = readMeta('supabase-anon-key');
  return { supabaseUrl, supabaseAnonKey };
}

function haveConfig(config) {
  return Boolean(config?.supabaseUrl && config?.supabaseAnonKey);
}

function getConfig() {
  if (!cachedConfig) {
    cachedConfig = resolveConfig();
  }
  return cachedConfig;
}

function getClientInstance() {
  if (supabaseClient) {
    return supabaseClient;
  }
  const config = getConfig();
  if (!haveConfig(config)) {
    console.warn(CONFIG_WARNING);
    return null;
  }
  supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true
    }
  });
  return supabaseClient;
}

export function getSupabaseClient(options = {}) {
  const { required = true } = options;
  const client = getClientInstance();
  if (!client && required) {
    throw new Error(CONFIG_WARNING);
  }
  return client;
}

export function isSupabaseConfigured() {
  return haveConfig(getConfig());
}

export async function getCurrentUser() {
  const client = getSupabaseClient({ required: false });
  if (!client) {
    return null;
  }
  const { data, error } = await client.auth.getSession();
  if (error) {
    console.error('Unable to fetch Supabase session', error);
    return null;
  }
  return data?.session?.user || null;
}

export function onSupabaseAuthChange(callback) {
  const client = getSupabaseClient({ required: false });
  if (!client) {
    console.warn(CONFIG_WARNING);
    return { data: null, error: new Error(CONFIG_WARNING), unsubscribe() {} };
  }
  return client.auth.onAuthStateChange((event, session) => {
    try {
      callback(event, session?.user || null);
    } catch (error) {
      console.error('Auth change callback failed', error);
    }
  });
}
