const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const { getVoyagerEphemeris } = require("./services/voyager");
const askMachineHandler = require("../api/ask-machine");
const tributesHandler = require("../api/tributes");
const nasaHandler = require("../api/nasa");

const app = express();
const frontendPath = path.join(__dirname, "..", "frontend");
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/api/config", (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("YOUR_") ||
    supabaseAnonKey.includes("YOUR_")
  ) {
    return res.status(503).json({
      error: "Set SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env.",
    });
  }

  try {
    const parsedUrl = new URL(supabaseUrl);
    if (
      parsedUrl.protocol !== "https:" &&
      !(parsedUrl.protocol === "http:" && parsedUrl.hostname === "localhost")
    ) {
      throw new Error("SUPABASE_URL must use HTTPS.");
    }
  } catch (error) {
    return res.status(503).json({
      error: "SUPABASE_URL in backend/.env must be a valid Supabase project URL.",
    });
  }

  res.set("Cache-Control", "no-store");
  return res.json({ supabaseUrl, supabaseAnonKey });
});

app.get("/api/voyager", async (req, res) => {
  try {
    const ephemeris = await getVoyagerEphemeris();
    res.set("Cache-Control", "no-store");
    return res.json(ephemeris);
  } catch (error) {
    console.error("Could not retrieve Voyager ephemeris:", error);
    return res.status(502).json({
      error: "JPL Horizons could not provide Voyager 1's current distance. Try again shortly.",
    });
  }
});

// Ask the Machine (Gemini AI Spacecraft Persona)
app.all("/api/ask-machine", (req, res) => {
  return askMachineHandler(req, res);
});

// Farewell Wall (Tributes API)
app.all("/api/tributes", (req, res) => {
  return tributesHandler(req, res);
});

// NASA Open API Proxy
app.all("/api/nasa", (req, res) => {
  return nasaHandler(req, res);
});

app.use(express.static(frontendPath));

app.listen(port, () => {
  console.log(`Frontend and API running at http://localhost:${port}`);
});
