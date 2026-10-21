'use client';
import {useState,useRef,useEffect} from 'react';
import {Sparkles,X,ArrowUp,Copy,Check,Code2,Table2,ChevronRight,ShieldCheck,TriangleAlert,LoaderCircle,ChartNoAxesColumn} from 'lucide-react';
import {questionExamples,formatMoney,formatNumber,METRICS,type Snapshot,type Filters,type TableName,type QueryResult} from '@/lib/nexacart/engine';
type Answer=QueryResult&{planner:string;question:string;scope:string};
export default function QueryPanel({snapshot,filters,hidden,onClose}:{snapshot:Snapshot;filters:Filters;hidden:TableName[];onClose:()=>void}){
 const [question,setQuestion]=useState(''),[answer,setAnswer]=useState<Answer|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[tab,setTab]=useState('result'),[copied,setCopied]=useState(false),[offline,setOffline]=useState(false);
 const panel=useRef<HTMLElement>(null);
 const input=useRef<HTMLTextAreaElement>(null),controller=useRef<AbortController|null>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;input.current?.focus();const trap=(e:KeyboardEvent)=>{if(e.key!=='Tab')return;const nodes=panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input,textarea');if(!nodes?.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}};document.addEventListener('keydown',trap);return()=>{controller.current?.abort();document.removeEventListener('keydown',trap);previous?.focus();};},[]);
 const submit=async(q=question)=>{
  if(loading||q.trim().length<3)return;
  const scope=JSON.stringify({filters,hidden,source:snapshot.source,fetchedAt:snapshot.fetchedAt});
  setQuestion(q);setLoading(true);setError('');setAnswer(null);setTab('result');
  controller.current=new AbortController();
  try{
   const res=await fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,filters,hidden,offline}),signal:controller.current.signal});
   const data=await res.json() as (QueryResult&{planner:string;error?:string});
   if(!res.ok||!data.plan)throw new Error(data.error||'The question could not be answered.');
   setAnswer({...data,question:q,scope});
  }catch(err){if(err instanceof Error&&err.name!=='AbortError')setError(err.message);}finally{setLoading(false);}
 };
 const stale=answer&&answer.scope!==JSON.stringify({filters,hidden,source:snapshot.source,fetchedAt:snapshot.fetchedAt});
 const money=answer?METRICS[answer.plan.metric].money:false;
 const fmt=(v:number|null)=>money?formatMoney(v):formatNumber(v);
 const copy=async()=>{if(!answer)return;try{await navigator.clipboard.writeText(answer.sql+(answer.parameters.length?'\n-- Parameters: '+JSON.stringify(answer.parameters):''));setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{setError('Copy is unavailable in this browser. Select the SQL text to copy it.');}};
 return <div className="drawer-backdrop" onClick={onClose}><section ref={panel} className="query-drawer" role="dialog" aria-modal="true" aria-labelledby="ask-title" onClick={e=>e.stopPropagation()}>
  <header className="drawer-header"><div className="ask-icon"><Sparkles size={21}/></div><div><h2 id="ask-title">Ask NexaCart</h2><p>Your data. In your own words.</p></div><button className="icon-button close-button" aria-label="Close query assistant" onClick={onClose}><X size={20}/></button></header>
  <div className="query-content">
   <div className="query-badge"><span className="status-dot"/>{snapshot.geminiConfigured&&!offline?'Gemini connected':'Offline question mode'}<span>·</span>{snapshot.source==='demo'?'Sample data':'Supabase data'}</div>
   {snapshot.geminiConfigured&&<label className="offline-option"><input type="checkbox" checked={offline} onChange={e=>setOffline(e.target.checked)}/>Use the offline parser for this question</label>}
   <h3>What would you like<br/>to discover?</h3>
   <p className="query-intro">Explore sales, find your leading sellers, or compare payment methods. Every answer comes with the query behind it.</p>
   <div className="question-box"><textarea ref={input} aria-label="Your commerce question" maxLength={600} placeholder="Which 5 sellers have the highest net sales?" value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit();}}}/><div><span>{question.length}/600</span><button aria-label="Run question" disabled={loading||question.trim().length<3} onClick={()=>submit()}>{loading?<LoaderCircle className="spin" size={18}/>:<ArrowUp size={18}/>}</button></div></div>
   <p className="scope-note">Uses your current dashboard filters. {hidden.length>0?`${hidden.length} table${hidden.length>1?'s':''} hidden in the Finals lab.`:''}</p>
   {!answer&&!loading&&!error&&<div className="suggested-questions"><span className="eyebrow">A FEW PLACES TO START</span>{questionExamples.slice(0,4).map(q=><button key={q} onClick={()=>submit(q)}><span>{q}</span><ChevronRight size={15}/></button>)}</div>}
   {loading&&<div className="query-loading"><LoaderCircle className="spin" size={22}/><strong>Checking your schema and data…</strong><p>{snapshot.geminiConfigured&&!offline?'Gemini is building a validated query plan.':'Preparing a supported read-only query.'}</p></div>}
   {error&&<div className="inline-error" role="alert"><TriangleAlert size={18}/><div><strong>Let’s refine that question</strong><p>{error}</p></div></div>}
   {answer&&<div className="answer-block">
    {stale&&<div className="alert small"><TriangleAlert size={15}/>Data, filters, or table availability changed. Run the question again to refresh this answer.</div>}
    <div className="answer-top"><span className="eyebrow">{answer.planner} · {answer.source==='demo'?'SAMPLE RESULT':'DATABASE RESULT'}</span>{!answer.error&&<span className="verified"><ShieldCheck size={13}/>Verified data</span>}</div>
    <h4>{answer.plan.title||`${METRICS[answer.plan.metric].label}${answer.plan.dimension==='none'?'':` by ${answer.plan.dimension}`}`}</h4>
    {answer.error?<div className="inline-error"><TriangleAlert size={18}/><p>{answer.error}</p></div>:answer.rows.length===0?<div className="empty-state">No records match this question’s filters.</div>:<p className="answer-summary">{answer.plan.dimension==='none'?<>The result is <strong>{fmt(answer.rows[0].value)}</strong>.</>:answer.plan.dimension==='date'?<>Showing {answer.rows.length} dates in chronological order.</>:<><strong>{answer.rows[0].label}</strong> {answer.plan.direction==='asc'?'has the lowest result':'leads this result'} with <strong>{fmt(answer.rows[0].value)}</strong>.</>} {answer.source==='demo'?'This is illustrative sample data.':''}</p>}
    <div className="answer-tabs"><button className={tab==='result'?'active':''} onClick={()=>setTab('result')}><Table2 size={14}/>Results</button><button className={tab==='chart'?'active':''} onClick={()=>setTab('chart')} disabled={!!answer.error}><ChartNoAxesColumn size={14}/>Chart</button><button className={tab==='sql'?'active':''} onClick={()=>setTab('sql')}><Code2 size={15}/>SQL</button></div>
    {tab==='result'&&!answer.error&&<div className="answer-table"><table><thead><tr><th>{answer.plan.dimension==='none'?'Scope':answer.plan.dimension}</th><th>{METRICS[answer.plan.metric].label}</th></tr></thead><tbody>{answer.rows.map((r,i)=><tr key={i}><td>{r.label}</td><td>{fmt(r.value)}</td></tr>)}</tbody></table></div>}
    {tab==='chart'&&!answer.error&&<div className="query-chart">{answer.rows.map((r,i)=><div key={i}><div><span>{r.label}</span><strong>{fmt(r.value)}</strong></div><div className="bar-track"><i style={{width:`${Math.max(0,(r.value||0)/Math.max(1,...answer.rows.map(v=>v.value||0))*100)}%`}}/></div></div>)}</div>}
    {tab==='sql'&&<div className="sql-preview"><div><span>Validated SELECT · PostgreSQL</span><button onClick={copy}>{copied?<Check size={14}/>:<Copy size={14}/>} {copied?'Copied':'Copy'}</button></div><pre>{answer.sql}</pre>{answer.parameters.length>0&&<p>Parameters: {JSON.stringify(answer.parameters)}</p>}<small>{answer.source==='demo'?'Equivalent SQL. Sample data is evaluated locally on the server.':'The database executes the same validated plan through nexacart_query.'}</small></div>}
    <p className="scope-note">Result limit: {answer.plan.limit}. Orders use distinct order numbers; net sales use the stored net_sales column.</p>
   </div>}
  </div>
  <footer className="query-footer"><ShieldCheck size={14}/><span>Read-only queries. API keys stay on the server.</span></footer>
 </section></div>;
}
