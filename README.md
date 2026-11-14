# nasa-2.0

## Supabase account pages

The frontend includes an index page, login/sign-up page, and protected dashboard.
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
loaded from `frontend/data/stories.json` and link to NASA sources; no API key is
required.