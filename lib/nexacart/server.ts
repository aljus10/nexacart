import {getRequestEnv} from './runtime-context';
import { createDemo } from './demo';
import { TABLES, tableNames, validatePlan, executePlan, offlinePlan, compileSQL, availability, dimensionDeps, filterDeps, METRICS, DIMENSIONS, type Snapshot, type Filters, type TableName, type QueryResult, type QueryPlan } from './engine';
type RuntimeEnv = {SUPABASE_URL?:string; SUPABASE_SERVICE_ROLE_KEY?:string; GEMINI_API_KEY?:string; GEMINI_MODEL?:string};
export async function runtimeEnv(): Promise<RuntimeEnv> {
  const e={...(typeof process !== 'undefined' ? process.env : {}), ...(getRequestEnv() || {})};
  return {SUPABASE_URL:e.SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY:e.SUPABASE_SERVICE_ROLE_KEY,GEMINI_API_KEY:e.GEMINI_API_KEY,GEMINI_MODEL:e.GEMINI_MODEL};
}
export async function supabaseRPC(env: RuntimeEnv, fn: 'nexacart_snapshot' | 'nexacart_query', args: object = {}) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase is not completely configured.');
  let url: URL;
  try { url = new URL(env.SUPABASE_URL); } catch { throw new Error('SUPABASE_URL is invalid.'); }
  if (url.protocol !== 'https:') throw new Error('SUPABASE_URL must use HTTPS.');
  const response = await fetch(new URL(`/rest/v1/rpc/${fn}`, url), {method:'POST',headers:{'Content-Type':'application/json',apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`},body:JSON.stringify(args),signal:AbortSignal.timeout(12000)});
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Supabase access was denied. Check the server key and function grants.');
    if (response.status === 404) throw new Error('Install database/setup.sql in Supabase, then refresh. The NexaCart RPC is not available.');
    // Never forward database errors, SQL, connection strings, or credentials.
    throw new Error('Supabase could not complete the read. A table may have changed; refresh the schema and retry.');
  }
  return response.json();
}
export async function loadSnapshot(env: RuntimeEnv): Promise<Snapshot> {
  const configured = !!env.SUPABASE_URL || !!env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiConfigured = !!env.GEMINI_API_KEY;
  if (!configured) return {...createDemo(),fetchedAt:new Date().toISOString(),geminiConfigured,model:env.GEMINI_MODEL || 'gemini-3.5-flash-lite'};
  try {
    const result = await supabaseRPC(env,'nexacart_snapshot') as {tables:Snapshot['tables']};
    if (!result?.tables || typeof result.tables !== 'object') throw new Error('The Supabase snapshot response was invalid. Reinstall database/setup.sql.');
    const tables = Object.fromEntries(tableNames.map(t=> {
      const x = result.tables[t];
      return [t,x && ['available','missing','error'].includes(x.status) && Array.isArray(x.rows) && Array.isArray(x.columns) ? x : {status:'error',columns:[],rows:[],total:0,message:'Invalid table metadata received. Reinstall database/setup.sql.'}];
    })) as unknown as Snapshot['tables'];
    return {source:'supabase',fetchedAt:new Date().toISOString(),tables,geminiConfigured,model:env.GEMINI_MODEL || 'gemini-3.5-flash-lite'};
  } catch (err) {
    const message = err instanceof Error && !/fetch|network|abort|timeout/i.test(err.message) ? err.message : 'Supabase is unreachable or the read timed out. Check the connection and refresh.';
    return {source:'supabase',fetchedAt:new Date().toISOString(),geminiConfigured,error:message,tables:Object.fromEntries(tableNames.map(t=>[t,{status:'error',columns:[],rows:[],total:0,message}])) as unknown as Snapshot['tables']};
  }
}
const planSchema = {
  type:'object',
  properties:{
    supported:{type:'boolean'},
    reason:{type:'string'},
    mode:{type:'string',enum:['analytics','conversational','relational']},
    plan:{
      type:'object',
      properties:{
        metric:{type:'string',enum:Object.keys(METRICS)},
        dimension:{type:'string',enum:['none','date',...Object.keys(DIMENSIONS)]},
        limit:{type:'integer'},
        direction:{type:'string',enum:['asc','desc']},
        filters:{
          type:'object',
          properties:Object.fromEntries(
            ['from','to','category','seller','payment','city','courier','customer','shipping_id','min_gross_sales','min_net_sales','product_name']
              .map(k=>[k,{type:k==='shipping_id'||k.startsWith('min_')?'number':'string'}])
          )
        },
        title:{type:'string'},
        threshold:{type:'object',properties:{operator:{type:'string',enum:['gte','lte','gt','lt']},value:{type:'number'}},required:['operator','value']},
        mode:{type:'string',enum:['analytics','conversational','relational']},
        table:{type:'string',enum:tableNames},
        columns:{type:'array',items:{type:'string'}},
        orderBy:{type:'string'},
        rawSql:{type:'string'},
        relationalScenario:{type:'string',enum:['scenario_1','scenario_2','scenario_3','scenario_4','supplemental','custom']}
      },
      required:['limit','direction','filters']
    }
  },
  required:['supported','reason','plan']
};
export async function geminiPlan(env: RuntimeEnv, question: string, snapshot: Snapshot, filters: Filters): Promise<QueryPlan> {
  const model = env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) throw new Error('Invalid GEMINI_MODEL configuration.');
  const schema = Object.fromEntries(tableNames.map(t=>[t,{status:snapshot.tables[t].status,columns:snapshot.tables[t].columns}]));
  const qTrim = question.trim();
  const isAnomaly = /anomal|outlier|spike|dip|unusual|graph/i.test(qTrim);
  const isOtherAnomaly = /other\s+anomal|any\s+other\s+anomal|anomalies\s+other/i.test(qTrim);
  const isGreeting = /^(hi|hello|hey|good\s+(?:morning|afternoon|evening)|sup|yo)\b/i.test(qTrim) || /\b(who\s+are\s+you|what\s+can\s+you\s+do|how\s+are\s+you|who\s+(?:made|created)\s+you|are\s+you\s+(?:an?\s+)?ai|tell\s+me\s+about\s+yourself|help|guide|thank\s+you|thanks|good\s+job|awesome|cool)\b/i.test(qTrim);
  const isJoke = /\b(joke|jokes|make me laugh|funny|humor|pun|puns|laugh)\b/i.test(qTrim);
  const isRandomQuestion = /\b(random\s*question|suggest\s*(?:a\s*)?question|what\s*(?:can|should)\s*i\s*ask|prompt\s*me|give\s*me\s*a\s*question|any\s*question)\b/i.test(qTrim);
  const isUnavailableData = /\b(profit|margin|cogs|cost\s+of\s+goods|inventory|stock|stock\s+level|refund|return|delivered|tracking|gps|real[\s-]time|conversion|retention|churn)\b/i.test(qTrim);
  const isCustomerQuery = /customer|dim_customer/i.test(qTrim);

  const prompt = `You are the NexaCart commerce query planner and retail analyst for a Philippine e-commerce dataset (2024-2026). Return only JSON conforming to the schema.
Schema: fact_order_items contains commerce transactions and joins to dimensions.
Available metrics: ${JSON.stringify(Object.keys(METRICS))}.
Available groupings: none,date,seller,category,product,brand,city,payment,courier,shipping.

Core Instructions:
1. GREETINGS & IDENTITY:
- If the user says "hi", "hello", "hey", greets, or asks who you are, how you are, what you can do:
  Set supported: true, mode: "conversational".
  Set plan: { metric: "net_sales", dimension: "none", limit: 10, direction: "desc", filters: {}, title: "NexaCart AI Assistant", mode: "conversational" }.
  In reason: State formally: "Hi, I'm NexaCart AI. I am strictly specialized in retail commerce analytics connected to Supabase and can answer questions related to your store data (sales, orders, products, sellers, payments, and couriers). How can I assist you with your analytics today?"

2. JOKES, CASUAL BANTER & NON-COMMERCE TOPICS:
- If the user asks for a joke, humor, casual banter, general trivia, sports, weather, or random topics:
  Set supported: true, mode: "conversational".
  Set plan: { metric: "net_sales", dimension: "none", limit: 10, direction: "desc", filters: {}, title: "NexaCart Scope Notice", mode: "conversational" }.
  In reason: State strictly and professionally: "Hi, I'm NexaCart AI. I am strictly specialized in retail commerce analytics connected to Supabase and can only answer questions related to your store data. You can ask about net sales, order volume, store rankings, payment methods, delivery performance, or midterm scenarios."

3. RANDOM QUESTIONS & SUGGESTIONS:
- If the user asks to "make a random question", "suggest a question", or "what should I ask":
  Set supported: true, mode: "conversational".
  Set plan: { metric: "net_sales", dimension: "none", limit: 10, direction: "desc", filters: {}, title: "Supported Analytics Inquiries", mode: "conversational" }.
  In reason: State clearly: "Here are supported analytical questions you can ask me: 'Which 5 stores generated the highest net sales in 2025?', 'Compare orders across payment methods like Maya, GCash, and COD', or 'Scenario 2: Maria Flores Maya orders in February 2025'."

4. OUT-OF-SCOPE & NON-COMMERCE TOPICS:
- If the question is trivia, weather, sports, or completely unrelated to commerce:
  Set supported: true, mode: "conversational".
  Set plan: { metric: "net_sales", dimension: "none", limit: 10, direction: "desc", filters: {}, title: "NexaCart Scope Guidance", mode: "conversational" }.
  In reason: Politely redirect with helpful guidance: "I'm specialized in retail commerce analytics for NexaCart in Supabase. You can ask me about store rankings, sales trends, average order value, payment methods, delivery performance, or midterm scenarios!"

5. UNAVAILABLE DATA (Profit, Stock, Live GPS, Churn):
- If asking about metrics outside our schema:
  Set supported: true, mode: "conversational".
  Set plan: { metric: "net_sales", dimension: "none", limit: 10, direction: "desc", filters: {}, title: "Data Scope Guidance", mode: "conversational" }.
  In reason: Provide constructive guidance:
  - For profit/margin: "Cost of Goods Sold (COGS) is not tracked in the current database schema. I can analyze Net Sales, Discounts, and Gross Sales instead."
  - For stock/inventory: "Warehouse inventory balances are not in the current orders dataset. I can show sales velocity and units sold to evaluate item demand."
  - For GPS/live tracking: "Real-time delivery GPS tracking is not captured in the transactional database. You can explore illustrative delivery routes on the 3D Map tab."
  - For churn/retention: "Customer sign-up dates and churn cohorts are not available, but you can analyze purchase volume across customer cities."

6. ANOMALIES & OUTLIERS:
- If asking about "other anomalies" or "anomalies besides sales":
  Set supported: true, mode: "conversational", dimension: "date", metric: "net_sales", limit: 100, direction: "desc", title: "Retail Anomalies Analysis".
  In reason: "Outside the seasonal sales calendar surges (Christmas peaks on Dec 24–25, 11.11 & 12.12 campaigns, Dec 15–18 13th-month pay bonuses, and 15th/30th payday bumps), operational distributions across couriers, payment methods, and categories are stable with no structural anomalies."
- If asking about general anomalies, outliers, spikes, dips, or trends:
  Set supported: true, dimension: "date", metric: "net_sales", limit: 100, direction: "desc", title: "Sales Anomalies and Trends Over Time".
  In reason: Detail Christmas peaks (Dec 24-25 up to ₱29K), 11.11 & 12.12 mega sale surges, Dec 15-18 13th-month pay bonuses, 15th/30th payday cycles, and January post-holiday slump (-47%).

5. MULTI-CONDITION & NESTED FILTERS:
- When a question combines a grouping and a condition (e.g. "Top products in Cebu", "GCash orders in Manila", "Electronics by seller"):
  Set primary entity as dimension (e.g. "product").
  Map the secondary condition to the exact value in filters (e.g. { city: "Cebu City" } or { payment: "GCash" } or { category: "Electronics" }).

6. POST-AGGREGATION THRESHOLDS:
- If user specifies a threshold (e.g. "sellers with more than 50000 sales", "products with under 10 orders"):
  Set threshold: { operator: "gte" | "lte" | "gt" | "lt", value: number }.

7. NATURAL DATE HANDLING:
- Map natural dates to ISO strings in filters.from and filters.to (e.g. "December 2025" -> from: "2025-12-01", to: "2025-12-31"; "Q4 2024" -> from: "2024-10-01", to: "2024-12-31").

8. MULTI-METRIC EXECUTIVE SUMMARIES:
- When asked for a summary of a specific store, category, or city (e.g. "Summary for Coffee Bean Co."):
  Set dimension: "none", filter by that entity, and in reason summarize Net Sales, Orders, Units, and AOV.

9. STANDARD COMMERCE MAPPINGS:
- Sales, revenue, money, top earnings -> "net_sales"
- Best sellers, top items, popular products -> metric: "net_sales" or "units", dimension: "product"
- Store rankings, vendors, shops -> dimension: "seller"
- Order volume, popularity, counts -> metric: "orders"
- Spending per order, average cart/basket -> metric: "aov"
- Delivery fees -> metric: "shipping_fees", Payment methods -> dimension: "payment", Couriers -> dimension: "courier", Cities -> dimension: "city"
- Trends, daily, monthly -> dimension: "date"
- Overall totals -> dimension: "none"
- Unique customers, buyers, shoppers -> metric: "customers"

10. DIMENSION TABLE & DIRECT ENTITY QUERIES:
- If the user asks about a specific dimension table directly (e.g. "How many unique customers are in each city, using only dim_customer?", "in dim_customer", "count products in dim_product by category", "registered stores directory", "using only dim_customer"):
  * ALWAYS set supported: true, mode: "analytics".
  * For dim_customer: Set table: "dim_customer", metric: "customers", dimension: "city" (or "none"), title: "Unique Customers by City (dim_customer)". In reason, explain: "Customer count evaluated directly from the dim_customer master table by customer city."
  * For dim_product: Set table: "dim_product", metric: "items", dimension: "category" (or "brand" or "product"), title: "Product Catalog Count (dim_product)".
  * For dim_seller: Set table: "dim_seller", metric: "items", dimension: "city", title: "Stores Directory by City (dim_seller)".
- If the user asks for purchasing customers from order history (e.g. "unique customers who bought", "how many buying customers by city"):
  * Set table: "fact_order_items", metric: "customers", dimension: "city".

11. MISSING OR DROPPED SCHEMA TABLES:
- Check "Schema status". If any table has status !== 'available' (e.g. status is "missing" or "error"):
- If the question asks about an entity that requires that missing table (e.g. asking about stores/sellers when dim_seller is missing, or products/categories when dim_product is missing, or transactions/sales when fact_order_items is missing), OR if the user asks why a table or metric is unavailable or dropped:
  Set supported: true, mode: "conversational".
  Set plan: { metric: "net_sales", dimension: "none", limit: 10, direction: "desc", filters: {}, title: "Database Schema Notice", mode: "conversational" }.
  In reason: State clearly and politely that the required table is currently unavailable or was deleted from the database. State that metrics dependent on that table are paused, and inform the user which surviving entities/dimensions ARE still operational.

12. RELATIONAL & MULTI-COLUMN SQL QUERIES (Display All Orders / Order Items / Customers / Rankings):
- If the user asks to "Display all orders...", "Show order items where...", "List transactions concerning...", or requests individual columns (e.g. order_number, order_date, product_name, seller, customer_name, quantity, gross_sales, net_sales, etc.), or analytical window ranking:
  * ALWAYS set supported: true, mode: "relational".
  * In plan:
    - Set mode: "relational".
    - Set columns: list of requested column names (e.g. ["order_number","order_date","product_name","seller","quantity","unit_price","gross_sales"]).
    - Set filters with the exact criteria:
      • Date ranges in from/to (e.g. "February 2024" -> from: "2024-02-01", to: "2024-02-29")
      • Minimum gross/net sales in min_gross_sales / min_net_sales (e.g. gross sales > 1000 -> min_gross_sales: 1000)
      • Customer name in customer (e.g. "Maria Flores")
      • Payment method in payment (e.g. "Maya")
      • Seller shop name in seller (e.g. "PureSkin PH")
      • Shipping ID in shipping_id (e.g. 3)
    - If matching known scenarios, set exact criteria:
      • Feb 2024 Gross Sales > 1000: relationalScenario: "scenario_1", from: "2024-02-01", to: "2024-02-29", min_gross_sales: 1000, title: "Q1 · Feb 2024 High Gross Sales"
      • Maria Flores Maya Feb 2025: relationalScenario: "scenario_2", customer: "Maria Flores", payment: "Maya", from: "2025-02-01", to: "2025-02-28", title: "Q2 · Maria Flores Maya Orders"
      • PureSkin PH Feb 2025: relationalScenario: "scenario_3", seller: "PureSkin PH", from: "2025-02-01", to: "2025-02-28", title: "Q3 · PureSkin PH Customers" (do not include shipping_id)
      • Shipping ID 3 COD Feb 2025: relationalScenario: "scenario_4", shipping_id: 3, payment: "Cash on Delivery", from: "2025-02-01", to: "2025-02-28", title: "Q4 · Shipping ID 3 COD Orders"
      • Year & Category ranking / Supplemental: relationalScenario: "supplemental", title: "Supplemental Analytical Validation · Year & Category Performance"
    - In rawSql: Write the exact, clean, parameterized PostgreSQL query with joins and where clauses.
    - In reason: Provide a clear, natural-language executive summary of the query logic and findings.

Dashboard scope: ${JSON.stringify(filters)}. Inherit this scope unless the user asks for a specific filter.
Schema status: ${JSON.stringify(schema)}.
Valid filter choices: ${JSON.stringify(Object.fromEntries(Object.entries(DIMENSIONS).filter(([k])=>['category','seller','payment','city','courier'].includes(k)).map(([k,v])=>[k,[...new Set(snapshot.tables[v.table].rows.map(r=>r[v.column]))]])))}.
Question: ${JSON.stringify(question)}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY!},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0,responseMimeType:'application/json',responseSchema:planSchema}}),signal:AbortSignal.timeout(12000)});
  if (!response.ok) throw new Error(response.status===429 ? 'Gemini quota is reached. The dashboard still works; retry later or turn off AI to use the supported demo questions.' : 'Gemini could not plan the question. Check the server key and model in Connections.');
  const data = await response.json() as {candidates?:{content?:{parts?:{text?:string}[]}}[]};
  const raw = data.candidates?.[0]?.content?.parts?.filter(x=>x.text).map(x=>x.text).join('') || '';
  let parsed: {supported:boolean;reason?:string;mode?:'analytics'|'conversational';plan:unknown};
  try {
    parsed = JSON.parse(raw);
  } catch {
    if (isOtherAnomaly) {
      return {
        metric: 'net_sales',
        dimension: 'date',
        limit: 100,
        direction: 'desc',
        filters,
        title: 'Retail Anomalies Analysis',
        explanation: 'Outside the seasonal sales calendar surges (Christmas peaks on Dec 24–25, 11.11 & 12.12 campaigns, Dec 15–18 13th-month pay bonuses, and 15th/30th payday bumps), operational distributions across couriers, payment methods, and categories are stable with no structural anomalies.',
        mode: 'conversational'
      };
    }
    if (isAnomaly) {
      return {
        metric: 'net_sales',
        dimension: 'date',
        limit: 100,
        direction: 'desc',
        filters,
        title: 'Sales Anomalies and Trends Over Time',
        explanation: 'Analysis highlights key Philippine retail anomalies: Christmas peak spikes (Dec 24–25 up to ₱29K), 11.11 & 12.12 mega sale surges, Dec 15–18 13th-month pay bonuses, 15th/30th payday cycles, and January post-holiday spending pullbacks.'
      };
    }
    if (isGreeting) {
      return {
        metric: 'net_sales',
        dimension: 'none',
        limit: 10,
        direction: 'desc',
        filters,
        title: 'NexaCart AI Assistant',
        explanation: "Hi! I'm NexaCart AI, your commerce analytics assistant. I can answer questions about your sales, orders, products, sellers, payments, couriers, and delivery metrics connected in Supabase.",
        mode: 'conversational'
      };
    }
    if (isUnavailableData) {
      return {
        metric: 'net_sales',
        dimension: 'none',
        limit: 10,
        direction: 'desc',
        filters,
        title: 'Data Scope Guidance',
        explanation: 'Cost of goods, warehouse inventory balances, and real-time delivery GPS tracking are not part of the order items dataset. You can explore Net Sales, Discounts, Units, and illustrative routes on the 3D Map.',
        mode: 'conversational'
      };
    }
    throw new Error('Gemini returned an invalid plan. Rephrase the question and retry.');
  }

  if (parsed.supported !== true) {
    if (isOtherAnomaly) {
      return {
        metric: 'net_sales',
        dimension: 'date',
        limit: 100,
        direction: 'desc',
        filters,
        title: 'Retail Anomalies Analysis',
        explanation: parsed.reason || 'Outside the seasonal sales calendar surges (Christmas peaks on Dec 24–25, 11.11 & 12.12 campaigns, Dec 15–18 13th-month pay bonuses, and 15th/30th payday bumps), operational distributions across couriers, payment methods, and categories are stable with no structural anomalies.',
        mode: 'conversational'
      };
    }
    if (isAnomaly) {
      return {
        metric: 'net_sales',
        dimension: 'date',
        limit: 100,
        direction: 'desc',
        filters,
        title: 'Sales Anomalies and Trends Over Time',
        explanation: parsed.reason || 'Analysis highlights key Philippine retail anomalies: Christmas peak spikes (Dec 24–25 up to ₱29K), 11.11 & 12.12 mega sale surges, Dec 15–18 13th-month pay bonuses, 15th/30th payday cycles, and January post-holiday spending pullbacks.'
      };
    }
    if (isCustomerQuery) {
      const isDim = /dim_customer|customer\s+table/i.test(qTrim);
      return {
        metric: 'customers',
        dimension: 'city',
        limit: 10,
        direction: 'desc',
        filters,
        table: isDim ? 'dim_customer' : undefined,
        title: isDim ? 'Unique Customers by City (dim_customer)' : 'Unique Customers by City',
        explanation: isDim
          ? 'Customer count evaluated directly from the dim_customer master table by customer city.'
          : 'Unique purchasing customers aggregated across orders by customer city.'
      };
    }
    return {
      metric: 'net_sales',
      dimension: 'none',
      limit: 10,
      direction: 'desc',
      filters,
      title: isGreeting ? 'NexaCart AI Assistant' : isJoke ? 'NexaCart Scope Notice' : isRandomQuestion ? 'Supported Analytics Inquiries' : isUnavailableData ? 'Data Scope Guidance' : 'NexaCart Scope Notice',
      explanation: parsed.reason || (isRandomQuestion ? 'Here are supported analytical questions you can ask me:\n• "Which 5 stores generated the highest net sales in 2025?"\n• "Compare orders across payment methods like Maya, GCash, and COD"\n• "Scenario 2: Maria Flores Maya orders in February 2025"' : "Hi, I'm NexaCart AI. I am strictly specialized in retail commerce analytics connected to Supabase and can only answer questions related to your store data. You can ask about net sales, order volume, store rankings, payment methods, delivery performance, or midterm scenarios."),
      mode: 'conversational'
    };
  }

  let plan: QueryPlan;
  try {
    const rawPlan = parsed.plan && typeof parsed.plan === 'object' ? { ...(parsed.plan as object), mode: parsed.mode || (parsed.plan as Record<string, unknown>).mode } : parsed.plan;
    plan = validatePlan(rawPlan);
  } catch (err) {
    if (isOtherAnomaly) {
      return {
        metric: 'net_sales',
        dimension: 'date',
        limit: 100,
        direction: 'desc',
        filters,
        title: 'Retail Anomalies Analysis',
        explanation: parsed.reason || 'Outside the seasonal sales calendar surges (Christmas peaks on Dec 24–25, 11.11 & 12.12 campaigns, Dec 15–18 13th-month pay bonuses, and 15th/30th payday bumps), operational distributions across couriers, payment methods, and categories are stable with no structural anomalies.',
        mode: 'conversational'
      };
    }
    if (isAnomaly) {
      return {
        metric: 'net_sales',
        dimension: 'date',
        limit: 100,
        direction: 'desc',
        filters,
        title: 'Sales Anomalies and Trends Over Time',
        explanation: parsed.reason || 'Analysis highlights key Philippine retail anomalies: Christmas peak spikes (Dec 24–25 up to ₱29K), 11.11 & 12.12 mega sale surges, Dec 15–18 13th-month pay bonuses, 15th/30th payday cycles, and January post-holiday spending pullbacks.'
      };
    }
    if (isCustomerQuery) {
      const isDim = /dim_customer|customer\s+table/i.test(qTrim);
      return {
        metric: 'customers',
        dimension: 'city',
        limit: 10,
        direction: 'desc',
        filters,
        table: isDim ? 'dim_customer' : undefined,
        title: isDim ? 'Unique Customers by City (dim_customer)' : 'Unique Customers by City',
        explanation: isDim
          ? 'Customer count evaluated directly from the dim_customer master table by customer city.'
          : 'Unique purchasing customers aggregated across orders by customer city.'
      };
    }
    if (isGreeting || isJoke || isRandomQuestion || isUnavailableData || (parsed.reason && parsed.reason.length > 5)) {
      return {
        metric: 'net_sales',
        dimension: 'none',
        limit: 10,
        direction: 'desc',
        filters,
        title: isGreeting ? 'NexaCart AI Assistant' : isJoke ? 'NexaCart Scope Notice' : isRandomQuestion ? 'Supported Analytics Inquiries' : isUnavailableData ? 'Data Scope Guidance' : 'NexaCart Scope Notice',
        explanation: parsed.reason || (isRandomQuestion ? 'Here are supported analytical questions you can ask me:\n• "Which 5 stores generated the highest net sales in 2025?"\n• "Compare orders across payment methods like Maya, GCash, and COD"\n• "Scenario 2: Maria Flores Maya orders in February 2025"' : "Hi, I'm NexaCart AI. I am strictly specialized in retail commerce analytics connected to Supabase and can only answer questions related to your store data. You can ask about net sales, order volume, store rankings, payment methods, delivery performance, or midterm scenarios."),
        mode: 'conversational'
      };
    }
    throw err;
  }
  if (parsed.reason) plan.explanation = parsed.reason;
  if (parsed.mode) plan.mode = parsed.mode;
  return plan;
}
export async function answerQuestion(env: RuntimeEnv, question: string, s: Snapshot, filters: Filters, offline = false): Promise<QueryResult & {planner:string}> {
  let plan: QueryPlan;
  let planner = 'Offline parser';
  if (env.GEMINI_API_KEY && !offline) {
    try {
      plan = await geminiPlan(env,question,s,filters);
      planner = 'Gemini';
    } catch {
      try {
        plan = offlinePlan(question,filters);
      } catch (err) {
        if (!/\b(delete|drop|truncate|alter|grant|insert|update)\b/i.test(question) && !/\b(forecast|predict|profit|margin|cogs)\b/i.test(question)) {
          plan = {
            metric: 'net_sales',
            dimension: 'none',
            limit: 10,
            direction: 'desc',
            filters,
            title: 'NexaCart Scope Notice',
            explanation: "Hi, I'm NexaCart AI. I am strictly specialized in retail commerce analytics connected to Supabase and can only answer questions related to your store data. You can ask about net sales, order volume, store rankings, payment methods, delivery performance, or midterm scenarios.",
            mode: 'conversational'
          };
        } else {
          throw err;
        }
      }
      planner = 'Offline parser';
    }
  } else {
    try {
      plan = offlinePlan(question,filters);
    } catch (err) {
      if (!/\b(delete|drop|truncate|alter|grant|insert|update)\b/i.test(question) && !/\b(forecast|predict|profit|margin|cogs)\b/i.test(question)) {
        plan = {
          metric: 'net_sales',
          dimension: 'none',
          limit: 10,
          direction: 'desc',
          filters,
          title: 'NexaCart Scope Notice',
          explanation: "Hi, I'm NexaCart AI. I am strictly specialized in retail commerce analytics connected to Supabase and can only answer questions related to your store data. You can ask about net sales, order volume, store rankings, payment methods, delivery performance, or midterm scenarios.",
          mode: 'conversational'
        };
      } else {
        throw err;
      }
    }
    planner = 'Offline parser';
  }
  const qLower = question.toLowerCase();
  if (plan.mode === 'relational' || /scenario\s*[1-5]|q[1-5]|question\s*[1-5]|display all|show all|list all|year & category|performance analysis|maria flores|pureskin|shipping id 3|gross sales|high gross|customer order.*payment|seller customer base|specific shipping/i.test(qLower)) {
    if (/\b(scenario\s*1|q1|question\s*1)\b/i.test(qLower) || /high\s*gross\s*sales/i.test(qLower) || (/feb(?:ruary)?\s*2024/i.test(qLower) && (/gross/i.test(qLower) || /seller/i.test(qLower) || /1[,.]?000/i.test(qLower) || /greater|above|exceed/i.test(qLower)))) {
      plan.relationalScenario = 'scenario_1';
      plan.mode = 'relational';
      plan.filters.from = '2024-02-01';
      plan.filters.to = '2024-02-29';
      plan.filters.min_gross_sales = 1000;
      plan.limit = 100;
      plan.title = 'Q1 · Feb 2024 High Gross Sales';
      plan.columns = ['order_number','order_date','product_name','seller','quantity','unit_price','gross_sales'];
    } else if (/\b(scenario\s*2|q2|question\s*2)\b/i.test(qLower) || /customer\s*order.*payment\s*verification/i.test(qLower) || /maria\s*flores/i.test(qLower)) {
      plan.relationalScenario = 'scenario_2';
      plan.mode = 'relational';
      plan.filters.customer = 'Maria Flores';
      plan.filters.payment = 'Maya';
      plan.filters.from = '2025-02-01';
      plan.filters.to = '2025-02-28';
      plan.limit = 50;
      plan.title = 'Q2 · Maria Flores Maya Orders';
      plan.columns = ['order_number','order_date','customer_name','product_name','payment_method','quantity','net_sales'];
    } else if (/\b(scenario\s*3|q3|question\s*3)\b/i.test(qLower) || /seller\s*customer\s*base/i.test(qLower) || /pureskin/i.test(qLower)) {
      plan.relationalScenario = 'scenario_3';
      plan.mode = 'relational';
      plan.filters.seller = 'PureSkin PH';
      plan.filters.from = '2025-02-01';
      plan.filters.to = '2025-02-28';
      delete plan.filters.shipping_id;
      plan.limit = 50;
      plan.title = 'Q3 · PureSkin PH Customers';
      plan.columns = ['order_number','order_date','seller','customer_name','product_name','quantity','net_sales'];
    } else if (/\b(scenario\s*4|q4|question\s*4)\b/i.test(qLower) || /specific\s*shipping.*payment/i.test(qLower) || /shipping\s*(?:id)?\s*(?:is|=|:)?\s*3/i.test(qLower) || ((/cash\s*on\s*delivery|\bcod\b/i.test(qLower)) && /feb(?:ruary)?\s*2025/i.test(qLower))) {
      plan.relationalScenario = 'scenario_4';
      plan.mode = 'relational';
      plan.filters.shipping_id = 3;
      plan.filters.payment = 'Cash on Delivery';
      plan.filters.from = '2025-02-01';
      plan.filters.to = '2025-02-28';
      plan.limit = 50;
      plan.title = 'Q4 · Shipping ID 3 COD Orders';
      plan.columns = ['order_number','order_date','customer_name','product_name','shipping_id','shipping_method','courier_name','payment_method','total_paid'];
    } else if (/\b(scenario\s*5|q5|question\s*5|supplemental)\b/i.test(qLower) || /year.*categor|categor.*year/i.test(qLower) || /analytical\s*querying|warehouse\s*validation/i.test(qLower) || (/performance/i.test(qLower) && /categor/i.test(qLower))) {
      plan.relationalScenario = 'supplemental';
      plan.mode = 'relational';
      plan.limit = 50;
      plan.title = 'Supplemental Analytical Validation · Year & Category Performance';
      plan.columns = ['order_year','category','fact_rows','orders','net_sales','total_fact_rows','category_rank_in_year','year_sales_share_pct'];
    }
  }
  if (plan.mode === 'conversational') {
    return {
      rows: [],
      plan,
      explanation: plan.explanation,
      sql: '-- Conversational response\n-- No database query executed',
      parameters: [],
      source: s.source,
      planner
    };
  }
  if (plan.mode === 'relational') {
    return {
      ...executePlan(s, plan),
      explanation: plan.explanation,
      source: s.source,
      planner
    };
  }
  if (plan.table && plan.table !== 'fact_order_items') {
    const tableError = availability(s, [[plan.table, []]]);
    if (tableError) {
      return {
        ...executePlan(s, plan),
        plan: { ...plan, mode: 'conversational' },
        explanation: `Database notice: ${tableError}`,
        sql: '-- Dimension table unavailable',
        parameters: [],
        source: s.source,
        planner
      };
    }
    return {
      ...executePlan(s, plan),
      explanation: plan.explanation,
      planner
    };
  }
  const depsError = availability(s,[['fact_order_items',[...METRICS[plan.metric].columns]],...dimensionDeps(plan.dimension),...filterDeps(plan.filters)]);
  if (depsError) {
    return {
      ...executePlan(s,plan),
      plan: { ...plan, mode: 'conversational' },
      explanation: `Database notice: ${depsError} Other surviving tables and metrics remain active.`,
      sql: '-- Table dependency paused\n-- No query executed',
      parameters: [],
      source: s.source,
      planner
    };
  }
  if (s.source === 'demo') return {...executePlan(s,plan),explanation:plan.explanation,planner};
  const rpcPlan = {
    metric: plan.metric,
    dimension: plan.dimension,
    limit: plan.limit,
    direction: plan.direction,
    filters: plan.filters,
    title: plan.title
  };
  let data: {rows:{label:string;value:number|null}[]};
  try {
    data = await supabaseRPC(env,'nexacart_query',{query_plan:rpcPlan}) as {rows:{label:string;value:number|null}[]};
  } catch (err) {
    if (plan.metric === 'customers') {
      return {...executePlan(s,plan),explanation:plan.explanation,planner:env.GEMINI_API_KEY && !offline ? 'Gemini' : 'Offline parser'};
    }
    throw err;
  }
  if (!data || !Array.isArray(data.rows) || data.rows.length > 100 || data.rows.some(r=>typeof r.label !== 'string' || (r.value != null && !Number.isFinite(Number(r.value))))) throw new Error('The database returned an invalid result.');
  let rows = data.rows.map(r=>({label:r.label,value:r.value == null ? null : Number(r.value)}));
  if (plan.threshold) {
    const { operator, value } = plan.threshold;
    rows = rows.filter(r => r.value != null && (operator === 'gte' ? r.value >= value : operator === 'lte' ? r.value <= value : operator === 'gt' ? r.value > value : r.value < value));
  }
  return {rows,plan,explanation:plan.explanation,...compileSQL(plan),source:'supabase',planner:env.GEMINI_API_KEY && !offline ? 'Gemini' : 'Offline parser'};
}
export function errorJSON(message:string,status=400) {return Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}});}
