import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./supabase.js";
import { openai } from "./openai.js";

dotenv.config();

// Log required environment variables for debugging
console.log("[ENV] PORT:", process.env.PORT);
console.log("[ENV] ALLOWED_ORIGINS:", process.env.ALLOWED_ORIGINS);
console.log("[ENV] SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("[ENV] SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY);
console.log("[ENV] OPENAI_API_KEY:", process.env.OPENAI_API_KEY);

const app = express();
// Dynamic CORS middleware using official package
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization"
}));

// Global error handlers for diagnostics
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('exit', (code) => {
  console.error(`[PROCESS EXIT] Node process exiting with code: ${code}`);
});
// Health check route
app.get('/health', (req, res) => {
  console.log('[HEALTH CHECK] /health route called');
  res.status(200).json({ status: 'ok' });
});


// Parse allowed origins from environment variable

// CORS middleware FIRST, before everything else
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// Explicitly handle OPTIONS requests for all routes
app.options("*", cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Custom endpoint for event registration via Lemonade URL
app.post("/api/events/register", async (req, res) => {
  try {
    console.log("[POST /api/events/register] body:", req.body);
    const { registration_url, event_data } = req.body;
    // Extract short code from registration_url
    const match = registration_url.match(/lemonade\.social\/e\/([\w-]+)/);
    const shortCode = match ? match[1] : null;
    if (!shortCode) {
      console.warn("[POST /api/events/register] Invalid Lemonade event URL:", registration_url);
      return res.status(400).json({ error: "Invalid Lemonade event URL." });
    }
    // Check if event with this short code already exists
    const { data: existingEvents, error: selectError } = await supabase
      .from("event_profiles")
      .select("id, registration_url")
      .eq("registration_url", registration_url);
    if (selectError) {
      console.error("[POST /api/events/register] Supabase select error:", selectError);
      return res.status(500).json({ error: selectError.message });
    }
    if (existingEvents && existingEvents.length > 0) {
      console.log("[POST /api/events/register] Event already exists:", existingEvents[0]);
      return res.status(200).json({ alreadyExists: true, id: existingEvents[0].id });
    }
    // Get max id
    const { data: maxIdData, error: maxIdError } = await supabase
      .from("event_profiles")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);
    if (maxIdError) {
      console.error("[POST /api/events/register] Supabase max id error:", maxIdError);
      return res.status(500).json({ error: maxIdError.message });
    }
    const maxId = maxIdData && maxIdData.length > 0 ? parseInt(maxIdData[0].id, 10) : 0;
    const newId = maxId + 1;
    // Insert new event
    const insertData = { ...event_data, id: newId, registration_url };
    console.log("[POST /api/events/register] Inserting event:", insertData);
    const { error: insertError } = await supabase
      .from("event_profiles")
      .insert([insertData]);
    if (insertError) {
      console.error("[POST /api/events/register] Supabase insert error:", insertError);
      return res.status(400).json({ error: insertError.message });
    }

    // Automatically create embedding for AI search
    try {
      // Use all present string fields from insertData for embedding
      const embeddingFields = Object.entries(insertData)
        .filter(([key, value]) => typeof value === 'string' && value.trim().length > 0)
        .map(([key, value]) => value.trim());
      const embeddingText = embeddingFields.join('. ');
      if (embeddingText.length > 0) {
        console.log("[POST /api/events/register] Creating embedding for:", embeddingText);
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: embeddingText,
        });
        const embedding = embeddingResponse.data[0]?.embedding;
        if (embedding) {
          console.log("[POST /api/events/register] Embedding created, updating event id:", newId);
          await supabase
            .from("event_profiles")
            .update({ embedding })
            .eq("id", newId);
        }
      }
    } catch (embedErr) {
      console.error('[POST /api/events/register] Embedding creation error:', embedErr);
    }
    res.json({ success: true, id: newId });
  } catch (err) {
    console.error('[POST /api/events/register] Handler error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Example Supabase write endpoint
app.post("/api/supabase/insert", async (req, res) => {
  try {
    console.log("[POST /api/supabase/insert] body:", req.body);
    const { table, data } = req.body;
    const { error } = await supabase.from(table).insert(data);
    if (error) {
      console.error("[POST /api/supabase/insert] Supabase insert error:", error);
      return res.status(400).json({ error: error.message });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[POST /api/supabase/insert] Handler error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Example Supabase read endpoint
app.get("/api/supabase/select", async (req, res) => {
  try {
    console.log("[GET /api/supabase/select] query:", req.query);
    const { table, columns = "*" } = req.query;
    const { data, error } = await supabase.from(table).select(columns);
    if (error) {
      console.error("[GET /api/supabase/select] Supabase select error:", error);
      return res.status(400).json({ error: error.message });
    }
    res.json({ data });
  } catch (err) {
    console.error('[GET /api/supabase/select] Handler error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Example OpenAI completion endpoint
app.post("/api/openai/completion", async (req, res) => {
  try {
    console.log("[POST /api/openai/completion] body:", req.body);
    const { prompt, model = "gpt-3.5-turbo" } = req.body;
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });
    res.json(completion);
  } catch (err) {
    console.error('[POST /api/openai/completion] Handler error:', err);
    res.status(500).json({ error: err.message });
  }
});


// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler (must be last)
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR HANDLER]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[STARTUP] Express API server running on port ${PORT}`);
  setInterval(() => {
    console.log('[ALIVE] Server is still running');
  }, 30000);
});
