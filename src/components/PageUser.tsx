
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getOpenAiEventAnswer, getOpenAiEmbedding } from '../lib/openaiClient';
import { searchEventsByEmbedding } from '../lib/supabaseClient';

type EventProfile = {
	id?: string;
	event_name?: string;
	event_id?: string;
	name?: string;
	type?: string;
	location?: string;
	start_time?: string;
	end_time?: string;
	attendee_count?: number;
	description?: string;
	lemonade_url?: string;
};


const PageUser: React.FC = () => {
	const [events, setEvents] = useState<EventProfile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [aiQuery, setAiQuery] = useState('');
	const [aiResponse, setAiResponse] = useState<string | null>(null);
	const [aiLoading, setAiLoading] = useState(false);
	const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string;

	useEffect(() => {
		const fetchEvents = async () => {
			setLoading(true);
			setError(null);
			const { data, error } = await supabase
				.from('event_profiles')
				.select('*')
				.order('start_time', { ascending: true });
			if (error) {
				setError(error.message);
			} else {
				setEvents(data || []);
			}
			setLoading(false);
		};
		fetchEvents();
	}, []);


		const handleAiSearch = async (e: React.FormEvent) => {
			e.preventDefault();
			setAiLoading(true);
			setAiResponse(null);
			try {
				if (!apiKey) {
					setAiResponse('Please enter your OpenAI API key.');
					setAiLoading(false);
					return;
				}
				// Step 1: Get query embedding
				const queryEmbedding = await getOpenAiEmbedding(aiQuery, apiKey);
				// Step 2: Vector search for top events
				const topEvents = await searchEventsByEmbedding(queryEmbedding, 5);
				// Step 3: Get AI answer using only top events
				const answer = await getOpenAiEventAnswer(aiQuery, topEvents, apiKey);
				setAiResponse(answer);
			} catch (err: any) {
				setAiResponse('Error: ' + (err?.message || 'Unknown error'));
			}
			setAiLoading(false);
		};

	return (
		<div>
			<h2>User Dashboard: ETHDenver Events</h2>
			{/* AI Search Area */}
								<form onSubmit={handleAiSearch} style={{ marginBottom: '2em' }}>
									<label htmlFor="ai-search">Ask about events:</label><br />
									<input
										id="ai-search"
										type="text"
										value={aiQuery}
										onChange={e => setAiQuery(e.target.value)}
										style={{ width: '60%', marginRight: '1em' }}
										placeholder="e.g. social events on Feb 21, job hunting, etc."
									/>
									<button type="submit" disabled={aiLoading || !aiQuery}>
										{aiLoading ? 'Searching...' : 'Ask AI'}
									</button>
								</form>
			{/* AI Dialogue Area */}
			{aiResponse && (
				<div style={{ background: '#f6f6f6', padding: '1em', borderRadius: '8px', marginBottom: '2em' }}>
					<strong>AI Response:</strong>
					<p>{aiResponse}</p>
				</div>
			)}
			{/* Events List */}
			{loading && <p>Loading events...</p>}
			{error && <p style={{ color: 'red' }}>Error: {error}</p>}
			{!loading && !error && (
				<ul>
					 {events.map(event => (
						 <li key={event.id} style={{ marginBottom: '1em' }}>
							 <strong>{event.event_name}</strong> <br />
							 {/* You may need to update the following fields if your SQL function returns them, or add fallback for undefined fields */}
							 {event.type && <span>Type: {event.type}</span>} <br />
							 {event.location && <span>Location: {event.location}</span>} <br />
							 {event.start_time && <span>Start: {event.start_time}</span>} <br />
							 {event.lemonade_url && (
								 <a href={event.lemonade_url} target="_blank" rel="noopener noreferrer">Lemonade Link</a>
							 )}
							 <br />
							 <span>{event.description}</span>
						 </li>
					 ))}
				</ul>
			)}
		</div>
	);
};

export default PageUser;
