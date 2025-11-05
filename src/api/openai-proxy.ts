// src/api/openai-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { query, events } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }
  const prompt = `You are an ETHDenver event assistant. Answer the user's question using the following event data.\n\nEvents:\n${events.map(e => `Name: ${e.event_name}, Type: ${e.type}, Location: ${e.location}, Start: ${e.start_time}, Description: ${e.description}`).join('\n')}\n\nUser question: ${query}`;
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
  res.status(200).json(data);
}
