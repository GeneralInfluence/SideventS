dotenv.config();

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./supabase.js";
import { openai } from "./openai.js";
dotenv.config();


const app = express();
app.use(express.json());

// Allow requests from Vercel frontend
const allowedOrigins = ["https://sidevents.vercel.app"];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Express API server running on port ${PORT}`);
});
