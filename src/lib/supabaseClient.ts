export async function searchEventsByEmbedding(embedding: number[], topK: number = 5) {
  const { data, error } = await supabase.rpc('match_event_profiles', {
    query_embedding: embedding,
    match_count: topK
  });
  if (error) throw error;
  return data;
}
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User Profile functions
export async function getUserProfile(walletAddress: string) {
  return supabase
    .from('user_profiles')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();
}

export async function upsertUserProfile(profile: {
  wallet_address: string;
  lemonade_id?: string;
  hosted_event_ids?: string[];
  submitted_event_ids?: string[];
}) {
  return supabase
    .from('user_profiles')
    .upsert([profile], { onConflict: 'wallet_address' });
}

// Event Profile functions
export async function getEventProfile(eventId: string) {
  return supabase
    .from('event_profiles')
    .select('*')
    .eq('event_id', eventId)
    .single();
}

export async function upsertEventProfile(profile: {
  event_id: string;
  approved_by_ethdenver?: boolean;
  sponsorship_level?: string;
}) {
  return supabase
    .from('event_profiles')
    .upsert([profile], { onConflict: 'event_id' });
}
