import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./supabase.js";
import { openai } from "./openai.js";

dotenv.config();

// Log required environment variables for debugging
console.log("[ENV] PORT:", process.env.PORT);
console.log("[ENV] ALLOWED_ORIGINS:", process.env.ALLOWED_ORIGINS);
console.log("[ENV] VITE_SUPABASE_URL:", process.env.VITE_SUPABASE_URL);
console.log("[ENV] VITE_SUPABASE_ANON_KEY:", process.env.VITE_SUPABASE_ANON_KEY);
console.log("[ENV] VITE_LEMONADE_GRAPHQL_ENDPOINT:", process.env.VITE_LEMONADE_GRAPHQL_ENDPOINT);
console.log("[ENV] VITE_LEMONADE_AUTH_TOKEN:", process.env.VITE_LEMONADE_AUTH_TOKEN);
console.log("[ENV] OPENAI_API_KEY:", process.env.OPENAI_API_KEY);

const app = express();

// Global error handlers for diagnostics
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


// Parse allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

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
    const { registration_url, event_data } = req.body;
    // Extract short code from registration_url
    const match = registration_url.match(/lemonade\.social\/e\/([\w-]+)/);
    const shortCode = match ? match[1] : null;
    if (!shortCode) {
      return res.status(400).json({ error: "Invalid Lemonade event URL." });
    }
    // Check if event with this short code already exists
    const { data: existingEvents, error: selectError } = await supabase
      .from("event_profiles")
      .select("id, registration_url")
      .eq("registration_url", registration_url);
    if (selectError) return res.status(500).json({ error: selectError.message });
    if (existingEvents && existingEvents.length > 0) {
      return res.status(200).json({ alreadyExists: true, id: existingEvents[0].id });
    }
    // Get max id
    const { data: maxIdData, error: maxIdError } = await supabase
      .from("event_profiles")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);
    if (maxIdError) return res.status(500).json({ error: maxIdError.message });
    const maxId = maxIdData && maxIdData.length > 0 ? parseInt(maxIdData[0].id, 10) : 0;
    const newId = maxId + 1;
    // Insert new event
    const insertData = { ...event_data, id: newId, registration_url };
    const { error: insertError } = await supabase
      .from("event_profiles")
      .insert([insertData]);
    if (insertError) return res.status(400).json({ error: insertError.message });

    // Automatically create embedding for AI search
    try {
      // Use all present string fields from insertData for embedding
      const embeddingFields = Object.entries(insertData)
        .filter(([key, value]) => typeof value === 'string' && value.trim().length > 0)
        .map(([key, value]) => value.trim());
      const embeddingText = embeddingFields.join('. ');
      if (embeddingText.length > 0) {
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: embeddingText,
        });
        const embedding = embeddingResponse.data[0]?.embedding;
        if (embedding) {
          await supabase
            .from("event_profiles")
            .update({ embedding })
            .eq("id", newId);
        }
      }
    } catch (embedErr) {
      console.error('Embedding creation error:', embedErr);
    }
    res.json({ success: true, id: newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example Supabase write endpoint
app.post("/api/supabase/insert", async (req, res) => {
  try {
    const { table, data } = req.body;
    const { error } = await supabase.from(table).insert(data);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example Supabase read endpoint
app.get("/api/supabase/select", async (req, res) => {
  try {
    const { table, columns = "*" } = req.query;
    const { data, error } = await supabase.from(table).select(columns);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example OpenAI completion endpoint
app.post("/api/openai/completion", async (req, res) => {
  try {
    const { prompt, model = "gpt-3.5-turbo" } = req.body;
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });
    res.json(completion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler (must be last)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Express API server running on port ${PORT}`);
});
