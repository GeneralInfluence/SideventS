// src/pages/api/openai-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { query, events, embedding } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    if (embedding) {
      // Handle embedding request
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: query
        })
      });
      const data = await response.json();
      if (!response.ok || !data.data || !data.data[0]?.embedding) {
        console.error('OpenAI embedding error:', data);
        return res.status(500).json({ error: 'OpenAI embedding error', details: data });
      }
      return res.status(200).json({ embedding: data.data[0].embedding });
    }
    // Handle chat completion request
    const prompt = `You are an ETHDenver event assistant. Answer the user's question using the following event data.\n\nEvents:\n${events && Array.isArray(events) ? events.map(e => `Name: ${e.event_name}, Type: ${e.type}, Location: ${e.location}, Start: ${e.start_time}, Description: ${e.description}`).join('\n') : ''}\n\nUser question: ${query}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an ETHDenver event assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 512
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return res.status(500).json({ error: 'OpenAI API error', details: data });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('openai-proxy error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
