// src/pages/api/supabase-proxy.ts
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  if (req.method === 'POST') {
    const { action } = req.body;
    if (action === 'getAllEventProfiles') {
      // Fetch all event profiles from Supabase
      const { data, error } = await supabase
        .from('event_profiles')
        .select('*');
      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message, details: error });
      }
      if (!data) {
        console.error('Supabase returned no data for event_profiles');
        return res.status(500).json({ error: 'No data returned from event_profiles' });
      }
      return res.status(200).json({ data });
    }
    if (action === 'searchEventsByEmbedding') {
      // Example: naive vector search (replace with real vector DB if available)
      const { embedding, topK = 5 } = req.body;
      if (!embedding || !Array.isArray(embedding)) {
        return res.status(400).json({ error: 'Missing or invalid embedding' });
      }
      // Fetch all event profiles
      const { data, error } = await supabase
        .from('event_profiles')
        .select('*');
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      // Assume each event has an 'embedding' field (array of numbers)
      const scored = (data || []).map(ev => {
        if (!ev.embedding || !Array.isArray(ev.embedding)) return { ev, score: -Infinity };
        // Cosine similarity
        const dot = embedding.reduce((sum: number, v: number, i: number) => sum + v * (ev.embedding[i] || 0), 0);
        const normA = Math.sqrt(embedding.reduce((sum: number, v: number) => sum + v * v, 0));
        const normB = Math.sqrt(ev.embedding.reduce((sum: number, v: number) => sum + v * v, 0));
        const score = normA && normB ? dot / (normA * normB) : -Infinity;
        return { ev, score };
      });
      scored.sort((a, b) => b.score - a.score);
      const topEvents = scored.slice(0, topK).map(s => s.ev);
      return res.status(200).json({ data: topEvents });
    }
    // Example: Insert a row into 'user_profiles'
    const { wallet_address, lemonade_id, created_at } = req.body;
    if (wallet_address && lemonade_id) {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{ wallet_address, lemonade_id, created_at }]);
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ data });
    }
    return res.status(400).json({ error: 'Invalid request body' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
