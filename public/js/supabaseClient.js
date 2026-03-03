const CONFIG_WARNING = 'Supabase configuration missing. Provide supabase-url and supabase-anon-key meta tags.';

const supabaseUrl = document
  .querySelector('meta[name="supabase-url"]')
  .getAttribute('content');

const supabaseAnonKey = document
  .querySelector('meta[name="supabase-anon-key"]')
  .getAttribute('content');

const supabaseLibrary = typeof window !== 'undefined' ? window.supabase : null;
const supabase =
  supabaseLibrary && supabaseUrl && supabaseAnonKey
    ? supabaseLibrary.createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabase) {
  console.warn(CONFIG_WARNING);
}

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

export async function login(email, password) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}

export async function signup(email, password) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password
  });
  return { data, error };
}

export async function getCurrentUser() {
  const client = getSupabaseClient({ required: false });
  if (!client) {
    return null;
  }
  const {
    data: { user }
  } = await client.auth.getUser();
  return user;
}

export async function logout() {
  const client = getSupabaseClient({ required: false });
  if (!client) {
    return;
  }
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
