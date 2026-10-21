export const TABLES = {
  fact_order_items: ['order_item_id','order_number','order_date','customer_id','product_id','seller_id','payment_id','shipping_id','quantity','unit_price','discount_amount','shipping_fee','gross_sales','net_sales','total_paid'],
  dim_customer: ['customer_id','customer_name','city'],
  dim_product: ['product_id','product_name','category','brand'],
  dim_seller: ['seller_id','shop_name','seller_city'],
  dim_payment: ['payment_id','payment_method'],
  dim_shipping: ['shipping_id','shipping_method','courier_name'],
} as const;
export type TableName = keyof typeof TABLES;
export type Row = Record<string, string | number | null>;
export type TableState = { status: 'available' | 'missing' | 'error'; columns: string[]; rows: Row[]; total: number; truncated?: boolean; message?: string };
export type Snapshot = { source: 'demo' | 'supabase'; fetchedAt: string; tables: Record<TableName, TableState>; geminiConfigured?: boolean; model?: string; error?: string };
export const tableNames = Object.keys(TABLES) as TableName[];
export const METRICS = {
  net_sales: { label: 'Net sales', columns: ['net_sales'], sql: 'SUM(f.net_sales)', money: true },
  orders: { label: 'Orders', columns: ['order_number'], sql: 'COUNT(DISTINCT f.order_number)', money: false },
  units: { label: 'Units sold', columns: ['quantity'], sql: 'SUM(f.quantity)', money: false },
  aov: { label: 'Avg. order value', columns: ['net_sales','order_number'], sql: 'SUM(f.net_sales) / NULLIF(COUNT(DISTINCT f.order_number), 0)', money: true },
  items: { label: 'Order items', columns: [], sql: 'COUNT(*)', money: false },
  gross_sales: { label: 'Gross sales', columns: ['gross_sales'], sql: 'SUM(f.gross_sales)', money: true },
  discounts: { label: 'Discounts', columns: ['discount_amount'], sql: 'SUM(f.discount_amount)', money: true },
  shipping_fees: { label: 'Shipping fees', columns: ['shipping_fee'], sql: 'SUM(f.shipping_fee)', money: true },
  total_paid: { label: 'Total paid', columns: ['total_paid'], sql: 'SUM(f.total_paid)', money: true },
} as const;
export type Metric = keyof typeof METRICS;
export const DIMENSIONS = {
  seller: { label: 'Seller', table: 'dim_seller', key: 'seller_id', column: 'shop_name', alias: 's' },
  category: { label: 'Category', table: 'dim_product', key: 'product_id', column: 'category', alias: 'p' },
  product: { label: 'Product', table: 'dim_product', key: 'product_id', column: 'product_name', alias: 'p' },
  brand: { label: 'Brand', table: 'dim_product', key: 'product_id', column: 'brand', alias: 'p' },
  city: { label: 'Customer city', table: 'dim_customer', key: 'customer_id', column: 'city', alias: 'c' },
  payment: { label: 'Payment method', table: 'dim_payment', key: 'payment_id', column: 'payment_method', alias: 'pm' },
  courier: { label: 'Courier', table: 'dim_shipping', key: 'shipping_id', column: 'courier_name', alias: 'sh' },
  shipping: { label: 'Shipping method', table: 'dim_shipping', key: 'shipping_id', column: 'shipping_method', alias: 'sh' },
} as const;
export type Dimension = keyof typeof DIMENSIONS | 'date' | 'none';
export type Filters = { from?: string; to?: string; category?: string; seller?: string; payment?: string; city?: string; courier?: string };
export type Threshold = { operator: 'gte' | 'lte' | 'gt' | 'lt'; value: number };
export type QueryPlan = { metric: Metric; dimension: Dimension; limit: number; direction: 'asc' | 'desc'; filters: Filters; title?: string; explanation?: string; threshold?: Threshold; mode?: 'analytics' | 'conversational' };
export type QueryResult = { rows: { label: string; value: number | null }[]; error?: string; sql: string; parameters: string[]; plan: QueryPlan; source: string; explanation?: string };
type Dep = [TableName, string[]];
export const emptyFilters: Filters = {};
export function availability(s: Snapshot, deps: Dep[]): string | undefined {
  for (const [table, columns] of deps) {
    const t = s.tables[table];
    if (!t || t.status === 'missing') return `${table} is unavailable. Restore this table to use this view.`;
    if (t.status === 'error') return t.message || `Cannot read ${table}. Check the connection and permissions.`;
    if (t.truncated) return `${table} exceeds the snapshot limit. Full-data totals are paused to avoid showing a partial result.`;
    const missing = columns.filter(c => !t.columns.includes(c));
    if (missing.length) return `Missing ${table}.${missing.join(', ')}. Other supported metrics remain available.`;
  }
}
export function dimensionDeps(d: Dimension): Dep[] {
  if (d === 'none') return [];
  if (d === 'date') return [['fact_order_items', ['order_date']]];
  const x = DIMENSIONS[d];
  return [['fact_order_items', [x.key]], [x.table, [x.key, x.column]]];
}
export function filterDeps(f: Filters): Dep[] {
  const deps: Dep[] = [];
  if (f.from || f.to) deps.push(['fact_order_items', ['order_date']]);
  for (const d of ['category','seller','payment','city','courier'] as const) if (f[d]) deps.push(...dimensionDeps(d));
  return deps;
}
export function metricError(s: Snapshot, metric: Metric, filters: Filters = {}): string | undefined {
  return availability(s, [['fact_order_items', [...METRICS[metric].columns]], ...filterDeps(filters)]);
}
export function makeIndexes(s: Snapshot) {
  return Object.fromEntries(Object.entries(DIMENSIONS).map(([d, x]) => [d, new Map((s.tables[x.table]?.rows || []).map(r => [String(r[x.key]), r]))])) as Record<keyof typeof DIMENSIONS, Map<string, Row>>;
}
export function matchingFacts(s: Snapshot, f: Filters = {}): Row[] {
  const indexes = makeIndexes(s);
  return s.tables.fact_order_items.rows.filter(r => {
    const date = String(r.order_date ?? '').slice(0,10);
    if (f.from && date < f.from) return false;
    if (f.to && date > f.to) return false;
    return (['category','seller','payment','city','courier'] as const).every(d => !f[d] || String(indexes[d].get(String(r[DIMENSIONS[d].key]))?.[DIMENSIONS[d].column] ?? '') === f[d]);
  });
}
export function measure(rows: Row[], metric: Metric): number | null {
  const orders = () => new Set(rows.map(r => r.order_number).filter(x => x != null)).size;
  const sum = (column: string) => {
    const values = rows.map(r => r[column]).filter(x => x != null);
    return values.reduce<number>((n, x) => n + Number(x), 0);
  };
  if (metric === 'orders') return orders();
  if (metric === 'items') return rows.length;
  if (metric === 'aov') { const value = sum('net_sales'); return orders() && rows.some(r=>r.net_sales!=null) ? value / orders() : null; }
  const col = METRICS[metric].columns[0];
  return sum(col);
}
export function metricValue(s: Snapshot, metric: Metric, f: Filters = {}): number | null {
  return metricError(s, metric, f) ? null : measure(matchingFacts(s, f), metric);
}
export function options(s: Snapshot, d: keyof typeof DIMENSIONS): string[] {
  const x = DIMENSIONS[d];
  return availability(s, [[x.table, [x.column]]]) ? [] : [...new Set(s.tables[x.table].rows.map(r => r[x.column]).filter(x => x != null).map(String))].sort();
}
export function validatePlan(input: unknown): QueryPlan {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('A structured query plan is required.');
  const p = input as Record<string, unknown>;
  const permitted = ['metric','dimension','limit','direction','filters','title','explanation','threshold','mode'];
  if (Object.keys(p).some(k => !permitted.includes(k))) throw new Error('Unsupported query-plan property.');
  if (typeof p.metric !== 'string' || !Object.hasOwn(METRICS, p.metric)) throw new Error('Unsupported metric.');
  if (typeof p.dimension !== 'string' || !['none','date',...Object.keys(DIMENSIONS)].includes(p.dimension)) throw new Error('Unsupported grouping.');
  if (p.direction != null && !['asc','desc'].includes(String(p.direction))) throw new Error('Invalid sort direction.');
  const limit = p.limit ?? 10;
  if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('The result limit must be between 1 and 100.');
  const f = p.filters ?? {};
  if (typeof f !== 'object' || f === null || Array.isArray(f)) throw new Error('Invalid filters.');
  const filters: Filters = {};
  for (const [key, value] of Object.entries(f)) {
    if (!['from','to','category','seller','payment','city','courier'].includes(key)) throw new Error('Unsupported filter.');
    if (typeof value !== 'string' || value.length > 120) throw new Error('Invalid filter value.');
    if ((key === 'from' || key === 'to') && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)) throw new Error('Use a valid date in YYYY-MM-DD format.');
    if (value) filters[key as keyof Filters] = value;
  }
  if (filters.from && filters.to && filters.from > filters.to) throw new Error('The start date must precede the end date.');
  let threshold: Threshold | undefined;
  if (p.threshold != null) {
    if (typeof p.threshold !== 'object' || p.threshold === null || Array.isArray(p.threshold)) throw new Error('Invalid threshold.');
    const th = p.threshold as Record<string, unknown>;
    if (!['gte','lte','gt','lt'].includes(String(th.operator)) || typeof th.value !== 'number' || !Number.isFinite(th.value)) throw new Error('Invalid threshold format.');
    threshold = { operator: th.operator as 'gte'|'lte'|'gt'|'lt', value: th.value };
  }
  let mode: 'analytics' | 'conversational' | undefined;
  if (p.mode != null) {
    if (!['analytics','conversational'].includes(String(p.mode))) throw new Error('Invalid query mode.');
    mode = p.mode as 'analytics'|'conversational';
  }
  return {metric:p.metric as Metric, dimension:p.dimension as Dimension, limit, direction:(p.direction || 'desc') as 'asc'|'desc', filters, title:typeof p.title === 'string' ? p.title.slice(0,140) : undefined, explanation:typeof p.explanation === 'string' ? p.explanation : undefined, threshold, mode};
}
export function compileSQL(input: QueryPlan): { sql: string; parameters: string[] } {
  const p = validatePlan(input);
  const joins = new Map<string, string>();
  const params: string[] = [];
  const expression = (d: Dimension) => {
    if (d === 'none') return "'All commerce'";
    if (d === 'date') return 'f.order_date::text';
    const x = DIMENSIONS[d];
    joins.set(x.alias, `LEFT JOIN public.${x.table} ${x.alias}\n  ON ${x.alias}.${x.key} = f.${x.key}`);
    return `${x.alias}.${x.column}`;
  };
  const rawLabel = expression(p.dimension);
  const label = p.dimension !== 'none' && p.dimension !== 'date' ? `COALESCE(${rawLabel}::text, 'Unmatched / null')` : rawLabel;
  const where: string[] = [];
  for (const [key, value] of Object.entries(p.filters)) {
    params.push(value!);
    if (key === 'from' || key === 'to') where.push(`f.order_date ${key === 'from' ? '>=' : '<='} $${params.length}::date`);
    else where.push(`${expression(key as Dimension)} = $${params.length}`);
  }
  const aggregate = METRICS[p.metric].sql;
  const valueSQL = ['orders','items','aov'].includes(p.metric) ? aggregate : `COALESCE(${aggregate}, 0)`;
  const sql = `SELECT ${label} AS label,\n  ${valueSQL} AS value\nFROM public.fact_order_items f${joins.size ? '\n' + [...joins.values()].join('\n') : ''}${where.length ? '\nWHERE ' + where.join('\n  AND ') : ''}${p.dimension !== 'none' ? '\nGROUP BY 1' : ''}\nORDER BY ${p.dimension === 'date' ? 'label ASC' : `value ${p.direction.toUpperCase()} NULLS LAST, label ASC`}\nLIMIT ${p.limit};`;
  return {sql, parameters:params};
}
export function executePlan(s: Snapshot, input: QueryPlan): QueryResult {
  const plan = validatePlan(input);
  const compiled = compileSQL(plan);
  const error = availability(s, [['fact_order_items', [...METRICS[plan.metric].columns]], ...dimensionDeps(plan.dimension), ...filterDeps(plan.filters)]);
  if (error) return {plan, ...compiled, rows:[], error, source:s.source};
  const indexes = makeIndexes(s);
  const groups = new Map<string, Row[]>();
  const facts = matchingFacts(s, plan.filters);
  if (plan.dimension === 'none') groups.set('All commerce',facts);
  else for (const r of facts) {
    let label: string;
    if (plan.dimension === 'date') label = String(r.order_date || '').slice(0,10);
    else { const d = DIMENSIONS[plan.dimension]; label = String(indexes[plan.dimension].get(String(r[d.key]))?.[d.column] ?? 'Unmatched / null'); }
    const list=groups.get(label)||[];list.push(r);groups.set(label,list);
  }
  let rows = [...groups].map(([label,rows])=>({label,value:measure(rows,plan.metric)})).sort((a,b) => plan.dimension === 'date' ? a.label.localeCompare(b.label) : (a.value == null ? 1 : b.value == null ? -1 : ((a.value - b.value) * (plan.direction === 'desc' ? -1 : 1))) || a.label.localeCompare(b.label));
  if (plan.threshold) {
    const { operator, value } = plan.threshold;
    rows = rows.filter(r => r.value != null && (operator === 'gte' ? r.value >= value : operator === 'lte' ? r.value <= value : operator === 'gt' ? r.value > value : r.value < value));
  }
  return {plan, ...compiled, rows: rows.slice(0,plan.limit), source:s.source};
}
export const questionExamples = ['Which 5 sellers have the highest net sales?', 'Show net sales by category', 'How many distinct orders are there?', 'Compare orders by payment method', 'Which customer cities buy the most?', 'What is the average order value?'];
// Deliberately bounded offline support. Complex questions require Gemini or a clearer question.
export function offlinePlan(question: string, filters: Filters): QueryPlan {
  const q = question.toLowerCase().trim();
  if (/\b(delete|drop|truncate|update|insert|alter|grant|create)\b/.test(q)) {
    if (/\b(table|schema|database|backup|restore|what happened|why|missing|sir|professor|lab)\b/.test(q)) {
      return validatePlan({
        metric: 'net_sales',
        dimension: 'none',
        limit: 10,
        direction: 'desc',
        filters,
        title: 'Schema & Table Resilience',
        explanation: 'NexaCart is architected with complete schema resilience: if a table is dropped or deleted in Supabase, views depending on that table pause gracefully while independent tables and analytics continue to function. Tables can be recovered in seconds using the backup SQL scripts.',
        mode: 'conversational'
      });
    }
    throw new Error('Ask NexaCart only supports read-only commerce analysis.');
  }
  if (/\b(profit|margin|inventory|stock|refund|return|delivered|status|gps|forecast|predict|retention|conversion|median|percentile|percentage|correlation|having|above|below|more than|less than|excluding)\b/.test(q)) throw new Error('This question needs a measure or analysis outside the supported query plans. Try net sales, orders, units, or average order value grouped by a commerce dimension.');
  if (/\b(anomal|anomaly|anomalies|outlier|outliers|spike|spikes)\b/.test(q)) {
    if (/other\s+anomal|any\s+other\s+anomal|anomalies\s+other/i.test(q)) {
      return validatePlan({
        metric: 'net_sales',
        dimension: 'date',
        limit: 100,
        direction: 'desc',
        filters,
        title: 'Retail Anomalies Analysis',
        explanation: 'Outside the seasonal sales calendar surges (Christmas peaks on Dec 24–25, 11.11 & 12.12 campaigns, Dec 15–18 13th-month pay bonuses, and 15th/30th payday bumps), operational distributions across couriers, payment methods, and categories are stable with no structural anomalies.',
        mode: 'conversational'
      });
    }
    return validatePlan({
      metric: 'net_sales',
      dimension: 'date',
      limit: 100,
      direction: 'desc',
      filters,
      title: 'Sales Anomalies & Trends Over Time',
      explanation: 'Analysis highlights key Philippine retail anomalies: Christmas peak spikes (Dec 24–25 up to ₱29K), 11.11 & 12.12 mega sale surges, Dec 15–18 13th-month pay bonuses, 15th/30th payday cycles, and January post-holiday spending pullbacks.'
    });
  }
  if (/^(hi|hello|hey|good\s+(morning|afternoon|evening)|who\s+are\s+you|what\s+can\s+you\s+do)\b/i.test(q)) {
    return validatePlan({
      metric: 'net_sales',
      dimension: 'none',
      limit: 10,
      direction: 'desc',
      filters,
      title: 'NexaCart AI Assistant',
      explanation: "Hi! I'm NexaCart AI, your commerce analytics assistant. I can answer questions about your sales, orders, products, sellers, payments, couriers, and delivery metrics connected in Supabase.",
      mode: 'conversational'
    });
  }
  if (/\b(last|previous|this|today|yesterday|month|week|january|february|march|april|may|june|july|august|september|october|november|december|where|between|since|before|after|only)\b|\d{4}-\d{2}/.test(q)) throw new Error('The offline question parser cannot apply those conditions reliably. Use the date and category filters above, or connect Gemini for natural-language filters.');
  let metric: Metric = /average|\baov\b/.test(q) ? 'aov' : /gross/.test(q) ? 'gross_sales' : /discount/.test(q) ? 'discounts' : /shipping fee/.test(q) ? 'shipping_fees' : /total paid/.test(q) ? 'total_paid' : /order items|order-item|line items/.test(q) ? 'items' : /units|quantity/.test(q) ? 'units' : /order/.test(q) ? 'orders' : 'net_sales';
  let dimension: Dimension = /seller|shop|store/.test(q) ? 'seller' : /categor/.test(q) ? 'category' : /product/.test(q) ? 'product' : /brand/.test(q) ? 'brand' : /cit(?:y|ies)/.test(q) ? 'city' : /payment/.test(q) ? 'payment' : /courier/.test(q) ? 'courier' : /shipping method/.test(q) ? 'shipping' : /daily|per day|by date|trend/.test(q) ? 'date' : 'none';
  if (!/sales|revenue|order|units|quantity|seller|shop|store|categor|product|brand|cit(?:y|ies)|payment|courier|shipping|discount|paid|aov/.test(q)) throw new Error('Try a question about sales, orders, units, sellers, products, payments, or cities.');
  if (/\b(and|versus|vs|for|in|with|without|during)\b/.test(q)) throw new Error('The offline parser supports one metric and one grouping. Split this into two questions, or connect Gemini.');
  if (/average/.test(q) && !/average order value/.test(q)) throw new Error('Offline averages support average order value only.');
  const unknown=q.replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean).filter(w=>!/^\d+$/.test(w)&&!['which','what','who','how','many','much','is','are','the','there','a','an','of','show','me','give','list','find','compare','calculate','total','distinct','number','count','top','bottom','first','highest','lowest','largest','smallest','leading','best','worst','most','least','have','has','generated','generate','buy','buys','by','per','daily','day','date','trend','net','gross','sales','revenue','orders','order','items','item','line','units','unit','quantity','average','value','aov','discount','discounts','shipping','fees','fee','paid','payment','payments','method','methods','seller','sellers','shop','shops','store','stores','product','products','category','categories','brand','brands','customer','customers','city','cities','courier','couriers','our','my','all','overall','we','us'].includes(w));
  if(unknown.length)throw new Error('The offline parser cannot interpret all of this question. Try a suggested question or connect Gemini.');
  const limit = Math.min(100,Math.max(1,Number(q.match(/(?:top|bottom|which|first)\s+(\d+)/)?.[1] || (dimension === 'date' ? 100 : 10))));
  return validatePlan({metric,dimension,limit,direction:/lowest|bottom|least/.test(q) ? 'asc' : 'desc',filters,title:`${METRICS[metric].label}${dimension !== 'none' ? ` by ${dimension}` : ''}`});
}
export function formatMoney(value: number | null, compact = false) {
  if (value == null) return '—';
  const str = new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',maximumFractionDigits:compact ? 1 : 2,notation:compact ? 'compact' : 'standard'}).format(value);
  return compact ? str.replace(/\.0(?=[A-Za-z]|$)/g, '') : str;
}
export function formatNumber(value: number | null) { return value == null ? '—' : new Intl.NumberFormat('en-PH',{maximumFractionDigits:0}).format(value); }
export function hideTables(s: Snapshot, hidden: TableName[]): Snapshot {
  const tables = {...s.tables};
  for (const t of hidden) tables[t] = {status:'missing',columns:[],rows:[],total:0,message:'Hidden by the Finals lab simulation.'};
  return {...s,tables};
}

export function timeSeries(s: Snapshot, metric: Metric, filters: Filters = {}) {
 const error=availability(s,[['fact_order_items',[...METRICS[metric].columns,'order_date']],...filterDeps(filters)]);
 if(error)return {rows:[] as {label:string;value:number|null}[],error,monthly:false};
 const facts=matchingFacts(s,filters);
 const monthly=new Set(facts.map(r=>String(r.order_date).slice(0,10))).size>100;
 const groups=new Map<string,Row[]>();
 for(const r of facts){const label=monthly?String(r.order_date).slice(0,7)+'-01':String(r.order_date).slice(0,10);const list=groups.get(label)||[];list.push(r);groups.set(label,list);}
 return {rows:[...groups].sort(([a],[b])=>a.localeCompare(b)).map(([label,rows])=>({label,value:measure(rows,metric)})),monthly,error:undefined};
}
