
import * as React from 'react';
import '../styles/PageCommon.css';
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
  const [newEventDate, setNewEventDate] = useState('');
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
    // Here, you would submit the event to Lemonade and get the lemonade_id
    // For demonstration, we'll use eventShortId as lemonade_id
    const lemonade_id = eventShortId;
    // Timestamp
    const created_at = new Date().toISOString();
    // Upsert user profile in Supabase
    if (!walletAddress || typeof walletAddress !== 'string') {
      alert('Please connect your wallet before submitting an event.');
      return;
    }
    try {
      const profile = {
        wallet_address: walletAddress,
        lemonade_id,
        created_at,
      };
      const { error } = await upsertUserProfile(profile);
      if (error) {
        console.error('Supabase upsert error:', error);
        alert('Failed to save user profile.');
      } else {
        alert('Event submitted and user profile updated!');
      }
    } catch (err) {
      console.error('Error submitting event:', err);
      alert('Error submitting event.');
    }
    setNewEventName('');
    setNewEventDate('');
  };

  return (
    <div>

      <h2 style={{ color: '#d44ea8', fontWeight: 700, fontSize: 44, textAlign: 'center' }}>Host Dashboard</h2>

      <div style={{ color: '#613f5c', marginBottom: 24 }}>Host MongoID: {hostId ?? 'Loading...'}</div>

      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <h3 style={{ color: '#d44ea8', marginBottom: 8 }}>Submit New Side Event</h3>
        <input
          type="text"
          placeholder="Event Name"
          value={newEventName}
          onChange={e => setNewEventName(e.target.value)}
          style={{ padding: 8, marginRight: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <input
          type="date"
          value={newEventDate}
          onChange={e => setNewEventDate(e.target.value)}
          style={{ padding: 8, marginRight: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, background: '#d44ea8', color: '#fff', border: 'none', fontWeight: 600 }}>
          Submit
        </button>
      </form>

      <h3 style={{ color: '#d44ea8', marginBottom: 8 }}>Your Submitted Events</h3>
      {loading ? (
        <div style={{ color: '#613f5c' }}>Loading events...</div>
      ) : events.length === 0 ? (
        <div style={{ color: '#613f5c' }}>No events submitted yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {events.map(ev => (
            <li key={ev._id} style={{ background: '#23243A', color: '#a0aeaf', borderRadius: 8, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                <strong>{ev.name}</strong> <span style={{ color: '#613f5c' }}>({ev.start})</span>
              </span>
              <span style={{ color: ev.status === 'approved' ? '#4EF2A1' : '#d44ea8', fontWeight: 600 }}>{ev.status ?? 'pending'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PageHost;
