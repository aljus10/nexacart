import {TABLES,DIMENSIONS,availability,matchingFacts,makeIndexes,measure,METRICS,filterDeps,type Snapshot,type Filters,type TableName,type Row,type Dimension,type Metric} from './engine';
export type WorkspaceTab='map'|'analytics'|'data';
export const TAB_PATHS:Record<WorkspaceTab,string>={map:'/map',analytics:'/analytics',data:'/data'};
export function tabForPath(path:string):WorkspaceTab{return path.startsWith('/data')?'data':path.startsWith('/analytics')||path.startsWith('/explore')?'analytics':'map';}
export type DataRequest={table:TableName;filters?:Filters;group?:{dimension:Dimension;labels:string[]};column?:{key:string;value:string};title?:string};
export type Grain='day'|'week'|'month'|'year';
const DAY=86400000;
const stamp=(date:string)=>Date.parse(date.slice(0,10)+'T00:00:00Z');
const iso=(value:number)=>new Date(value).toISOString().slice(0,10);
export function dateBounds(s:Snapshot){const dates=s.tables.fact_order_items.rows.map(r=>String(r.order_date||'').slice(0,10)).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(stamp(d))).sort();return dates.length?{from:dates[0],to:dates.at(-1)!}:null;}
export function presetDates(s:Snapshot,preset:string):Pick<Filters,'from'|'to'>{const bounds=dateBounds(s);if(!bounds||preset==='all')return {};const days=Number(preset);if(![7,30,90].includes(days))return {};return {from:iso(stamp(bounds.to)-(days-1)*DAY),to:bounds.to};}
export function periodInfo(s:Snapshot,f:Filters){const bounds=dateBounds(s);if(!bounds)return null;const from=f.from||bounds.from,to=f.to||bounds.to;if(!Number.isFinite(stamp(from))||!Number.isFinite(stamp(to))||from>to)return null;const days=Math.round((stamp(to)-stamp(from))/DAY)+1;const previous={...f,from:iso(stamp(from)-days*DAY),to:iso(stamp(from)-DAY)};return {from,to,days,previous,comparable:previous.from>=bounds.from&&previous.to<=bounds.to};}
export function metricChange(current:number|null,previous:number|null){return current==null||previous==null||previous===0?null:(current-previous)/Math.abs(previous)*100;}
function bucket(date:string,grain:Grain){if(grain==='year')return date.slice(0,4)+'-01-01';if(grain==='month')return date.slice(0,7)+'-01';if(grain==='week'){const t=stamp(date),d=new Date(t).getUTCDay();return iso(t-((d+6)%7)*DAY);}return date;}
export function salesSeries(s:Snapshot,filters:Filters,grain:Grain){
 const error=availability(s,[['fact_order_items',['net_sales','order_date']],...filterDeps(filters)]);const period=periodInfo(s,filters);
 if(error||!period)return {rows:[] as {date:string;value:number;previous:number|null}[],error,comparable:false};
 const facts=matchingFacts(s,filters),previous=period.comparable?matchingFacts(s,period.previous):[];
 const currentDays=new Map<string,number>(),previousDays=new Map<string,number>();
 for(const r of facts){const d=String(r.order_date).slice(0,10);currentDays.set(d,(currentDays.get(d)||0)+Number(r.net_sales||0));}
 for(const r of previous){const d=iso(stamp(String(r.order_date).slice(0,10))+period.days*DAY);previousDays.set(d,(previousDays.get(d)||0)+Number(r.net_sales||0));}
 const grouped=new Map<string,{date:string;value:number;previous:number|null}>();
 for(let t=stamp(period.from);t<=stamp(period.to);t+=DAY){const day=iso(t),key=bucket(day,grain),row=grouped.get(key)||{date:key,value:0,previous:period.comparable?0:null};row.value+=currentDays.get(day)||0;if(row.previous!=null)row.previous+=previousDays.get(day)||0;grouped.set(key,row);}
 return {rows:[...grouped.values()],error:undefined,comparable:period.comparable};
}
export function rowsForRequest(s:Snapshot,request:DataRequest){
 const state=s.tables[request.table];if(state.status!=='available')return {rows:[] as Row[],error:state.message||`${request.table} is ${state.status}.`};
 let rows=state.rows;
 if(request.table==='fact_order_items'){
  const err=availability(s,filterDeps(request.filters||{}));if(err)return {rows:[],error:err};
  rows=matchingFacts(s,request.filters||{});
  if(request.group&&request.group.dimension!=='none'){
   const {dimension,labels}=request.group,allowed=new Set(labels);
   if(dimension==='date'){const err=availability(s,[['fact_order_items',['order_date']]]);if(err)return {rows:[],error:err};rows=rows.filter(r=>allowed.has(String(r.order_date||'').slice(0,10)));}
   else {const d=DIMENSIONS[dimension],err=availability(s,[['fact_order_items',[d.key]],[d.table,[d.key,d.column]]]);if(err)return {rows:[],error:err};const indexes=makeIndexes(s);rows=rows.filter(r=>allowed.has(String(indexes[dimension].get(String(r[d.key]))?.[d.column]??'Unmatched / null')));}
  }
 }
 if(request.column)rows=rows.filter(r=>String(r[request.column!.key]??'')===request.column!.value);
 return {rows,error:undefined};
}
export function filterGrid(rows:Row[],search:string,column:string,value:string){const q=search.toLowerCase().trim();return rows.filter(r=>(!q||Object.values(r).some(v=>v!=null&&String(v).toLowerCase().includes(q)))&&(!column||!value||String(r[column]??'').toLowerCase().includes(value.toLowerCase())));}
export function sortGrid(rows:Row[],key:string,desc:boolean){return [...rows].sort((a,b)=>{const x=a[key],y=b[key];if(x==null)return y==null?0:1;if(y==null)return -1;return (typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y),undefined,{numeric:true}))*(desc?-1:1);});}
export function csvText(rows:Row[],columns:string[]){const escape=(v:unknown)=>'"'+String(typeof v==='string'&&/^[=+\-@\t\r]/.test(v)?"'"+v:v??'').replaceAll('"','""')+'"';return '\uFEFF'+[columns.map(escape).join(','),...rows.map(r=>columns.map(c=>escape(r[c])).join(','))].join('\r\n');}
export function downloadCSV(rows:Row[],columns:string[],filename:string){const url=URL.createObjectURL(new Blob([csvText(rows,columns)],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export const TABLE_LABELS:Record<TableName,string>={fact_order_items:'Order items',dim_customer:'Customers',dim_product:'Products',dim_seller:'Stores',dim_payment:'Payments',dim_shipping:'Shipping'};
export const FOREIGN_TABLES:Record<string,TableName>={customer_id:'dim_customer',product_id:'dim_product',seller_id:'dim_seller',payment_id:'dim_payment',shipping_id:'dim_shipping'};
export function columnType(column:string){return column==='order_date'?'date':column.endsWith('_id')||column==='quantity'?'int8':['unit_price','discount_amount','shipping_fee','gross_sales','net_sales','total_paid'].includes(column)?'numeric':'text';}
