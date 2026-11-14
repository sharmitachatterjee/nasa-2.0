// NASA Open API proxy for APOD and Mars Rover imagery
// Uses NASA_API_KEY from process.env or fallback DEMO_KEY with cached assets

const FALLBACK_APOD = {
  title: "Pale Blue Dot & Deep Space Sentinels",
  date: "2026-11-14",
  explanation: "Suspended in the vast cosmic dark, humanity's robotic explorers carry our vision, curiosity, and questions across the solar system and out into interstellar space.",
  url: "https://images-assets.nasa.gov/image/PIA01977/PIA01977~orig.jpg",
  media_type: "image",
  copyright: "NASA / JPL-Caltech"
};

const FALLBACK_MARS = [
  {
    id: 1,
    img_src: "https://images-assets.nasa.gov/image/PIA16919/PIA16919~orig.jpg",
    earth_date: "2014-07-28",
    camera: { full_name: "Panoramic Camera (Pancam)" },
    rover: { name: "Opportunity" }
  },
  {
    id: 2,
    img_src: "https://images-assets.nasa.gov/image/PIA13147/PIA13147~orig.jpg",
    earth_date: "2010-03-22",
    camera: { full_name: "Navigation Camera (Navcam)" },
    rover: { name: "Spirit" }
  }
];

let cachedApod = null;
let apodCachedAt = 0;

async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = (process.env.NASA_API_KEY || "DEMO_KEY").trim();
  const type = (req.query?.type || (new URL(req.url, "http://localhost").searchParams.get("type")) || "apod").toLowerCase();

  res.setHeader("Cache-Control", "public, s-maxage=3600");

  if (type === "mars") {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const resp = await fetch(
        `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&camera=fhaz&api_key=${apiKey}`,
        { signal: controller.signal }
      );
      clearTimeout(timer);
      if (resp.ok) {
        const data = await resp.json();
        if (data.photos && data.photos.length > 0) {
          return res.status(200).json(data.photos.slice(0, 6));
        }
      }
    } catch {
      // Return cached/curated fallback
    }
    return res.status(200).json(FALLBACK_MARS);
  }

  // APOD
  if (cachedApod && Date.now() - apodCachedAt < 60 * 60 * 1000) {
    return res.status(200).json(cachedApod);
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`, {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (resp.ok) {
      const data = await resp.json();
      cachedApod = data;
      apodCachedAt = Date.now();
      return res.status(200).json(data);
    }
  } catch {
    // Return cached/curated fallback
  }

  return res.status(200).json(FALLBACK_APOD);
}

module.exports = handler;
