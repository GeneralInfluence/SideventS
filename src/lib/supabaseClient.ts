export async function getAllEventProfiles() {
  const response = await fetch('/api/supabase-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getAllEventProfiles' })
  });
  return await response.json();
}
export async function searchEventsByEmbedding(embedding: number[], topK: number = 5) {
  const response = await fetch('/api/supabase-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'searchEventsByEmbedding', embedding, topK })
  });
  const result = await response.json();
  if (result.error) throw new Error(result.error);
  return result.data;
}


export async function getUserProfile(walletAddress: string) {
  const response = await fetch('/api/supabase-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getUserProfile', walletAddress })
  });
  return await response.json();
}


export async function upsertUserProfile(profile: {
  wallet_address: string;
  lemonade_id?: string;
  hosted_event_ids?: string[];
  submitted_event_ids?: string[];
}) {
  const response = await fetch('/api/supabase-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upsertUserProfile', profile })
  });
  return await response.json();
}

export async function upsertEventProfile(profile: {
  event_id: string;
  approved_by_ethdenver?: boolean;
  sponsorship_level?: string;
}) {
  const response = await fetch('/api/supabase-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upsertEventProfile', profile })
  });
  return await response.json();
}


export async function getEventProfile(eventId: string) {
  const response = await fetch('/api/supabase-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getEventProfile', eventId })
  });
  return await response.json();
}
