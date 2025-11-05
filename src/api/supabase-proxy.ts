// api/supabase-proxy.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return res.status(500).json({ error: 'Supabase environment variables not configured' });
  }
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Example: Insert a row into 'user_profiles'
  if (req.method === 'POST') {
    const { wallet_address, lemonade_id, created_at } = req.body;
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{ wallet_address, lemonade_id, created_at }]);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ data });
  }

  res.status(405).json({ error: 'Method not allowed' });
}