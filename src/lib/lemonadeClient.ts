// Proxy Lemonade GraphQL requests through the secure server-side API endpoint

import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../generated/lemonade-sdk';

export async function lemonadeGraphQL(query: string, variables?: Record<string, unknown>) {
  const response = await fetch('/api/lemonade-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  return await response.json();
}

export function createLemonadeClient() {
  const endpoint = process.env.LEMONADE_GRAPHQL_ENDPOINT || 'https://backend.lemonade.social/';
  const client = new GraphQLClient(endpoint);
  return getSdk(client);
}
