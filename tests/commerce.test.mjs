import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemo} from '../.sites-runtime/test-build/demo.js';
import {tableNames,METRICS,DIMENSIONS,metricValue,metricError,executePlan,hideTables,validatePlan,compileSQL,offlinePlan,timeSeries,matchingFacts,measure} from '../.sites-runtime/test-build/engine.js';
import {loadSnapshot,answerQuestion,geminiPlan} from '../.sites-runtime/test-build/server.js';
import {POST} from '../.sites-runtime/test-build/ask-route.js';
import fs from 'node:fs';
const demo=createDemo();
const query=(metric='net_sales',dimension='none',filters={})=>({metric,dimension,filters,direction:'desc',limit:100});
function clone(){return structuredClone(demo);}
test('sample data has exactly 10,000 product lines, valid links, and consistent order headers',()=>{
 const facts=demo.tables.fact_order_items.rows;assert.equal(facts.length,10000);
 const orders=new Map();
 for(const r of facts){assert.equal(r.net_sales,r.gross_sales-r.discount_amount);assert.equal(r.total_paid,r.net_sales+r.shipping_fee);for(const x of Object.values(DIMENSIONS))assert.ok(demo.tables[x.table].rows.some(d=>d[x.key]===r[x.key]));const header=JSON.stringify([r.order_date,r.customer_id,r.payment_id,r.shipping_id]);if(orders.has(r.order_number))assert.equal(header,orders.get(r.order_number));else orders.set(r.order_number,header);}
 assert.ok(orders.size<facts.length);assert.equal(metricValue(demo,'orders'),orders.size);
 assert.equal(metricValue(demo,'units'),facts.reduce((n,r)=>n+r.quantity,0));
 assert.equal(metricValue(demo,'aov'),metricValue(demo,'net_sales')/orders.size);
});
test('all 64 missing-table combinations preserve supported views and reject unavailable dependencies',()=>{
 const baseline=metricValue(demo,'net_sales');
 for(let mask=0;mask<64;mask++){
  const hidden=tableNames.filter((_,i)=>mask&(1<<i));const s=hideTables(demo,hidden);
  for(const metric of ['net_sales','orders','units','aov']){if(hidden.includes('fact_order_items'))assert.ok(metricError(s,metric));else assert.equal(metricValue(s,metric),metricValue(demo,metric));}
  for(const d of Object.keys(DIMENSIONS)){const r=executePlan(s,query('net_sales',d));const mustFail=hidden.includes('fact_order_items')||hidden.includes(DIMENSIONS[d].table);assert.equal(!!r.error,mustFail,`${mask}: ${d}`);if(!mustFail)assert.ok(Math.abs(r.rows.reduce((n,v)=>n+v.value,0)-baseline)<.01);}
  for(const t of tableNames.filter(x=>!hidden.includes(x)))assert.equal(s.tables[t].rows.length,demo.tables[t].rows.length);
 }
});
test('empty is zero, missing is unavailable, and connection errors are separate',()=>{
 const s=clone();s.tables.fact_order_items.rows=[];s.tables.fact_order_items.total=0;
 assert.equal(metricValue(s,'orders'),0);assert.equal(metricValue(s,'net_sales'),0);assert.equal(metricValue(s,'aov'),null);assert.equal(metricError(s,'orders'),undefined);
 assert.ok(metricError(hideTables(s,['fact_order_items']),'orders')?.includes('unavailable'));
 s.tables.fact_order_items.status='error';s.tables.fact_order_items.message='Connection denied';assert.equal(metricError(s,'orders'),'Connection denied');
});
test('a missing column affects its own metrics, grouping, and active filters',()=>{
 const s=clone();s.tables.fact_order_items.columns=s.tables.fact_order_items.columns.filter(c=>c!=='net_sales');
 assert.ok(metricError(s,'net_sales'));assert.equal(metricValue(s,'orders'),metricValue(demo,'orders'));assert.equal(metricValue(s,'units'),metricValue(demo,'units'));assert.ok(metricError(s,'aov'));
 const noProduct=hideTables(demo,['dim_product']);assert.ok(metricError(noProduct,'orders',{category:'Fashion'}));assert.equal(metricValue(noProduct,'orders'),metricValue(demo,'orders'));
 const dates=clone();dates.tables.fact_order_items.columns=dates.tables.fact_order_items.columns.filter(c=>c!=='order_date');assert.ok(timeSeries(dates,'orders').error);assert.equal(metricValue(dates,'orders'),metricValue(demo,'orders'));
});
test('unmatched dimension keys are kept; joins never discard fact totals',()=>{
 const s=clone();s.tables.fact_order_items.rows[0].product_id=9999;
 const r=executePlan(s,query('net_sales','category'));assert.ok(r.rows.some(r=>r.label==='Unmatched / null'));assert.equal(r.rows.reduce((n,r)=>n+r.value,0),metricValue(s,'net_sales'));
 assert.match(r.sql,/LEFT JOIN/);assert.match(r.sql,/COALESCE\(p.category::text/);
});
test('filters apply at fact grain and undefined AOV stays null',()=>{
 const f={from:'2026-09-01',to:'2026-09-30',category:'Electronics'};
 const rows=matchingFacts(demo,f);assert.ok(rows.length>0);assert.ok(rows.every(r=>r.order_date>='2026-09-01'&&r.order_date<='2026-09-30'));
 assert.equal(metricValue(demo,'orders',f),new Set(rows.map(r=>r.order_number)).size);
 assert.equal(metricValue(demo,'net_sales',f),rows.reduce((n,r)=>n+r.net_sales,0));
 assert.equal(measure([{order_number:'1',net_sales:null}],'aov'),null);
 assert.equal(metricValue(demo,'aov',{from:'2099-01-01'}),null);
});
test('query compiler parameterizes values and never accepts executable SQL or prototype keys',()=>{
 const attack="Fashion'; DROP TABLE public.dim_product;--";const r=compileSQL(query('orders','category',{category:attack,seller:'Circuit & Co.'}));
 assert.equal(r.sql.includes(attack),false);assert.deepEqual(r.parameters,[attack,'Circuit & Co.']);assert.match(r.sql,/\$1/);assert.equal((r.sql.match(/JOIN public.dim_product/g)||[]).length,1);
 for(const bad of [{...query(),metric:'net_sales);DELETE'}, {...query(),sql:'DROP TABLE x'}, {...query(),metric:'__proto__'}, {...query(),dimension:'constructor'}, {...query(),limit:1000}, {...query(),direction:'desc;drop'}, {...query(),filters:{sql:'SELECT 1'}}, {...query(),filters:{from:'2026-02-30'}}, {...query(),filters:{from:'2026-10-19',to:'2026-10-01'}}])assert.throws(()=>validatePlan(bad));
});
test('offline parser handles the suggested questions and rejects unsupported intent',()=>{
 assert.equal(offlinePlan('Which 5 sellers have the highest net sales?',{}).dimension,'seller');assert.equal(offlinePlan('Which 5 sellers have the highest net sales?',{}).limit,5);
 assert.equal(offlinePlan('How many distinct orders are there?',{}).metric,'orders');
 assert.equal(offlinePlan('What is the average order value?',{}).metric,'aov');
 assert.equal(offlinePlan('Which customer cities buy the most?',{}).dimension,'city');
 assert.equal(offlinePlan('Compare orders by payment method',{}).metric,'orders');
 for(const q of ['delete the orders','forecast revenue','show profit by seller','net sales last month','sales for Fashion','sales by category and city','average units by seller','sales where payment is GCash','sales by seller please exclude the lowest'])assert.throws(()=>offlinePlan(q,{}),q);
});
test('a capped snapshot is never presented as a full-data total',()=>{const s=clone();s.tables.fact_order_items.truncated=true;assert.ok(metricError(s,'net_sales')?.includes('partial'));assert.ok(executePlan(s,query()).error);});
test('time series covers long datasets using monthly buckets instead of silently limiting to 100 dates',()=>{
 const s=clone();s.tables.fact_order_items.rows=Array.from({length:370},(_,i)=>({order_number:String(i),order_date:new Date(Date.UTC(2025,0,i+1)).toISOString().slice(0,10),net_sales:10}));
 const r=timeSeries(s,'net_sales');assert.equal(r.monthly,true);assert.equal(r.rows.reduce((n,r)=>n+r.value,0),3700);assert.ok(r.rows.length>12);
});
test('live connection failures do not fall back to sample data',async()=>{
 const old=globalThis.fetch;
 try{globalThis.fetch=async()=>new Response('{}',{status:401});const s=await loadSnapshot({SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-key'});assert.equal(s.source,'supabase');assert.ok(s.error);assert.ok(tableNames.every(t=>s.tables[t].status==='error'&&s.tables[t].rows.length===0));}finally{globalThis.fetch=old;}
});
test('live answers execute validated plans through the restricted RPC; secrets are not returned',async()=>{
 const old=globalThis.fetch;const calls=[];
 try{globalThis.fetch=async(url,init)=>{calls.push({url:String(url),body:JSON.parse(init.body)});return Response.json({rows:[{label:'All commerce',value:42}]});};const s={...demo,source:'supabase'};const a=await answerQuestion({SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'private-test-key'},'How many distinct orders are there?',s,{},true);assert.equal(a.rows[0].value,42);assert.match(calls[0].url,/\/rpc\/nexacart_query$/);assert.equal(calls[0].body.query_plan.metric,'orders');assert.equal(JSON.stringify(a).includes('private-test-key'),false);
 }finally{globalThis.fetch=old;}
});
test('Gemini receives schema and filter labels, not transaction records or customer names',async()=>{
 const old=globalThis.fetch;
 try{globalThis.fetch=async(url,init)=>{assert.match(String(url),/generativelanguage.googleapis.com/);const b=JSON.parse(init.body);const prompt=b.contents[0].parts[0].text;assert.match(prompt,/fact_order_items/);assert.equal(prompt.includes('Sample Customer 001'),false);assert.equal(prompt.includes('NX-00001'),false);assert.ok(b.generationConfig.responseSchema || b.generationConfig.responseFormat?.text?.schema);return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({supported:true,reason:'',plan:query('orders')})}]}}]});};const p=await geminiPlan({GEMINI_API_KEY:'not-real'},'How many orders?',demo,{});assert.equal(p.metric,'orders');}finally{globalThis.fetch=old;}
});
test('ask endpoint rejects cross-origin, malformed, oversized, and unsupported requests',async()=>{
 let r=await POST(new Request('https://nexa.test/api/ask',{method:'POST',headers:{Origin:'https://evil.test','Content-Type':'application/json'},body:'{}'}));assert.equal(r.status,403);
 r=await POST(new Request('https://nexa.test/api/ask',{method:'POST',body:'abc'}));assert.equal(r.status,415);
 r=await POST(new Request('https://nexa.test/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:'bad'}));assert.equal(r.status,400);
 r=await POST(new Request('https://nexa.test/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'How many orders?',hidden:['private_table']})}));assert.equal(r.status,400);
 r=await POST(new Request('https://nexa.test/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:' '.repeat(8200)}));assert.equal(r.status,413);
});
test('query endpoint works in demo mode with the same schema-removal rules',async()=>{
 const r=await POST(new Request('https://nexa.test/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Show net sales by category',hidden:['dim_product']})}));const a=await r.json();assert.equal(r.status,200);assert.ok(a.error.includes('dim_product'));assert.equal(a.rows.length,0);
});
test('SQL setup has no static dependencies or general execute-SQL RPC, and revokes public execution',()=>{
 const sql=fs.readFileSync('database/setup.sql','utf8');assert.match(sql,/stable security invoker/);assert.match(sql,/revoke all on function public.nexacart_query\(jsonb\) from public,anon,authenticated/);assert.match(sql,/format\('%I\.%I=%L'/);assert.doesNotMatch(sql,/\bDROP TABLE\b|\bTRUNCATE\b|\bINSERT INTO\b|\bDELETE FROM\b|\bUPDATE public\b/i);assert.equal(sql,fs.readFileSync('public/setup.sql','utf8'));
});
