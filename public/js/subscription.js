import { getSupabaseClient } from './supabaseClient.js';
import { getCurrentUser } from '../auth/state.js';

export async function fetchSubscriptionStatus() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  const client = getSupabaseClient({ required: false });
  if (!client) {
    return null;
  }
  const { data, error } = await client
    .from('profiles')
    .select('subscription_status, plan, current_period_end')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Subscription lookup failed', error);
    throw error;
  }
  return data;
}

export async function routeBySubscription({ onActive, onInactive }) {
  const data = await fetchSubscriptionStatus();
  if (data?.subscription_status === 'active') {
    if (typeof onActive === 'function') {
      onActive(data);
    }
    return data;
  }
  if (typeof onInactive === 'function') {
    onInactive(data);
  }
  return data;
}
