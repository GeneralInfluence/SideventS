import * as React from 'react';
import '../styles/PageCommon.css';
import colors from '../styles/colors';
import { useEffect, useState } from 'react';
import { createLemonadeClient } from '../lib/lemonadeClient';
import { useUniversalWallet } from '../hooks/useUniversalWallet';
import { upsertUserProfile } from '../lib/supabaseClient';

type HostEvent = {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
};


interface PageHostProps {
  eventShortId: string;
}



const PageHost: React.FC<PageHostProps> = ({ eventShortId }) => {
  const [hostId, setHostId] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEventName, setNewEventName] = useState('');
  // Get wallet address from universal wallet hook
  const { address: walletAddress } = useUniversalWallet();

  // Step 1: Get host MongoID from event shortid
  useEffect(() => {
    (async () => {
      try {
        const sdk = createLemonadeClient();
        console.log('Fetched Lemonade SDK:', sdk);
        const { getEvent } = await sdk.GetEventByShortId({ shortid: eventShortId });
        console.log('Fetched event from Short ID:', getEvent);
        setHostId(getEvent?.host ?? null);
      } catch (err) {
        console.log('Fetched event from Short ID:', null);
        setHostId(null);
      }
    })();
  }, [eventShortId]);

  // Step 2: Fetch upcoming events for host
  useEffect(() => {
    if (!hostId) return;
    (async () => {
      setLoading(true);
      try {
        const sdk = createLemonadeClient();
        const { getUpcomingEvents } = await sdk.GetUpcomingEventsForHost({ user: hostId });
        console.log('Fetched upcoming events for host:', getUpcomingEvents);
        setEvents(getUpcomingEvents);
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [hostId]);

  // Submission logic: upsert user_profiles in Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Extract shortId from Lemonade event URL
    const urlMatch = newEventName.match(/lemonade\.social\/e\/([\w-]+)/);
    const lemonadeShortId = urlMatch ? urlMatch[1] : null;
    if (!lemonadeShortId) {
      alert('Please enter a valid Lemonade event URL.');
      return;
    }
    // created_at will be set from Lemonade event's start date
    if (!walletAddress || typeof walletAddress !== 'string') {
      alert('Please connect your wallet before submitting an event.');
      return;
    }
    try {
      // Fetch event info from Lemonade using shortId
      const sdk = createLemonadeClient();
      const { getEvent } = await sdk.GetEventByShortId({ shortid: lemonadeShortId });
      if (!getEvent || !getEvent._id) {
        alert('Could not fetch event info from Lemonade.');
        return;
      }
      const eventId = getEvent._id;
      // Upsert user profile in Supabase
      const profile = {
        wallet_address: walletAddress,
        lemonade_id: lemonadeShortId,
        created_at: getEvent.start || new Date().toISOString(),
      };
      const { error } = await upsertUserProfile(profile);
      if (error) {
        console.error('Supabase upsert error:', error);
        alert('Failed to save user profile.');
        setNewEventName('');
        return;
      }
      // Upsert event profile with approved_by_ethdenver: false
      const eventProfile = {
        id: eventId,
        approved_by_ethdenver: false,
      };
      const { error: eventError } = await import('../lib/supabaseClient').then(mod => mod.upsertEventProfile(eventProfile));
      if (eventError) {
        console.error('Supabase event profile upsert error:', eventError);
        alert('Failed to save event profile.');
      } else {
        alert('Event submitted, user profile and event profile updated!');
      }
    } catch (err) {
      console.error('Error submitting event:', err);
      alert('Error submitting event.');
    }
    setNewEventName('');
  };

  return (
    <div>
      <h2
        style={{
          color: colors.accent,
          fontWeight: 700,
          fontSize: 44,
          textAlign: 'center',
        }}
      >
        Host Dashboard
      </h2>

      <div style={{ color: colors.secondary, marginBottom: 24 }}>Host MongoID: {hostId ?? 'Loading...'}</div>

      <form onSubmit={handleSubmit} className="ai-search-form" > 
        <label htmlFor="ai-search">Submit New Side Event:</label>
        <input
          id="event-name"
          type="text"
          placeholder="Lemonade.Social Event URL"
          value={newEventName}
          onChange={e => setNewEventName(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: `1.5px solid ${colors.secondary}`,
            fontSize: '1rem',
            marginBottom: 8,
            background: colors.card,
            color: colors.text,
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            background: colors.accent,
            color: colors.card,
            border: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            marginTop: 4,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(212,78,168,0.08)',
            transition: 'background 0.15s',
          }}
        >
          Submit
        </button>
      </form>

      <h3 style={{ color: colors.accent, marginBottom: 8 }}>Your Submitted Events</h3>
      {loading ? (
        <div style={{ color: colors.secondary }}>Loading events...</div>
      ) : events.length === 0 ? (
        <div style={{ color: colors.secondary }}>No events submitted yet.</div>
      ) : (
        <div className="event-list">
          {events.map(ev => (
            <div
              className="event-card"
              key={ev._id}
              style={{
                background: colors.secondary,
                color: colors.text,
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(111,30,81,0.08)',
                padding: '1.5rem 1.2rem',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '120px',
                marginBottom: '18px',
                border: `2px solid ${colors.text}`,
                transition: 'transform 0.15s',
              }}
            >
              <strong
                style={{
                  fontSize: '1.2rem',
                  marginBottom: '0.5em',
                  color: colors.accent,
                  textShadow: '0 1px 2px ' + colors.secondary,
                }}
              >
                {ev.event_name}
              </strong>
              {ev.start && (
                <div style={{ color: colors.accent }}>
                  Date: {ev.start}
                </div>
              )}
              {ev.status && (
                <div
                  style={{
                    color:
                      ev.status === 'approved'
                        ? '#1e7c5a' // dark green
                        : ev.status === 'pending'
                        ? '#7c1e5a' // dark magenta
                        : colors.secondary,
                    background:
                      ev.status === 'approved'
                        ? 'rgba(78,242,161,0.15)'
                        : ev.status === 'pending'
                        ? 'rgba(212,78,168,0.15)'
                        : 'rgba(97,63,92,0.15)',
                    borderRadius: 6,
                    padding: '4px 12px',
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: 1,
                    minWidth: 90,
                    textAlign: 'center',
                    marginTop: '0.5em',
                  }}
                >
                  {ev.status}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageHost;
