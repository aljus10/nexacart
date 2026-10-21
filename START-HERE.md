# NexaCart — start here

This handoff includes the latest studio entrance, Interactive map, Analytics, Data tab, and the playback collision/progress improvements.

Source commit: `066bc2a3941b3eeb7a05774ae77f10b0506555e5`

## Run locally on Windows

Use Node.js 22.13 or later, matching package.json. Open PowerShell in this folder.

```powershell
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev:vercel
```

Open http://localhost:3000. Leave the environment values blank to explore sample data. Restart the development server after changing .env.local.

## Connect your Supabase database

1. Use the existing six public commerce tables listed in README.md.
2. Run `database/setup.sql` in your Supabase SQL editor. This installs the two read-only RPC functions; it does not create the commerce tables or import your records.
3. Fill `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Keep the service key server-side; do not put it in a NEXT_PUBLIC_ variable or commit the file.
4. Restart the server. Use the top-right connection refresh, then inspect Analytics and Data. Verify totals against your own database queries.
5. For optional AI questions, set `GEMINI_API_KEY` and explicitly set `GEMINI_MODEL` to a model available in your account. The existing default is not a claim of current model availability.

The map catalog and delivery playback remain illustrative and static. Connecting Supabase updates analytics and table data; live shipment tracking requires your own tracking events and map integration.

## Where to continue development

- `components/nexacart/entry/` — entrance cart and animation
- `components/nexacart/map/` — map UI, 3D models, rendering
- `lib/nexacart/map-data.ts` — catalog anchors, building spacing, playback stages
- `lib/nexacart/map-playback.ts` — route planning, handoffs, label placement
- `components/nexacart/workspace/` — shared tabs, Analytics, Data, AI panel
- `lib/nexacart/server.ts` — Supabase RPC and AI integration
- `lib/nexacart/engine.ts` — metrics, filters, and validated query plans
- `database/setup.sql` — SQL functions and grants
- `.env.example` and `README.md` — configuration and complete setup

## Checks and deployment

```powershell
pnpm test
pnpm test:map
node scripts/check-entrance.mjs
pnpm build:vercel
```

The latest map suite passed all 11 checks, including all ten route legs. Production builds passed. Browser interaction checks used the 2D fallback because the QA browser had WebGL disabled; visually review the 3D scene on your own GPU-enabled browser. Live Supabase credentials, permissions, real-data totals, and Gemini access have not been tested.

For Vercel, import this folder into your GitHub repository and follow README.md. The included vercel.json already selects the Next.js build. Enter server environment variables in Vercel as well.

This ZIP excludes installed dependencies, build output, Git history, and runtime credentials. It retains the original source and bundled assets, SQL, tests, lockfile, and licenses.
