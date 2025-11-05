// src/pages/api/lemonade-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Example: Proxy Lemonade GraphQL requests securely
  const endpoint = process.env.LEMONADE_GRAPHQL_ENDPOINT;
  if (!endpoint) {
    return res.status(500).json({ error: 'Lemonade endpoint not configured' });
  }
  const { query, variables } = req.body;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables })
  });
  const data = await response.json();
  res.status(200).json(data);
}
