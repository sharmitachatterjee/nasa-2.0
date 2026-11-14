# nasa-2.0

## Supabase account pages

The frontend includes an index page, dedicated login and sign-up pages, and a
protected dashboard.
It uses Supabase Auth for accounts and a `profiles` table for display names.

### Configure Supabase

1. In the Supabase dashboard, open **Project Settings → API**. Copy the project URL
   and the **publishable** key (or legacy `anon` key). Never use a `service_role`
   or secret key in this app.
2. Put those values in `backend/.env`, replacing the placeholders:

   ```env
   PORT=3000
   SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

3. In the Supabase **SQL Editor**, run the contents of
   [`backend/supabase/schema.sql`](backend/supabase/schema.sql). This creates the
   `profiles` table, row-level security policies, and a profile row for each new
   Auth user.
4. In **Authentication → URL Configuration**, set the site URL to
   `http://localhost:3000` and add `http://localhost:3000/dashboard.html` to the
   allowed redirect URLs. Keep email confirmation enabled if you want users to
   verify their address before logging in.

### Run locally

```powershell
cd backend
npm install
npm start
```

Open `http://localhost:3000`. The backend serves the static frontend and a small
`/api/config` endpoint that provides only the Supabase public URL and publishable
key to the browser. The `.env` file is ignored by Git; do not put a Supabase
service-role key in it for this frontend authentication flow.

### Deploy to Vercel

Import the repository into Vercel with the repository root as the project root.
The included `vercel.json` publishes `frontend/` as the static site and deploys
`api/config.js` and `api/voyager.js` as serverless functions. Do not set
`backend/` as the Vercel project root.

In the Vercel project’s **Settings → Environment Variables**, set
`SUPABASE_URL` and `SUPABASE_ANON_KEY` for the environments you deploy
(Production, and Preview if needed). These are the Supabase project URL and
public publishable/anon key; never use the service-role secret. Vercel does not
read your local `backend/.env`, and `NASA_API_KEY` is not used by this app.
Redeploy after changing environment variables.

In Supabase **Authentication → URL Configuration**, set the Site URL to your
production Vercel URL and add that URL with `/dashboard.html` to the allowed
redirect URLs. Add your Vercel Preview URL patterns there too if you test
authentication on preview deployments. Keep the existing localhost URLs for
local development.

## Planetary map

Open `http://localhost:3000/explore.html` to explore mission sites on the Moon
and Mars. The map uses Leaflet and NASA Trek's public WMTS basemaps; those tile
services do not require an API key. Site descriptions are fetched from
`frontend/data/sites.json` when the map loads. An internet connection is needed
for the Leaflet assets and NASA map tiles.

## Mission stories

Open `http://localhost:3000/mission.html` for six first-person, typewritten
retellings of Opportunity, Spirit, Voyager 1, Ingenuity, the Apollo Lunar
Roving Vehicle, and Cassini. These are original creative interpretations of
documented mission histories, not real spacecraft testimony. The stories are
loaded from `frontend/data/stories.json` and link to NASA sources. Mission
images and their credits come from the public NASA Image and Video Library;
that catalog does not require an API key.
Stories can also be played, paused, resumed, and stopped with the browser's
built-in `speechSynthesis` voice. Narration reads the complete selected story
independently of the typewriter animation; it requires no API key or `.env`
setting, and is unavailable in browsers without speech synthesis support.

The story page also shows Voyager 1's changing Earth distance from JPL
Horizons. The backend requests the public Horizons API, caches each result for
five minutes, and sends the ephemeris to the browser through `/api/voyager`.
No API key or `.env` setting is required. The displayed per-second counter
extrapolates from Horizons' reported range rate between refreshed ephemerides.

## Explorer quiz and collectible card

Open `http://localhost:3000/quiz.html` to play the 10-question space mission
quiz. Scores and personal bests are saved only in the current browser's local
storage. Each result creates a downloadable PNG Explorer Card; the share link
opens a card preview for friends. Callsigns are optional and should be
space-themed rather than real names. Questions and NASA sources are in
`frontend/data/quiz.json`; no external API key or `.env` setting is required.

## Accessibility

The main pages include a keyboard-accessible skip link, visible keyboard focus,
and controls operable with standard keyboard navigation. The site honors system
reduced-motion and increased-contrast preferences, and supports operating
system forced-colors modes. Mission markers also use distinct shapes as well as
colors to indicate status. These accessibility features need no API key or
`.env` setting.