const { getVoyagerEphemeris } = require("../backend/services/voyager");

async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const ephemeris = await getVoyagerEphemeris();
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(ephemeris);
  } catch (error) {
    console.error("Could not retrieve Voyager ephemeris:", error);
    return res.status(502).json({
      error: "JPL Horizons could not provide Voyager 1's current distance. Try again shortly.",
    });
  }
}

module.exports = handler;
