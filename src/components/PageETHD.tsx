
import * as React from 'react';
import { useEffect, useState } from "react";
import { createLemonadeClient } from "../lib/lemonadeClient";


// ETHDenver color palette
const colors = {
	background: '#020202', // deep black background
	card: '#f3f2f3',       // light gray-white for contrast
	accent: '#d44ea8',     // neon pink-magenta highlight
	text: '#a0aeaf',       // soft metallic cyan-gray text tone
	secondary: '#613f5c',  // dark purple secondary accent
};

const cardStyle: React.CSSProperties = {
	background: colors.card,
	borderRadius: '12px',
	padding: '24px',
	marginBottom: '32px',
	boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

const listItemStyle: React.CSSProperties = {
	background: '#23243A',
	borderRadius: '8px',
	padding: '16px',
	marginBottom: '12px',
	color: colors.text,
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
};


export async function resolveEvent(shortid: string) {
  const sdk = createLemonadeClient();
  const { getEvent } = await sdk.GetEventByShortId({ shortid });
  return getEvent;
}


export function EventView({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const data = await resolveEvent(eventId);
      setEvent(data);
    })();
  }, [eventId]);

  if (!event) return <div>Loading...</div>;

  return (
    <div>
      <h1>{event.slug}</h1>
      <p>Guests: {event.guests}</p>
      <p>Cost: ${event.cost}</p>
      <p>
        Coordinates: {event.address.latitude}, {event.address.longitude}
      </p>
    </div>
  );
}



const SHORTID = "SMu78xNR";

const PageETHD: React.FC = () => {
	const [event, setEvent] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const sdk = createLemonadeClient();
				const { getEvent } = await sdk.GetEventByShortId({ shortid: SHORTID });
				setEvent(getEvent);
			} catch (err) {
				setEvent(null);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<div style={{
			background: colors.background,
			minHeight: '100vh',
			padding: '40px 0',
			fontFamily: 'Inter, sans-serif',
			color: colors.text,
		}}>
			<div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
				<h1 style={{ color: colors.accent, fontSize: 40, fontWeight: 800, marginBottom: 8 }}>ETH Denver Admin</h1>
				<h2 style={{ color: colors.secondary, fontWeight: 400, marginBottom: 32 }}>ETHDA Dashboard</h2>

				{/* Event Details */}
				<div style={cardStyle}>
					<h3 style={{ color: colors.accent, marginBottom: 16 }}>Event Details</h3>
					{loading ? (
						<div style={{ color: colors.secondary }}>Loading event...</div>
					) : event ? (
						<div>
							<div><strong>Slug:</strong> {event.slug}</div>
							<div><strong>URL:</strong> <a href={event.url} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent }}>{event.url}</a></div>
							<div><strong>Location:</strong> {event.address?.latitude}, {event.address?.longitude}</div>
							<div><strong>Guest Limit:</strong> {event.guest_limit}</div>
							<div><strong>Guests:</strong> {event.guests}</div>
							<div><strong>Cost:</strong> {event.cost}</div>
							<div><strong>Welcome Text:</strong> {event.welcome_text ?? "N/A"}</div>
						</div>
					) : (
						<div style={{ color: colors.secondary }}>Event not found.</div>
					)}
				</div>

				{/* Sidevent Applications */}
				<div style={cardStyle}>
					<h3 style={{ color: colors.accent, marginBottom: 16 }}>Sidevent Applications</h3>
					{loading ? (
						<div style={{ color: colors.secondary }}>Loading applications...</div>
					) : event ? (
						<ul style={{ listStyle: 'none', padding: 0 }}>
							<li style={listItemStyle}>
								<span>
									<strong>{event.slug}</strong> <span style={{ color: colors.secondary }}>({event.guest_limit} guests max)</span>
									<br />
									<span style={{ fontSize: 13, color: colors.secondary }}>{event.url}</span>
								</span>
								<span style={{ color: colors.accent, fontWeight: 600 }}>Application</span>
							</li>
						</ul>
					) : (
						<div style={{ color: colors.secondary }}>No applications found.</div>
					)}
				</div>

				{/* Approved SideventS */}
				<div style={cardStyle}>
					<h3 style={{ color: colors.accent, marginBottom: 16 }}>Approved SideventS</h3>
					{loading ? (
						<div style={{ color: colors.secondary }}>Loading approved events...</div>
					) : event ? (
						<ul style={{ listStyle: 'none', padding: 0 }}>
							<li style={listItemStyle}>
								<span>
									<strong>{event.slug}</strong> <span style={{ color: colors.secondary }}>({event.guest_limit} guests max)</span>
									<br />
									<span style={{ fontSize: 13, color: colors.secondary }}>{event.url}</span>
								</span>
								<span style={{ color: '#4EF2A1', fontWeight: 600 }}>Approved</span>
							</li>
						</ul>
					) : (
						<div style={{ color: colors.secondary }}>No approved events found.</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PageETHD;
