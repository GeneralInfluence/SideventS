// Proxy Lemonade GraphQL requests through the secure server-side API endpoint
export async function lemonadeGraphQL(query: string, variables?: any) {
  const response = await fetch('/api/lemonade-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  return await response.json();
}
