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

export async function getOpenAiEventAnswer(query: string, events: any[], apiKey: string): Promise<string> {
  // Prepare a prompt with the user's query and a summary of events
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
      max_tokens: 400
    })
  });

  if (!response.ok) {
    throw new Error('OpenAI API error: ' + response.statusText);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No answer.';
}
