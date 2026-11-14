// Farewell Wall - Memorial Tributes API for retired & lost spacecraft

const DEFAULT_TRIBUTES = [
  {
    id: "trib-1",
    author: "Elena Rostova",
    callsign: "Stargazer-9",
    probe: "opportunity",
    probeName: "Opportunity (MER-B)",
    message: "You taught an entire generation that a machine built of aluminum and silicon could have a soul. 5,111 sols under a foreign sky. Rest easy, Oppy.",
    date: "2026-11-01",
    hearts: 142
  },
  {
    id: "trib-2",
    author: "Kavita Rao",
    callsign: "ISRO-Fellow",
    probe: "voyager1",
    probeName: "Voyager 1",
    message: "Whenever I feel small on this Earth, I look out at night and remember: our song, our laughter, and our heartbeat are sailing through the interstellar dark.",
    date: "2026-11-04",
    hearts: 98
  },
  {
    id: "trib-3",
    author: "Marcus Chen",
    callsign: "Titan-Survey",
    probe: "cassini",
    probeName: "Cassini-Huygens",
    message: "You plunged into Saturn so Enceladus could dream in peace. The most noble death in the history of science.",
    date: "2026-11-06",
    hearts: 115
  },
  {
    id: "trib-4",
    author: "Sarah Lindqvist",
    callsign: "Polaris-4",
    probe: "spirit",
    probeName: "Spirit (MER-A)",
    message: "Climbing Husband Hill with a seized wheel. You never gave up, not even when the sand at Troy claimed your tracks. Thank you for showing us what grit means.",
    date: "2026-11-08",
    hearts: 76
  },
  {
    id: "trib-5",
    author: "David Miller",
    callsign: "Apollo-Kids",
    probe: "apollo15",
    probeName: "Apollo 15 Lunar Rover",
    message: "Still parked by Hadley Rille, waiting under the unchanging stars. The fastest set of wheels on the Moon.",
    date: "2026-11-10",
    hearts: 54
  },
  {
    id: "trib-6",
    author: "Dr. Amara Thorne",
    callsign: "DeepSpace-Echo",
    probe: "opportunity",
    probeName: "Opportunity (MER-B)",
    message: "I was ten years old when you bounced onto Eagle Crater, and I had finished my astrophysics doctorate by the time your final storm arrived. You guided my whole life.",
    date: "2026-11-12",
    hearts: 89
  }
];

let inMemoryTributes = [...DEFAULT_TRIBUTES];

function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const probe = req.query?.probe || (new URL(req.url, "http://localhost").searchParams.get("probe"));
    if (probe && probe !== "all") {
      const filtered = inMemoryTributes.filter((t) => t.probe === probe.toLowerCase());
      return res.status(200).json(filtered);
    }
    return res.status(200).json(inMemoryTributes);
  }

  if (req.method === "POST") {
    try {
      const body = req.body || {};
      const author = (body.author || "Anonymous Explorer").trim().slice(0, 50);
      const callsign = (body.callsign || "Observer").trim().slice(0, 30);
      const probe = (body.probe || "opportunity").toLowerCase();
      const message = (body.message || "").trim().slice(0, 500);

      if (!message) {
        return res.status(400).json({ error: "Tribute message is required." });
      }

      const probeNames = {
        opportunity: "Opportunity (MER-B)",
        voyager1: "Voyager 1",
        spirit: "Spirit (MER-A)",
        cassini: "Cassini-Huygens",
        apollo15: "Apollo 15 Lunar Rover"
      };

      const newTribute = {
        id: `trib-${Date.now()}`,
        author: author || "Anonymous Explorer",
        callsign: callsign || "Explorer",
        probe,
        probeName: probeNames[probe] || "Spacecraft",
        message,
        date: new Date().toISOString().split("T")[0],
        hearts: 1
      };

      inMemoryTributes.unshift(newTribute);
      return res.status(201).json(newTribute);
    } catch (err) {
      return res.status(500).json({ error: "Could not save tribute note." });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed." });
}

module.exports = handler;
