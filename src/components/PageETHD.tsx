// Dropdown for event details (above PageETHD)
const EventDropdown = ({ event }: { event: any }) => {
	const [open, setOpen] = React.useState(false);
	return (
		<>
			<li style={listItemStyle}>
				<span style={{ cursor: 'pointer' }} onClick={() => setOpen((v) => !v)}>
					<strong>{event.slug}</strong> <span style={{ color: colors.secondary }}>({event.guest_limit} guests max)</span>
					<br />
					<span style={{ fontSize: 13, color: colors.text }}>{event.url}</span>
				</span>
				<span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', minWidth: 120 }}>
					<button style={{
						background: '#4EF2A1',
						color: '#fff',
						border: 'none',
						borderRadius: '6px',
						padding: '8px 0',
						width: 120,
						cursor: 'pointer',
						fontWeight: 600
					}}>Approve</button>
					<button style={{
						background: '#F24E4E',
						color: '#fff',
						border: 'none',
						borderRadius: '6px',
						padding: '8px 0',
						width: 120,
						cursor: 'pointer',
						fontWeight: 600
					}}>Reject</button>
				</span>
			</li>
			{open && (
				<li style={{
					background: colors.card,
					borderRadius: 8,
					padding: 16,
					marginTop: -8,
					marginBottom: 12,
					color: colors.text,
					boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
				}}>
					<div><strong>Slug:</strong> {event.slug}</div>
					<div><strong>URL:</strong> <a href={event.url} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent }}>{event.url}</a></div>
					<div><strong>Location:</strong> {event.address?.latitude}, {event.address?.longitude}</div>
					<div><strong>Guest Limit:</strong> {event.guest_limit}</div>
					<div><strong>Guests:</strong> {event.guests}</div>
					<div><strong>Cost:</strong> {event.cost}</div>
					<div><strong>Welcome Text:</strong> {event.welcome_text ?? "N/A"}</div>
				</li>
			)}
		</>
	);
};
// Dropdown for event details (outside PageETHD)

import * as React from 'react';
import { useEffect, useState } from "react";
import { createLemonadeClient } from "../lib/lemonadeClient";


import '../styles/PageCommon.css';
import colors from '../styles/colors';

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
				<h2 style={{ color: colors.text, fontWeight: 400, marginBottom: 32 }}>Approve/Reject Sidevent Applications</h2>

				{/* Event Details */}
				{/* <div style={cardStyle}>
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
				</div> */}

				{/* Sidevent Applications */}
				<div style={cardStyle}>
					<h3 style={{ color: colors.accent, marginBottom: 16 }}>Sidevent Applications</h3>
					{loading ? (
						<div style={{ color: colors.text }}>Loading applications...</div>
					) : event ? (
						<ul style={{ listStyle: 'none', padding: 0 }}>
							<EventDropdown event={event} />
						</ul>
// Dropdown for event details
					) : (
						<div style={{ color: colors.text }}>No applications found.</div>
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
