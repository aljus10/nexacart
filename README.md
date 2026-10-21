# NexaCart · Engineering Reference

I built NexaCart as a schema-aware commerce analytics and visualization system. The system maps and analyzes retail transactions structured in an e-commerce star schema. It combines a procedural three-dimensional (3D) map of the Philippines, an in-memory analytics engine, an Artificial Intelligence (AI) natural-language query planner, and a read-only database table inspector.

The codebase runs in two modes:
- **Offline / Sample Data Mode**: Runs completely locally using an in-memory generator that produces 10,000 deterministic transaction records linked to 30 real Philippine sellers and 5 shipping couriers.
- **Live Supabase Mode**: Connects to a Supabase PostgreSQL database using restricted Remote Procedure Call (RPC) functions and sends natural-language questions to Google Gemini.

---

## System Architecture

The following diagram illustrates the data flow and system boundaries:

```
[ Browser Client ]
  │
  ├── 1. 3D Studio Entrance (Three.js / WebGL / SVG fallback)
  │
  └── 2. Workspace Shell (/map, /analytics, /data)
        │
        ├── In-Memory Engine (lib/nexacart/engine.ts)
        │     ├── Single-pass KPI reducers
        │     ├── Zero-filled time-series bucketing
        │     └── Schema-fault isolation (handles 64 missing-table permutations)
        │
        └── Server Route Handlers (app/api/)
              │
              ├── /api/data  ──> lib/nexacart/server.ts ──> Supabase RPC (nexacart_snapshot)
              │
              └── /api/ask   ──> Google Gemini API (Structured JSON plan)
                                      │
                                      └── Supabase RPC (nexacart_query)
```

---

## Star Schema Contract

The application expects six public tables in PostgreSQL. The schema follows a standard dimensional model:

```
                  ┌─────────────────┐
                  │  dim_customer   │
                  ├─────────────────┤
                  │ customer_id (PK)│
                  │ customer_name   │
                  │ city            │
                  └────────┬────────┘
                           │
┌─────────────────┐        │        ┌─────────────────┐
│   dim_seller    │        │        │   dim_product   │
├─────────────────┤        │        ├─────────────────┤
│ seller_id (PK)  │◄───────┼───────►│ product_id (PK) │
│ shop_name       │        │        │ product_name    │
│ seller_city     │        │        │ category        │
└─────────────────┘        │        │ brand           │
                           │        └─────────────────┘
                  ┌────────┴────────┐
                  │fact_order_items │
                  ├─────────────────┤
                  │ order_item_id PK│
                  │ order_number    │
                  │ order_date      │
                  │ customer_id  FK │
                  │ product_id   FK │
                  │ seller_id    FK │
                  │ payment_id   FK │
                  │ shipping_id  FK │
                  │ quantity        │
                  │ unit_price      │
                  │ discount_amount │
                  │ shipping_fee    │
                  │ gross_sales     │
                  │ net_sales       │
                  │ total_paid      │
                  └────────┬────────┘
                           │
┌─────────────────┐        │        ┌─────────────────┐
│   dim_payment   │        │        │  dim_shipping   │
├─────────────────┤        │        ├─────────────────┤
│ payment_id (PK) │◄───────┴───────►│ shipping_id (PK)│
│ payment_method  │                 │ shipping_method │
└─────────────────┘                 │ courier_name    │
                                    └─────────────────┘
```

### Table Column Invariants

1. `fact_order_items`: Grain is one line item per order.
2. `dim_customer`: Unique customer dimension table.
3. `dim_product`: Catalog items categorized by brand and product category.
4. `dim_seller`: Merchant profiles with Philippine city locations.
5. `dim_payment`: Payment methods (such as GCash, Cash on Delivery, Credit Card).
6. `dim_shipping`: Courier options (J&T Express, SPX Express, Ninja Van, Flash Express).

---

## Core Engineering Decisions

### 1. Three.js Procedural Graphics (Zero External Assets)

- **Problem**: Loading external 3D Binary Graphic Language Transmission Format (.glb) files creates network latency, bandwidth overhead, and cross-origin resource sharing risks.
- **Implementation**: I wrote procedural Three.js generators in [`components/nexacart/entry/cart-model.ts`](components/nexacart/entry/cart-model.ts) and [`components/nexacart/map/map-models.ts`](components/nexacart/map/map-models.ts). All geometry (chassis, wire baskets, casters, warehouses, courier vans, inter-island cargo vessels) is constructed in code using primitive geometries and extruded shapes.
- **Coastline Extrusion**: I bundled Natural Earth 1:10m polygon data locally in [`components/nexacart/map/geography.ts`](components/nexacart/map/geography.ts). At runtime, the map module projects geographic coordinates (longitude and latitude) to a Mercator plane and extrudes the landmass with `THREE.ExtrudeGeometry`.
- **Fallbacks**: If a client device lacks Web Graphics Library (WebGL) support, the interface conditionally unmounts the 3D canvas and mounts an accessible Scalable Vector Graphics (SVG) fallback.

### 2. Route Planning and Delivery Playback Machine

- **Collision Clearance**: In [`lib/nexacart/map-playback.ts`](lib/nexacart/map-playback.ts), route waypoints calculate bounding-box margins around building footprints. Vehicle trajectories use Catmull-Rom spline curves rounded with safety offsets.
- **Stage Progression**: A deterministic state machine tracks five delivery stages:
  1. `Order Placed`: Parcel waits at merchant loading bay.
  2. `Pickup`: Courier vehicle arrives and loads parcel.
  3. `Sorting`: Parcel moves through regional sorting hub.
  4. `Last-Mile Delivery`: Courier vehicle transports parcel toward recipient address.
  5. `Delivered`: Parcel arrives at customer doorstep.
- **Simulation Boundary**: Route paths, vehicle movements, and sorting hubs are synthetic demonstrations. The star schema provides city anchors, but it does not contain live Global Positioning System (GPS) tracking events.

### 3. Fault-Tolerant Analytics Engine

- **Snapshot Ingestion**: The client loads a single data snapshot from `/api/data` containing all six tables.
- **In-Memory Calculations**: [`lib/nexacart/engine.ts`](lib/nexacart/engine.ts) aggregates metrics in a single pass over array records to ensure fast response times when applying interactive filters.
- **Zero-Fill Dates**: Time series charts fill calendar gaps with zero-value points. This prevents charts from drawing misleading diagonal slopes across days without transactions.
- **Comparison Windows**: Period-over-period comparisons calculate equivalent lengths based on actual calendar days. The engine returns null instead of a false percentage when prior period values are zero.
- **Schema Degradation**: The engine implements a dependency matrix. If a user hides or deletes a dimension table (such as `dim_product`), independent sales calculations continue running. Views that strictly require the missing table display an informative unavailable notice instead of crashing.

### 4. Natural-Language Query Assistant (`/api/ask`)

- **Attack Surface Mitigation**: Large Language Models (LLMs) must never execute arbitrary SQL against a production database.
- **Planning Flow**:
  1. The server sends schema metadata and allowed filter values to Google Gemini. The server strips all customer names, transaction records, and Personally Identifiable Information (PII) before transmission.
  2. Google Gemini returns a structured JavaScript Object Notation (JSON) query plan matching a strict schema (`metric`, `dimension`, `filters`, `limit`, `direction`).
  3. The server runtime validates the plan against hardcoded allowlists in [`lib/nexacart/engine.ts`](lib/nexacart/engine.ts).
  4. In live mode, PostgreSQL compiles the query plan through the restricted `nexacart_query(jsonb)` function. Parameterized bindings prevent SQL injection.

---

## Metric Calculations and Edge-Case Handling

| Metric | Business Definition | Code / SQL Formula | Edge-Case Behavior |
| :--- | :--- | :--- | :--- |
| **Orders** | Total distinct orders placed | `COUNT(DISTINCT order_number)` | Returns `0` when record set is empty. |
| **Order Items** | Total item line records | `COUNT(*)` | Returns `0` when record set is empty. |
| **Units Sold** | Total physical product units | `SUM(quantity)` | Returns `0` when record set is empty. |
| **Net Sales** | Final merchant revenue | `SUM(net_sales)` | Uses stored column; returns `0.00` on empty sets. |
| **Gross Sales** | Unadjusted sales total | `SUM(gross_sales)` | Returns `0.00` on empty sets. |
| **Discounts** | Customer discount deductions | `SUM(discount_amount)` | Returns `0.00` on empty sets. |
| **Shipping Fees** | Courier delivery fees | `SUM(shipping_fee)` | Charged on the first line item of an order. |
| **Total Paid** | Net sales plus shipping fee | `SUM(total_paid)` | Returns `0.00` on empty sets. |
| **Average Order Value (AOV)** | Mean net sales per order | `SUM(net_sales) / NULLIF(COUNT(DISTINCT order_number), 0)` | Returns `null` (displays em dash `—`) when order count is zero. |

### Data Integrity Rules

- **Currency**: Formatted in Philippine Peso (`PHP` / `₱`) via `Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })`.
- **Preserved Outer Records**: Left outer joins prevent dropping fact rows when foreign key dimension records are missing. Unmatched rows are categorized as `Unmatched / null`.
- **Snapshot Safety Cap**: Each table snapshot is capped at 15,000 rows. If row count exceeds 15,000, the server flags `truncated: true` and the dashboard halts full-data totals to prevent displaying partial sums.

---

## Security and Operational Safeguards

1. **RPC Access Restrictions**:
   - Both `nexacart_snapshot` and `nexacart_query` execute with `SECURITY INVOKER`.
   - Execution permissions are explicitly revoked from `PUBLIC`, `anon`, and `authenticated`.
   - Only `service_role` holds `GRANT EXECUTE` permissions.
2. **Statement Timeouts**:
   - `nexacart_snapshot` enforces an 8-second PostgreSQL statement timeout.
   - `nexacart_query` enforces a 5-second PostgreSQL statement timeout.
3. **Credential Isolation**:
   - `SUPABASE_SERVICE_ROLE_KEY` is read strictly on the server.
   - The key is never exported with `NEXT_PUBLIC_` or `VITE_` prefixes.
4. **CSV Injection Defense**:
   - The CSV generator in [`components/nexacart/workspace/DataView.tsx`](components/nexacart/workspace/DataView.tsx) prefixes cells starting with `=, +, -, @, \t, \r` with a single apostrophe (`'`). This prevents formula execution in spreadsheet viewers.

---

## Local Development and CLI Commands

### Prerequisites

- Node.js `>= 22.13.0`
- pnpm `11.25.0` (or npm)

### Setup Commands

```powershell
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Copy environment variables
Copy-Item .env.example .env.local

# 3. Start development server (Next.js)
pnpm dev:vercel
```

The application opens at `http://localhost:3000`.

### Environment Configuration (`.env.local`)

```env
# Supabase Configuration (Leave blank to use sample data mode)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google AI Studio Configuration (Leave blank to use offline keyword parser)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.5-flash-lite
```

---

## Database Installation (`database/setup.sql`)

To connect live Supabase data, execute [`database/setup.sql`](database/setup.sql) once in the Supabase SQL Editor.

The SQL script installs two functions:
1. `public.nexacart_snapshot()`:
   - Queries `pg_attribute` and `pg_class` to verify which of the six expected tables and columns exist.
   - Selects only allowed columns and returns a JSON object containing rows and row counts up to the 15,000-row limit.
   - Traps missing tables with an exception handler and marks their status as `missing`.
2. `public.nexacart_query(query_plan jsonb)`:
   - Validates incoming JSON properties against a strict allowlist.
   - Maps allowed metric identifiers to predefined aggregate SQL expressions.
   - Constructs and executes a parameterized `SELECT` query with safety bounds (`limit <= 100`).

---

## Automated Verification Suites

I wrote comprehensive automated test suites to verify system behavior without requiring live database credentials.

```powershell
# Run the commerce logic and engine suite (26 tests)
node scripts/run-tests.mjs

# Run the 3D map, route clearance, and playback suite (11 tests)
node scripts/run-map-tests.mjs

# Run entrance cart geometry and 8 viewport projection checks
node scripts/check-entrance.mjs

# Verify live Supabase RPC and Gemini connections
node scripts/verify-connections.mjs

# Run TypeScript static type verification
npx tsc --noEmit
```

### Coverage Scope

- **`scripts/run-tests.mjs`**: Validates deterministic sample data generation, all 64 missing-table permutations, formula accuracy, zero-filling, date preset bounding, SQL preview compiler, plan validation, and CSV escaping.
- **`scripts/run-map-tests.mjs`**: Validates seller coordinates, courier options, HQ placement in Polangui, route clearance margins around building meshes, finite 3D bounding boxes, and label collision checks.
- **`scripts/check-entrance.mjs`**: Transpiles entry motion and cart geometry at build time. Verifies ground contact, basket containment, easing curves, and camera projections across 8 viewport dimensions (mobile, tablet, desktop).
- **`scripts/verify-connections.mjs`**: Makes live HTTP requests to Supabase and Google Gemini to confirm credentials and RPC endpoints before deployment.

---

## Source Tree and File Map

```
├── app/
│   ├── page.tsx                     # Root page: mounts 3D Studio Entrance
│   ├── map/page.tsx                 # Workspace route: initializes map tab
│   ├── analytics/page.tsx           # Workspace route: initializes analytics tab
│   ├── data/page.tsx                # Workspace route: initializes data tab
│   ├── explore/page.tsx             # Backward-compatible redirect to /analytics
│   └── api/
│       ├── data/route.ts            # GET: returns current Snapshot object
│       ├── ask/route.ts             # POST: validates question and returns QueryResult
│       └── status/route.ts          # GET: returns credential availability
├── components/nexacart/
│   ├── entry/                       # Entrance 3D cart scene
│   │   ├── EntryScreen.tsx          # Screen container with Enter CTA
│   │   ├── cart-model.ts            # Three.js procedural cart geometry
│   │   ├── cart-renderer.ts         # Animation frame loop and resize handlers
│   │   └── entry-motion.ts          # Physical easing and camera projection math
│   ├── map/                         # 3D Philippines map scene
│   │   ├── PhilippinesMap.tsx       # Map wrapper with SVG fallback switch
│   │   ├── MapViewport.tsx          # Three.js canvas, raycasting, camera rigs
│   │   ├── map-renderer.ts          # Lighting, marker tags, and animation loops
│   │   ├── map-models.ts            # Procedural buildings, loading bays, vehicles
│   │   └── geography.ts             # Natural Earth coastline polygon projection
│   └── workspace/                   # Shared three-tab dashboard shell
│       ├── CommerceWorkspace.tsx    # Header, tab persistence, connection modal
│       ├── AnalyticsView.tsx        # KPI cards, Recharts time-series, filters
│       ├── AssistantPanel.tsx       # Natural-language question input and chart
│       ├── DataView.tsx             # Virtualized data grid and schema simulation
│       └── ui.tsx                   # Accessible modal dialogs and alert banners
├── database/
│   └── setup.sql                    # PostgreSQL schema introspection and query RPC
├── lib/nexacart/
│   ├── engine.ts                    # Metrics, schema dependencies, SQL compiler
│   ├── demo.ts                      # 10,000-row sample dataset generator
│   ├── server.ts                    # Supabase RPC fetchers and Gemini planner
│   ├── map-data.ts                  # Merchant registry and route coordinates
│   ├── map-playback.ts              # Catmull-Rom splines, clearance, stages
│   └── map-catalog.json             # Static catalog of 30 sellers and 5 couriers
└── scripts/
    ├── run-tests.mjs                # Commerce engine test runner
    ├── run-map-tests.mjs            # Map geometry and clearance test runner
    ├── check-entrance.mjs           # Entrance animation projection test runner
    └── verify-connections.mjs       # Live integration verification script
```

---

## Known Constraints and Production Considerations

1. **Client-Side Snapshot Bounds**:
   - *Current Implementation*: The client downloads up to 15,000 rows per table to perform instant client-side filtering.
   - *Production Recommendation*: When data exceeds 15,000 records, aggregations must move entirely to server-side SQL group-by endpoints with pagination.
2. **Delivery Playback Coordinates**:
   - *Current Implementation*: Delivery paths use algorithmic waypoints between merchant city anchors, regional hubs, and customer cities.
   - *Production Recommendation*: Connect an active courier event streaming API (such as Webhook tracking updates) to plot verified GPS telemetry.
3. **Currency Assumptions**:
   - *Current Implementation*: The schema does not contain an explicit currency code column; all monetary fields format as Philippine Peso (PHP).
   - *Production Recommendation*: If supporting multi-currency transactions, add a `currency_code` column to `fact_order_items` and convert values using daily exchange rate dimensions.
