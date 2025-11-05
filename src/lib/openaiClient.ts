export async function getOpenAiEmbedding(query: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: query,
    }),
  });
  const data = await response.json();
  if (!data.data || !data.data[0] || !data.data[0].embedding) {
    throw new Error('Failed to get embedding: ' + JSON.stringify(data));
  }
  return data.data[0].embedding;
}
// src/lib/openaiClient.ts

// Removed getOpenAiEventAnswer to ensure OpenAI secret key is not loaded on the frontend.
