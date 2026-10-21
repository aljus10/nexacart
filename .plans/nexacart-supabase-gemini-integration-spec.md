# NexaCart · Supabase & Gemini Integration Specification

**Document Path:** `c:\Users\Justin\Downloads\Projects\October projects\Nexa Cart\.plans\nexacart-supabase-gemini-integration-spec.md`  
**Status:** Approved by User via Interactive Interview  
**Target Environment:** Windows 11 · Node.js 22.13+ · pnpm 11+ · Next.js 16.3 (App Router) · React 19 · Three.js · Supabase (PostgreSQL 17) · Google AI Studio (Gemini 2.5 Flash)

---

## 1. Overview & Objectives

NexaCart is an interactive commerce dashboard built around a verified star schema dataset containing 10,000 order item records. It features:
- A full-screen 3D interactive Philippines map with courier route playback (`/map`)
- An executive commerce analytics dashboard (`/analytics`)
- A Supabase-style read-only record browser (`/data`)
- An AI-powered natural language query assistant ("Ask NexaCart")
- An entrance experience with interactive cart 3D geometry (`/`)

The objective of this work is to transition NexaCart from demo mode into a live, production-grade connected state using the user's active Supabase project (`NexaCart E-Commerce`), configure Google Gemini for natural language query compilation, restructure the repository so all tooling executes at root, apply database RPC functions and security policies, and verify everything with the comprehensive test suite.

---

## 2. Repository Layout & Restructuring

### Current State
Files were unzipped into an inner folder:
`c:\Users\Justin\Downloads\Projects\October projects\Nexa Cart\NexaCart\`

### Target State
All files and directories must reside directly at the project root:
`c:\Users\Justin\Downloads\Projects\October projects\Nexa Cart\`

```
Nexa Cart/
├── .env.example
├── .env.local                  <-- Generated with Supabase URL & config
├── .gitignore
├── .npmrc
├── components.json
├── drizzle.config.ts
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── README.md
├── START-HERE.md
├── tsconfig.json
├── vercel.json
├── vite.config.ts
├── app/                        <-- Next.js App Router (map, analytics, data, api)
├── components/                 <-- UI, 3D scenes, workspaces
├── database/                   <-- setup.sql (RPC definitions)
├── lib/                        <-- engine, server, map-catalog, data
├── public/                     <-- static assets
├── scripts/                    <-- build and verification scripts
└── tests/                      <-- vitest suites
```

**Action Steps:**
1. Move all files and subdirectories from `.\NexaCart\*` to `.\`.
2. Remove the empty `.\NexaCart\` folder.

---

## 3. Database Architecture & Schema Verification

### Supabase Project Details
- **Project Name:** NexaCart E-Commerce
- **Project ID / Ref:** `hokicfifimwdyeibebkg`
- **Region:** `ap-northeast-2`
- **Postgres Engine:** PostgreSQL 17.6
- **Project URL:** `https://hokicfifimwdyeibebkg.supabase.co`

### Existing Schema & Record Counts (Verified via MCP)
| Table Name | Role | Record Count | Key Fields Verified |
|---|---|---|---|
| `public.fact_order_items` | Central Fact | 10,000 | `order_item_id`, `order_number`, `order_date`, `customer_id`, `product_id`, `seller_id`, `payment_id`, `shipping_id`, `quantity`, `unit_price`, `discount_amount`, `shipping_fee`, `gross_sales`, `net_sales`, `total_paid` |
| `public.dim_customer` | Dimension | 500 | `customer_id`, `customer_name`, `city` |
| `public.dim_product` | Dimension | 150 | `product_id`, `product_name`, `category`, `brand` |
| `public.dim_seller` | Dimension | 30 | `seller_id`, `shop_name`, `seller_city` |
| `public.dim_payment` | Dimension | 5 | `payment_id`, `payment_method` |
| `public.dim_shipping` | Dimension | 5 | `shipping_id`, `shipping_method`, `courier_name` |

### Database Functions to Install (`database/setup.sql`)
1. **`public.nexacart_snapshot()`**:
   - Reads metadata and records (up to 15,000 rows per table) from the 6 commerce tables.
   - Dynamic column discovery: avoids breakage if non-essential columns vary.
   - Error boundary per table: failure in one table does not bring down the entire dashboard.
   - `SECURITY INVOKER`, `STABLE`, 8-second execution timeout.
2. **`public.nexacart_query(query_plan jsonb)`**:
   - Secure parameterized aggregation engine executing server-compiled query plans.
   - Metrics: `net_sales`, `orders`, `units`, `aov`, `items`, `gross_sales`, `discounts`, `shipping_fees`, `total_paid`.
   - Dimensions: `none`, `date`, `seller`, `category`, `product`, `brand`, `city`, `payment`, `courier`, `shipping`.
   - Built-in bounds (limit 1-100, strict ASC/DESC, strict date format regex `^\d{4}-\d{2}-\d{2}$`).
   - `SECURITY INVOKER`, `STABLE`, 5-second execution timeout.
3. **Permissions**:
   - `REVOKE ALL ON FUNCTION public.nexacart_snapshot() FROM public, anon, authenticated;`
   - `REVOKE ALL ON FUNCTION public.nexacart_query(jsonb) FROM public, anon, authenticated;`
   - `GRANT EXECUTE ON FUNCTION public.nexacart_snapshot() TO service_role;`
   - `GRANT EXECUTE ON FUNCTION public.nexacart_query(jsonb) TO service_role;`

### Row Level Security (RLS) Policy
- **Decision:** Enable RLS on all 6 commerce tables to protect raw data from client-side `anon` / `authenticated` exposure.
- **Access Model:** Frontend interactions flow securely through Next.js server route handlers (`/api/data`, `/api/ask`, `/api/status`) which authenticate using `SUPABASE_SERVICE_ROLE_KEY` to execute the restricted RPC functions.
- **SQL Execution:**
  ```sql
  ALTER TABLE "public"."dim_customer" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "public"."dim_product" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "public"."dim_seller" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "public"."dim_payment" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "public"."dim_shipping" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "public"."fact_order_items" ENABLE ROW LEVEL SECURITY;
  ```

---

## 4. Google AI Studio (Gemini) Integration

- **Target Model:** `gemini-2.5-flash` (selected for low latency, high reasoning quality on structured JSON schemas, and high quota limits).
- **Architecture:**
  - Client sends natural language prompt to `/api/ask`.
  - Next.js server validates prompt and passes compact schema metadata + valid dimension values to Gemini.
  - Gemini outputs a strictly typed JSON query plan adhering to `planSchema` (Zod/JSON Schema).
  - Server compiles the plan into parameterized PostgreSQL execution in `nexacart_query(jsonb)`.
  - Raw arbitrary SQL is NEVER generated or executed.
- **Fallback:**
  - If `GEMINI_API_KEY` is not present, the app automatically switches to the offline regex/keyword query planner.

---

## 5. Environment Configuration (`.env.local`)

```env
# Supabase Configuration
SUPABASE_URL=https://hokicfifimwdyeibebkg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE

# Google AI Studio Configuration
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GEMINI_MODEL=gemini-2.5-flash
```

> [!IMPORTANT]
> The `SUPABASE_SERVICE_ROLE_KEY` must be obtained from the Supabase Project Dashboard (`Project Settings` > `API Keys` > `service_role secret`).
> Never expose this key in client-side bundles or prefix with `NEXT_PUBLIC_`.

---

## 6. Implementation & Verification Checklist

- [ ] **Phase 1: Workspace Restructure**
  - Move all contents of `NexaCart/` to project root.
  - Remove empty `NexaCart/` folder.
  - Verify all paths and configs resolve from root.

- [ ] **Phase 2: Database Setup & RLS Migration**
  - Execute `database/setup.sql` on project `hokicfifimwdyeibebkg` via MCP tool.
  - Apply RLS enablement on all 6 tables.
  - Test RPC execution directly using `nexacart_snapshot()` to ensure `service_role` and schema return valid JSON.

- [ ] **Phase 3: Environment Configuration**
  - Generate `.env.local` with `SUPABASE_URL`, `GEMINI_MODEL=gemini-2.5-flash`, and placeholders for secret keys.

- [ ] **Phase 4: Dependencies & Test Suite Execution**
  - Verify Node.js version (`>=22.13.0`).
  - Install dependencies using `pnpm install`.
  - Run `pnpm test` (commerce unit tests).
  - Run `pnpm test:map` (11 map route, miniature, and clearance checks).
  - Run `node scripts/check-entrance.mjs` (3D entrance animation geometry checks).

- [ ] **Phase 5: Final Review & Handoff**
  - Confirm local dev server command (`pnpm dev:vercel`).
  - Document key validation steps for the user in chat.
