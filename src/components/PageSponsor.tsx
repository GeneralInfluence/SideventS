

import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';
import colors from '../styles/colors';


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
	background: colors.card,
	borderRadius: '12px',
	padding: '10px 14px',
	margin: '8px',
	color: colors.text,
	cursor: 'pointer',
	boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
	fontWeight: 600,
	fontSize: 15,
	minWidth: 140,
	maxWidth: 180,
	textAlign: 'center',
	flex: '1 1 140px',
};

const eventStyle: React.CSSProperties = {
	background: colors.background,
	borderRadius: '8px',
	padding: '12px',
	margin: '8px 0',
	color: colors.text,
};


const PageSponsor: React.FC = () => {
		const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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
				   const eventsForSelected = selectedCategories.length > 0
					   ? Array.from(
						   new Map(
							   events
								   .filter(ev => selectedCategories.some(cat => ev.categories && ev.categories.split(',').map((c: string) => c.trim()).includes(cat)))
								   .map(ev => [ev.id || ev.event_id || ev.Event, ev])
						   ).values()
					   )
					   : [];

				   // Calculate total attendees from deduped events
				   const totalAttendees = eventsForSelected.reduce((sum, ev) => {
					   const count = typeof ev.attendees_shown === 'number' ? ev.attendees_shown : (parseInt(ev.attendees_shown) || 0);
					   return sum + count;
				   }, 0);

	const handleCategoryClick = (cat: string) => {
		setSelectedCategories(prev =>
			prev.includes(cat)
				? prev.filter(c => c !== cat)
				: [...prev, cat]
		);
	};

	   return (
		   <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', background: colors.background }}>
			   <div style={{ fontSize: 22, fontWeight: 700, color: colors.accent, marginBottom: 10 }}>
				   Total Attendees Reached: {selectedCategories.length > 0 ? totalAttendees : 0}
			   </div>
			   <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 24, color: colors.approved }}>Sponsor Events & Categories</h1>
			   {loading ? (
				<div style={{ color: '#F24E4E' }}>Loading events...</div>
			) : (
				<>
					   <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32, justifyContent: 'flex-start' }}>
						   {getCategories(events).map((cat: string) => (
							   <div
								   key={cat}
								   style={{
									   ...cardStyle,
									   border: selectedCategories.includes(cat) ? `2px solid ${colors.approved}` : 'none',
									   background: selectedCategories.includes(cat) ? colors.card : colors.background,
								   }}
								   onClick={() => handleCategoryClick(cat)}
							   >
								   {cat}
							   </div>
						   ))}
					   </div>
					{selectedCategories.length > 0 && (
						<div>
							   <h2 style={{ color: colors.approved, fontWeight: 700, marginBottom: 16 }}>
								Approved Events in {selectedCategories.map(c => `"${c}"`).join(', ')}
							</h2>
							{eventsForSelected.length === 0 ? (
								   <div style={{ color: colors.accent }}>No approved events in these categories.</div>
							) : (
								   eventsForSelected.map(ev => {
									   const eid = ev.id || ev.event_id || ev.Event;
									   return (
										   <div key={eid} style={eventStyle}>
											   <strong>{ev.event_name || ev.name || ev.Event}</strong>
											   {ev.organizer && (
												   <span style={{ color: colors.approved, fontWeight: 500 }}> by {ev.organizer}</span>
											   )}
											   <br />
											   {ev.venue && <span style={{ fontSize: 13 }}>{ev.venue}</span>}
											   {ev.full_address && <span style={{ fontSize: 13 }}> — {ev.full_address}</span>}
											   <br />
											   {ev.registration_url && (
												   <a href={ev.registration_url} target="_blank" rel="noopener noreferrer" style={{ color: colors.approved }}>Registration</a>
											   )}
											   <br />
											   <span style={{ color: colors.accent, fontWeight: 600 }}>
												   Attendees: {ev.attendees_shown !== undefined && ev.attendees_shown !== null ? ev.attendees_shown : 'N/A'}
											   </span>
										   </div>
									   );
								   })
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default PageSponsor;
