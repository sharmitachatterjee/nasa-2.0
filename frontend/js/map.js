const statusLabels = {
  active: "Operational",
  historic: "Historic",
  planned: "Planned",
};

const mapElement = document.querySelector("#planet-map");
const statusElement = document.querySelector("#map-status");
const siteListElement = document.querySelector("[data-site-list]");
const siteDetailElement = document.querySelector("[data-site-detail]");
function showStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle("is-error", isError);
}

if (!window.L) {
  showStatus("Leaflet could not be loaded. Check your connection and reload the page.", true);
  throw new Error("Leaflet is required to initialize the planetary map.");
}

const map = L.map(mapElement, {
  crs: L.CRS.EPSG4326,
  center: [0, 0],
  zoom: 1,
  zoomSnap: 0.5,
  minZoom: 0,
  maxZoom: 7,
  maxBounds: [
    [-90, -180],
    [90, 180],
  ],
  maxBoundsViscosity: 0.8,
  worldCopyJump: false,
});

const markerLayer = L.layerGroup().addTo(map);
let planetaryData;
let currentBody = "moon";
let tileLayer;
let siteMarkers = new Map();

function createStatusDot(status) {
  const dot = document.createElement("i");
  dot.className = `site-list-dot status-${status}`;
  dot.setAttribute("aria-hidden", "true");
  return dot;
}

function createListButton(site) {
  const button = document.createElement("button");
  button.className = "site-list-button";
  button.type = "button";
  button.dataset.siteId = site.id;
  button.setAttribute("aria-label", `${site.name}, ${statusLabels[site.status]}`);

  const copy = document.createElement("span");
  copy.className = "site-list-copy";
  const name = document.createElement("span");
  name.className = "site-list-name";
  name.textContent = site.name;
  const status = document.createElement("span");
  status.className = "site-list-status";
  status.textContent = site.statusLabel;

  copy.append(name, status);
  button.append(createStatusDot(site.status), copy);
  button.addEventListener("click", () => selectSite(site.id, true));
  return button;
}

function createMarker(site) {
  const icon = L.divIcon({
    className: "",
    html: `<span class="planet-marker planet-marker--${site.status}" aria-hidden="true"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
  const marker = L.marker(site.coordinates, {
    icon,
    title: `${site.name} — ${site.statusLabel}`,
    alt: `${site.name}, ${site.statusLabel}`,
  });
  const popup = document.createElement("div");
  const title = document.createElement("p");
  title.className = "map-popup-title";
  title.textContent = site.name;
  const copy = document.createElement("p");
  copy.className = "map-popup-copy";
  copy.textContent = `${site.place} · ${site.statusLabel}`;
  popup.append(title, copy);
  marker.bindPopup(popup);
  marker.on("click", () => selectSite(site.id));
  return marker;
}

function selectSite(siteId, moveToSite = false) {
  const site = planetaryData[currentBody].sites.find((item) => item.id === siteId);
  if (!site) return;

  siteDetailElement.hidden = false;
  const status = siteDetailElement.querySelector("[data-detail-status]");
  status.className = `site-status status-${site.status}`;
  status.textContent = site.statusLabel;
  siteDetailElement.querySelector("[data-detail-name]").textContent = site.name;
  siteDetailElement.querySelector("[data-detail-location]").textContent =
    `${site.place} · ${site.coordinates[0].toFixed(2)}°, ${site.coordinates[1].toFixed(2)}°`;
  siteDetailElement.querySelector("[data-detail-description]").textContent = site.description;

  const link = siteDetailElement.querySelector("[data-detail-link]");
  link.href = site.url;
  link.setAttribute("aria-label", `Read more about ${site.name}`);

  siteListElement.querySelectorAll("[data-site-id]").forEach((button) => {
    const isSelected = button.dataset.siteId === site.id;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  if (moveToSite) {
    const zoom = Math.max(map.getZoom(), 3);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      map.setView(site.coordinates, zoom);
    } else {
      map.flyTo(site.coordinates, zoom, { duration: 0.6 });
    }
    siteMarkers.get(site.id)?.openPopup();
  }
}

function renderBody(body) {
  const world = planetaryData[body];
  if (!world) throw new Error(`No map data is available for ${body}.`);

  currentBody = body;
  markerLayer.clearLayers();
  siteMarkers = new Map();
  siteListElement.replaceChildren();
  siteDetailElement.hidden = true;
  document.querySelector("[data-sites-heading]").textContent = `${world.label} sites`;
  document.querySelector("[data-site-count]").textContent = world.sites.length;
  document.querySelector("[data-map-caption]").textContent = world.caption;
  mapElement.setAttribute("aria-label", `Interactive map of ${world.label}`);
  map.setMaxZoom(world.maxNativeZoom);
  map.setMinZoom(0);
  map.setView([0, 0], 1);

  if (tileLayer) map.removeLayer(tileLayer);
  tileLayer = L.tileLayer(world.tileUrl, {
    minZoom: 0,
    maxNativeZoom: world.maxNativeZoom,
    maxZoom: world.maxNativeZoom,
    noWrap: true,
    bounds: [
      [-90, -180],
      [90, 180],
    ],
    attribution: "NASA/JPL-Caltech",
  });
  tileLayer.on("tileerror", () => {
    showStatus("NASA Trek tiles could not be loaded. Check your connection and try again.", true);
  });
  tileLayer.addTo(map);

  world.sites.forEach((site) => {
    siteListElement.append(createListButton(site));
    const marker = createMarker(site);
    siteMarkers.set(site.id, marker);
    markerLayer.addLayer(marker);
  });

  document.querySelectorAll("[data-body]").forEach((button) => {
    const selected = button.dataset.body === body;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  showStatus(`${world.sites.length} mission sites loaded. Select a marker to explore.`);
  window.requestAnimationFrame(() => map.invalidateSize());
}

async function start() {
  document.querySelectorAll("[data-body]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!planetaryData || button.dataset.body === currentBody) return;
      renderBody(button.dataset.body);
    });
  });

  try {
    const response = await fetch("data/sites.json");
    if (!response.ok) {
      throw new Error(`Could not load mission site data (${response.status}).`);
    }
    planetaryData = await response.json();
    renderBody(currentBody);
  } catch (error) {
    console.error("Planetary map could not be initialized:", error);
    showStatus(
      error instanceof Error ? error.message : "The planetary map could not be loaded.",
      true,
    );
  }
}

start();