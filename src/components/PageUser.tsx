import nlp from "compromise";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
// import { getOpenAiEventAnswer, getOpenAiEmbedding } from "../lib/openaiClient";
import { searchEventsByEmbedding } from "../lib/supabaseClient";
import "../styles/PageCommon.css";
import colors from "../styles/colors";
import SponsorCarousel from "./SponsorCarousel";

type EventProfile = {
  id?: string;
  event_name?: string;
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
  const [displayEvents, setDisplayEvents] = useState<EventProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("event_profiles")
        .select("*")
        .order("start_time", { ascending: true });
      if (error) {
        setError(error.message);
      } else {
        setEvents(data || []);
        setDisplayEvents(data || []);
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
      // Step 1: Vector search for top events (embedding is manual, so use all events for now)
      const topEvents = events.slice(0, 10);

      // Extract keywords from query using compromise
      const doc = nlp(aiQuery);
      const keywords = doc
        .nouns()
        .out("array")
        .map((k: string) => k.toLowerCase());
      // Always include the normalized query as a fallback keyword
      const normalize = (str?: string) =>
        str ? str.toLowerCase().replace(/\s+/g, " ").trim() : "";
      const queryNorm = normalize(aiQuery);
      if (!keywords.includes(queryNorm) && queryNorm.length > 2)
        keywords.push(queryNorm);

      // Keyword filter: match any keyword in any event field
      const keywordMatches = events.filter((ev) => {
        const fields = [
          ev.event_name,
          ev.location,
          ev.description,
          ev.type,
        ].map(normalize);
        return keywords.some((kw: string) =>
          fields.some((f) => f.includes(kw))
        );
      });

      // Merge keyword and vector results, deduplicate by id
      const mergedEventsMap = new Map<string, EventProfile>();
      topEvents.forEach((ev: EventProfile) => {
        if (ev.id) mergedEventsMap.set(ev.id, ev);
      });
      keywordMatches.forEach((ev: EventProfile) => {
        if (ev.id) mergedEventsMap.set(ev.id, ev);
      });
      const mergedEvents = Array.from(mergedEventsMap.values()).slice(0, 10);

      // Update displayed events to match search results
      setDisplayEvents(mergedEvents);

      // Call backend for OpenAI chat completion
      const prompt = `You are an ETHDenver event assistant. Answer the user's question using the following event data.\n\nEvents:\n${mergedEvents.map(e => `Name: ${e.event_name}, Type: ${e.type}, Location: ${e.location}, Start: ${e.start_time}, Description: ${e.description}`).join('\n')}\n\nUser question: ${aiQuery}`;
      const response = await fetch("/api/openai/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model: "gpt-3.5-turbo"
        })
      });
      if (!response.ok) {
        throw new Error("OpenAI API error: " + response.statusText);
      }
      const data = await response.json();
      setAiResponse(data.choices?.[0]?.message?.content || "No answer.");
    } catch (err: any) {
      setAiResponse("Error: " + (err?.message || "Unknown error"));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <h2
        style={{
          color: "#d44ea8",
          fontWeight: 700,
          fontSize: 44,
          textAlign: "center",
        }}
      >
        Explore ETH Denver SideventS
      </h2>

      {/* AI Search Area */}
      <form onSubmit={handleAiSearch} className="ai-search-form">
        <label htmlFor="ai-search">Ask about events:</label>
        <input
          id="ai-search"
          type="text"
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
          className="ai-search-input"
          placeholder="e.g. social events on Feb 21, job hunting, etc."
        />
        <button
          type="submit"
          className="ai-search-button"
          disabled={aiLoading || !aiQuery}
        >
          {aiLoading ? "Searching..." : "Ask AI"}
        </button>
      </form>

      {/* Sponsor Carousel */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <SponsorCarousel />
      </div>

      {/* AI Dialogue Area */}
      {aiResponse && (
        <div
          style={{
            background: "#f6f6f6",
            padding: "1em",
            borderRadius: "8px",
            marginBottom: "2em",
          }}
        >
          <strong>AI Response:</strong>
          <p>{aiResponse}</p>
        </div>
      )}

      {/* Events List */}
      {loading && <p>Loading events...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && (
        <div className="event-list">
          {displayEvents.map((event) => (
            <div
              className="event-card"
              key={event.id}
              style={{
                background: colors.secondary,
                color: colors.text,
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(111,30,81,0.08)",
                padding: "1.5rem 1.2rem",
                display: "flex",
                flexDirection: "column",
                minHeight: "220px",
                transition: "transform 0.15s",
              }}
            >
              <strong
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "0.5em",
                  color: colors.accent,
                  textShadow: "0 1px 2px " + colors.secondary,
                }}
              >
                {event.event_name}
              </strong>
              {event.type && (
                <div className="event-type" style={{ color: colors.accent }}>
                  Type: {event.type}
                </div>
              )}
              {event.location && (
                <div className="event-location">Location: {event.location}</div>
              )}
              {event.start_time && (
                <div className="event-time">Start: {event.start_time}</div>
              )}
              {event.lemonade_url && (
                <a
                  className="event-link"
                  href={event.lemonade_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: colors.accent, color: colors.card }}
                >
                  Lemonade Link
                </a>
              )}
              {event.description && (
                <div
                  className="event-description"
                  style={{
                    marginTop: "0.7em",
                    fontSize: "0.98em",
                    color: colors.text,
                    opacity: 0.95,
                  }}
                >
                  {event.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PageUser
