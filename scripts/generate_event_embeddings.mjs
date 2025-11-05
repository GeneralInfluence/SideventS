import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const openaiApiKey = process.env.OPENAI_API_KEY;

async function getEmbedding(text) {
	const response = await fetch('https://api.openai.com/v1/embeddings', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${openaiApiKey}`,
		},
		body: JSON.stringify({
			model: 'text-embedding-ada-002',
			input: text,
		}),
	});
	const data = await response.json();
	if (!data.data || !data.data[0] || !data.data[0].embedding) {
		throw new Error('Failed to get embedding: ' + JSON.stringify(data));
	}
	return data.data[0].embedding;
}

async function main() {
	const { data: events, error } = await supabase
		.from('event_profiles')
		.select(`id, event_name, description, categories, tags, city, event_format, start_time, end_time, full_address`);
	if (error) {
		console.error('Error fetching events:', error);
		return;
	}
	for (const event of events) {
		// Concatenate relevant fields for richer embedding
		const text = [
			event.event_name,
			event.description,
			event.categories,
			event.tags,
			event.city,
			event.event_format,
			event.start_time,
			event.end_time,
			event.full_address
		].filter(Boolean).join('. ');
		try {
			const embedding = await getEmbedding(text);
			console.log(`Embedding for event '${event.event_name}':`, embedding && embedding.length ? `[${embedding.slice(0,5).join(', ')} ...]` : embedding);
			const { error: updateError, status, data: updateData } = await supabase
				.from('event_profiles')
				.update({ embedding })
				.eq('id', event.id);
			if (updateError) {
				console.error(`Supabase update error for event '${event.event_name}':`, updateError.message);
			} else {
				console.log(`Updated embedding for event: ${event.event_name} (status: ${status})`);
			}
		} catch (err) {
			console.error(`Error updating embedding for event ${event.event_name}:`, err.message);
		}
	}
}

main();
// This file has been renamed to .mjs for ES module compatibility
