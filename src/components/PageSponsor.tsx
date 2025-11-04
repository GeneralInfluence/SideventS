

import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';


function getCategories(events: any[]) {
	const cats = new Set<string>();
	events.forEach(e => {
		if (e.categories) {
			e.categories.split(',').forEach((cat: string) => cats.add(cat.trim()));
		}
	});
	return Array.from(cats);
}

function getEventsByCategory(events: any[], category: string) {
	return events.filter(e => e.categories && e.categories.split(',').map((c: string) => c.trim()).includes(category));
}

const cardStyle: React.CSSProperties = {
	background: '#23243A',
	borderRadius: '12px',
	padding: '18px',
	margin: '12px',
	color: '#fff',
	cursor: 'pointer',
	boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
	fontWeight: 600,
	fontSize: 18,
};

const eventStyle: React.CSSProperties = {
	background: '#18192B',
	borderRadius: '8px',
	padding: '12px',
	margin: '8px 0',
	color: '#fff',
};


const PageSponsor: React.FC = () => {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [events, setEvents] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchEvents() {
			setLoading(true);
			// Fetch all events from Supabase (no filter)
			const { data, error } = await supabase
				.from('event_profiles')
				.select('*');
			console.log('Supabase raw data:', data);
			if (error) {
				console.error('Supabase error:', error);
			}
			if (!data || data.length === 0) {
				console.warn('No events found.');
			}
			setEvents(data || []);
			setLoading(false);
		}
		fetchEvents();
	}, []);

	const categories = getCategories(events);
	const approvedEvents = selectedCategory ? getEventsByCategory(events, selectedCategory) : [];

	return (
		<div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
			<h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 24 }}>Sponsor Events & Categories</h1>
			{loading ? (
				<div style={{ color: '#F24E4E' }}>Loading events...</div>
			) : (
				<>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
						{categories.map(cat => (
							<div
								key={cat}
								style={{ ...cardStyle, border: selectedCategory === cat ? '2px solid #4EF2A1' : 'none' }}
								onClick={() => setSelectedCategory(cat)}
							>
								{cat}
							</div>
						))}
					</div>
					{selectedCategory && (
						<div>
							<h2 style={{ color: '#4EF2A1', fontWeight: 700, marginBottom: 16 }}>Approved Events in "{selectedCategory}"</h2>
							{approvedEvents.length === 0 ? (
								<div style={{ color: '#F24E4E' }}>No approved events in this category.</div>
							) : (
								approvedEvents.map(ev => (
									<div key={ev.id || ev.event_id || ev.Event} style={eventStyle}>
										<strong>{ev.event_name || ev.name || ev.Event}</strong>
										{ev.organizer && (
											<span style={{ color: '#4EF2A1', fontWeight: 500 }}> by {ev.organizer}</span>
										)}
										<br />
										{ev.venue && <span style={{ fontSize: 13 }}>{ev.venue}</span>}
										{ev.full_address && <span style={{ fontSize: 13 }}> — {ev.full_address}</span>}
										<br />
										{ev.registration_url && (
											<a href={ev.registration_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4EF2A1' }}>Registration</a>
										)}
									</div>
								))
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default PageSponsor;
