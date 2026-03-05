const CONFIG_WARNING = 'Supabase configuration missing. Provide supabase-url and supabase-anon-key meta tags.';

function getMetaContent(name) {
  const element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    return null;
  }
  const value = element.getAttribute('content');
  if (!value || !value.trim()) {
    return null;
  }
  return value.trim();
}

const supabaseUrl = getMetaContent('supabase-url');
const supabaseAnonKey = getMetaContent('supabase-anon-key');

const supabaseLibrary = typeof window !== 'undefined' ? window.supabase : null;
const supabase =
  supabaseLibrary && supabaseUrl && supabaseAnonKey
    ? supabaseLibrary.createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabase) {
  console.warn(CONFIG_WARNING);
}

// Set to true once the public launch is live so new accounts can be created again.
const SIGNUPS_ENABLED = false;
const SIGNUPS_BLOCKED_MESSAGE = 'New account creation is closed until launch.';

async function handleEmailConfirmation() {
  if (!supabase) {
    return;
  }
  const hash = window.location.hash || '';
  if (hash.includes('access_token')) {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('Email confirmation failed:', error);
      return;
    }
    window.location.href = '/';
  }
}

handleEmailConfirmation();

export function getSupabaseClient(options = {}) {
  const { required = true } = options;
  if (!supabase && required) {
    throw new Error(CONFIG_WARNING);
  }
  return supabase;
}

export function isSupabaseConfigured() {
  return Boolean(supabase);
}

export function areSignupsEnabled() {
  return SIGNUPS_ENABLED;
}

export async function signup(email, password) {
  if (!SIGNUPS_ENABLED) {
    return { data: null, error: new Error(SIGNUPS_BLOCKED_MESSAGE) };
  }
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password
  });
  return { data, error };
}

export async function login(email, password) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    return { data, error };
  }
  const confirmedAt = data?.user?.email_confirmed_at || data?.session?.user?.email_confirmed_at;
  if (!confirmedAt) {
    await client.auth.signOut();
    return { data: null, error: new Error('Please confirm your email before logging in.') };
  }
  return { data, error: null };
}

export async function getCurrentUser() {
  const client = getSupabaseClient();
  const {
    data: { user }
  } = await client.auth.getUser();
  return user;
}

export async function logout() {
  const client = getSupabaseClient();
  await client.auth.signOut();
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
