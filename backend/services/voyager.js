const HORIZONS_API = "https://ssd.jpl.nasa.gov/api/horizons.api";
const ASTRONOMICAL_UNIT_KM = 149597870.7;
const CACHE_DURATION_MS = 5 * 60 * 1000;

let cachedEphemeris;
let cachedAt = 0;
let pendingRequest;

function formatHorizonsTime(date) {
  return date.toISOString().slice(0, 16).replace("T", " ");
}

function parseEphemeris(result) {
  const table = result.match(/\$\$SOE\s*([\s\S]*?)\s*\$\$EOE/);
  const row = table?.[1].match(
    /^\s*(\d{4}-[A-Za-z]{3}-\d{2}\s+\d{2}:\d{2})\s+([-+]?\d+(?:\.\d+)?)\s+([-+]?\d+(?:\.\d+)?)/m,
  );
  if (!row) {
    throw new Error("JPL Horizons returned no Voyager range data.");
  }

  const distanceAu = Number(row[2]);
  const rangeRateKmS = Number(row[3]);
  if (!Number.isFinite(distanceAu) || !Number.isFinite(rangeRateKmS) || distanceAu <= 0) {
    throw new Error("JPL Horizons returned invalid Voyager range data.");
  }

  return {
    distanceAu,
    distanceKm: distanceAu * ASTRONOMICAL_UNIT_KM,
    rangeRateKmS,
    ephemerisTime: row[1],
  };
}

async function fetchEphemeris() {
  const start = new Date();
  start.setUTCSeconds(0, 0);
  const stop = new Date(start.getTime() + 60 * 60 * 1000);
  const params = new URLSearchParams({
    format: "json",
    COMMAND: "'-31'",
    OBJ_DATA: "'NO'",
    MAKE_EPHEM: "'YES'",
    EPHEM_TYPE: "'OBSERVER'",
    CENTER: "'500@399'",
    START_TIME: `'${formatHorizonsTime(start)}'`,
    STOP_TIME: `'${formatHorizonsTime(stop)}'`,
    STEP_SIZE: "'1 h'",
    QUANTITIES: "'20'",
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${HORIZONS_API}?${params}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`JPL Horizons returned HTTP ${response.status}.`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`JPL Horizons error: ${data.error}`);
    }
    if (typeof data.result !== "string") {
      throw new Error("JPL Horizons returned an invalid ephemeris response.");
    }

    return {
      ...parseEphemeris(data.result),
      fetchedAt: new Date().toISOString(),
      ephemerisAt: start.toISOString(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function getVoyagerEphemeris() {
  if (cachedEphemeris && Date.now() - cachedAt < CACHE_DURATION_MS) {
    return cachedEphemeris;
  }
  if (pendingRequest) return pendingRequest;

  pendingRequest = fetchEphemeris()
    .then((ephemeris) => {
      cachedEphemeris = ephemeris;
      cachedAt = Date.now();
      return ephemeris;
    })
    .finally(() => {
      pendingRequest = undefined;
    });

  return pendingRequest;
}

module.exports = { getVoyagerEphemeris };
