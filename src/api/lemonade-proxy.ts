// src/api/lemonade-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Example: Proxy Lemonade GraphQL requests securely
  const endpoint = process.env.LEMONADE_GRAPHQL_ENDPOINT;
  const token = process.env.LEMONADE_AUTH_TOKEN;
  if (!endpoint || !token) {
    return res.status(500).json({ error: 'Lemonade credentials not configured' });
  }
  const { query, variables } = req.body;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables })
  });
  const data = await response.json();
  res.status(200).json(data);
}
