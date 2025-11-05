// User Profile types
export type UserProfile = {
  wallet_address: string;
  lemonade_id?: string;
  hosted_event_ids?: string[];
  submitted_event_ids?: string[];
};

// Event Profile types
export type EventProfile = {
  id: string;
  approved_by_ethdenver?: boolean;
  sponsorship_level?: string;
};

// User Profile functions
export async function getUserProfile(walletAddress: string) {
  const response = await fetch(`/api/supabase/select?table=user_profiles&columns=*&wallet_address=eq.${walletAddress}`);
  const result = await response.json();
  if (result.error) throw new Error(result.error);
  return result.data?.[0] || null;
}

export async function upsertUserProfile(profile: UserProfile) {
  const response = await fetch('/api/supabase/insert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      table: 'user_profiles',
      data: [profile],
    }),
  });
  return response.json();
}

// Event Profile functions
export async function getEventProfile(eventId: string) {
  const response = await fetch(`/api/supabase/select?table=event_profiles&columns=*&id=eq.${eventId}`);
  const result = await response.json();
  if (result.error) throw new Error(result.error);
  return result.data?.[0] || null;
}

export async function upsertEventProfile(profile: EventProfile) {
  const response = await fetch('/api/supabase/insert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      table: 'event_profiles',
      data: [profile],
    }),
  });
  return response.json();
}