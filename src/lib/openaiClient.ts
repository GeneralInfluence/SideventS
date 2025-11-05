export async function getOpenAiEmbedding(query: string): Promise<number[]> {
  // Call server-side API endpoint for embedding
  const response = await fetch('/api/openai-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, embedding: true })
  });
  const data = await response.json();
  if (!data.embedding) {
    throw new Error('Failed to get embedding: ' + JSON.stringify(data));
  }
  return data.embedding;
}
// src/lib/openaiClient.ts

export async function getOpenAiEventAnswer(query: string, events: any[]): Promise<string> {
  // Call server-side API endpoint for event answer
  const response = await fetch('/api/openai-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, events })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No answer.';
}
