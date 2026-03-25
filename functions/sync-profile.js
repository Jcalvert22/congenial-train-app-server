function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(body), { ...init, headers });
}

function textResponse(body, init = {}) {
  return new Response(body, init);
}

function assertEnv(env) {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(key => !env?.[key]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

async function getSupabaseUser(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    return null;
  }
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

function buildSupabaseHeaders(serviceRoleKey) {
  return {
    'Content-Type': 'application/json',
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    Prefer: 'return=representation'
  };
}

async function fetchProfile(env, userId) {
  const url = `${env.SUPABASE_URL}/rest/v1/profile?id=eq.${encodeURIComponent(userId)}&select=id,email,stripe_customer_id,subscription_status,current_period_end`;
  const response = await fetch(url, {
    headers: buildSupabaseHeaders(env.SUPABASE_SERVICE_ROLE_KEY)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Profile lookup failed (${response.status}): ${errorText}`);
  }
  const data = await response.json();
  return data?.[0] || null;
}

async function insertProfile(env, userId, email) {
  const payload = {
    id: userId,
    stripe_customer_id: 'pending',
    subscription_status: 'inactive',
    current_period_end: new Date(0).toISOString()
  };
  if (email) {
    payload.email = email;
  }
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/profile`, {
    method: 'POST',
    headers: buildSupabaseHeaders(env.SUPABASE_SERVICE_ROLE_KEY),
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Profile insert failed (${response.status}): ${errorText}`);
  }
  const data = await response.json();
  return data?.[0] || payload;
}

async function ensureProfile(env, userId, email) {
  let profile = await fetchProfile(env, userId);
  if (profile) {
    if (email && !profile.email) {
      profile = { ...profile, email };
      await fetch(`${env.SUPABASE_URL}/rest/v1/profile?id=eq.${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: buildSupabaseHeaders(env.SUPABASE_SERVICE_ROLE_KEY),
        body: JSON.stringify({ email })
      });
    }
    return profile;
  }
  return insertProfile(env, userId, email);
}

export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    assertEnv(env);
  } catch (error) {
    console.error('sync-profile missing configuration', error);
    return textResponse('Server misconfiguration', { status: 500 });
  }

  const supabaseUser = await getSupabaseUser(request, env);
  if (!supabaseUser?.id) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = supabaseUser.id;
  const email = supabaseUser.email || null;

  try {
    const profile = await ensureProfile(env, userId, email);
    return jsonResponse({ profile });
  } catch (error) {
    console.error('sync-profile failed', error);
    return jsonResponse({ error: error?.message || 'Unable to sync profile.' }, { status: 500 });
  }
}
