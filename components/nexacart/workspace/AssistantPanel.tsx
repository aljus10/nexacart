'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUp,ArrowUpRight,Sparkles,ChevronRight,LoaderCircle,TriangleAlert,Check,Copy,Code2,Table2,ChartNoAxesColumn,Maximize,Minimize} from 'lucide-react';
import {formatMoney,formatNumber,METRICS,type Snapshot,type Filters,type TableName,type QueryResult} from '@/lib/nexacart/engine';
import type {DataRequest} from '@/lib/nexacart/workspace-data';
import {Dialog,EmptyState} from './ui';
type Answer=QueryResult&{planner:string;question:string;scope:string;explanation?:string};
const suggestions=['Identify anomalies in sales over time','Which 10 stores have the highest net sales?','Show net sales by category'];
function AssistantGlyph({state = 'idle'}: {state?: 'idle' | 'listening' | 'thinking'}){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const stateRef=useRef(state);
 stateRef.current=state;

 useEffect(()=>{
  const canvas=canvasRef.current;
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  if(!ctx)return;

  let frameId=0;
  let running=true;
  let smoothPulse=0;

  const resize=()=>{
   if(!canvas)return;
   const dpr=typeof window!=='undefined'?Math.min(window.devicePixelRatio||1,2):1;
   const w=Math.round(canvas.clientWidth||300);
   const h=Math.round(canvas.clientHeight||180);
   if(canvas.width!==w*dpr||canvas.height!==h*dpr){
    canvas.width=w*dpr;
    canvas.height=h*dpr;
   }
  };
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;
  ro?.observe(canvas);
  resize();

  const render=(now:number)=>{
   if(!running)return;
   const t=(now||performance.now())*0.001;
   const currentState=stateRef.current;
   const targetPulse=currentState==='thinking'?0.45:currentState==='listening'?0.22:0;
   smoothPulse+=(targetPulse-smoothPulse)*0.1;

   const dpr=typeof window!=='undefined'?Math.min(window.devicePixelRatio||1,2):1;
   const width=canvas.width/dpr||300;
   const height=canvas.height/dpr||180;

   ctx.save();
   ctx.setTransform(dpr*(width/300),0,0,dpr*(height/180),0,0);
   ctx.clearRect(0,0,300,180);

   const rotSpeed=currentState==='thinking'?2.2:currentState==='listening'?1.5:0.95;
   const waveSpeed=currentState==='thinking'?6.0:currentState==='listening'?4.6:3.4;
   const waveYSpeed=currentState==='thinking'?6.5:currentState==='listening'?5.0:3.8;

   const floatY=Math.sin(t*2.2)*5;
   const centerY=87+floatY;
   const breath=1+Math.sin(t*2.4)*0.04;

   const gradAngle=t*0.9;
   const gx1=150-Math.cos(gradAngle)*110;
   const gy1=87-Math.sin(gradAngle)*60;
   const gx2=150+Math.cos(gradAngle)*110;
   const gy2=87+Math.sin(gradAngle)*60;
   const gradient=ctx.createLinearGradient(gx1,gy1,gx2,gy2);
   gradient.addColorStop(0,'#10b981');
   gradient.addColorStop(0.48,'#0ea5e9');
   gradient.addColorStop(1,'#8b5cf6');

   ctx.strokeStyle=gradient;
   ctx.lineWidth=0.95;
   ctx.globalAlpha=0.9;

   for(let ring=0;ring<33;ring++){
    const lat=-1.35+(ring/32)*2.7;
    ctx.beginPath();
    for(let n=0;n<=100;n++){
     const a=(n/100)*Math.PI*2;
     const waveMod=Math.cos(a*3+lat*2-t*waveSpeed);
     const r=66*breath*Math.cos(lat)*(1+(0.16+smoothPulse*0.06)*waveMod);
     const x=r*Math.cos(a);
     const y=64*breath*Math.sin(lat);
     const z=r*Math.sin(a);

     const twist=lat*0.65+t*rotSpeed;
     const xx=x*Math.cos(twist)-z*Math.sin(twist);
     const zz=x*Math.sin(twist)+z*Math.cos(twist);

     const waveY=Math.sin(a*3+lat*1.5-t*waveYSpeed)*(10+smoothPulse*5);
     const px=150+xx;
     const py=centerY+y*0.8+zz*0.35+waveY;

     if(n===0)ctx.moveTo(px,py);
     else ctx.lineTo(px,py);
    }
    ctx.stroke();
   }

   ctx.restore();
   frameId=requestAnimationFrame(render);
  };

  const handleVisibility=()=>{
   if(document.hidden){
    cancelAnimationFrame(frameId);
   }else{
    cancelAnimationFrame(frameId);
    frameId=requestAnimationFrame(render);
   }
  };
  document.addEventListener('visibilitychange',handleVisibility);

  frameId=requestAnimationFrame(render);

  return()=>{
   running=false;
   cancelAnimationFrame(frameId);
   ro?.disconnect();
   document.removeEventListener('visibilitychange',handleVisibility);
  };
 },[]);

 return (
  <div className={`nx-ai-glyph-wrap ${state}`}>
   <div className="nx-ai-aura" aria-hidden="true"/>
   <canvas ref={canvasRef} className="nx-ai-glyph" aria-hidden="true"/>
  </div>
 );
}
export default function AssistantPanel({snapshot,filters,hidden,onRows}:{snapshot:Snapshot;filters:Filters;hidden:TableName[];onRows:(r:DataRequest)=>void}){
 const [question,setQuestion]=useState(''),[answer,setAnswer]=useState<Answer|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[expanded,setExpanded]=useState(false),[resultTab,setResultTab]=useState<'chart'|'table'|'sql'>('chart'),[copied,setCopied]=useState(false),[offline,setOffline]=useState(false);
 const [focused,setFocused]=useState(false);
 const [isFullscreen,setIsFullscreen]=useState(false);
 const controller=useRef<AbortController|null>(null);
 useEffect(()=>()=>controller.current?.abort(),[]);
 useEffect(()=>{
  const handler=()=>{
   setIsFullscreen(!!(document.fullscreenElement||(document as unknown as {webkitFullscreenElement?:Element}).webkitFullscreenElement));
  };
  document.addEventListener('fullscreenchange',handler);
  document.addEventListener('webkitfullscreenchange',handler);
  return()=>{
   document.removeEventListener('fullscreenchange',handler);
   document.removeEventListener('webkitfullscreenchange',handler);
  };
 },[]);
 const toggleFullscreen=async()=>{
  try{
   if(!document.fullscreenElement&&!(document as unknown as {webkitFullscreenElement?:Element}).webkitFullscreenElement){
    if(document.documentElement.requestFullscreen){
     await document.documentElement.requestFullscreen();
    }else if((document.documentElement as unknown as {webkitRequestFullscreen?:()=>Promise<void>}).webkitRequestFullscreen){
     await (document.documentElement as unknown as {webkitRequestFullscreen:()=>Promise<void>}).webkitRequestFullscreen();
    }
   }else{
    if(document.exitFullscreen){
     await document.exitFullscreen();
    }else if((document as unknown as {webkitExitFullscreen?:()=>Promise<void>}).webkitExitFullscreen){
     await (document as unknown as {webkitExitFullscreen:()=>Promise<void>}).webkitExitFullscreen();
    }
   }
  }catch{
   // Ignore fullscreen errors
  }
 };
 const scope=JSON.stringify({filters,hidden,source:snapshot.source,fetchedAt:snapshot.fetchedAt}),stale=!!answer&&answer.scope!==scope;
 const submit=async(q=question)=>{if(loading||q.trim().length<2)return;setQuestion(q);setLoading(true);setError('');setAnswer(null);controller.current?.abort();controller.current=new AbortController();try{const res=await fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,filters,hidden,offline}),signal:controller.current.signal});const data=await res.json() as QueryResult&{planner:string;error?:string};if(!res.ok||!data.plan)throw new Error(data.error||'This question could not be answered.');setAnswer({...data,question:q,scope});setResultTab(data.plan.dimension==='none'?'table':'chart');}catch(err){if(err instanceof Error&&err.name!=='AbortError')setError(err.message);}finally{setLoading(false);}};
 const fmt=(value:number|null)=>answer&&METRICS[answer.plan.metric].money?formatMoney(value):formatNumber(value);
 const rows=()=>{if(!answer)return;setExpanded(false);onRows({table:'fact_order_items',filters:answer.plan.filters,group:{dimension:answer.plan.dimension,labels:answer.rows.map(r=>r.label)},title:answer.plan.title||'AI query result'});};
 const copy=async()=>{if(!answer)return;try{await navigator.clipboard.writeText(answer.sql+(answer.parameters.length?'\n-- Parameters: '+JSON.stringify(answer.parameters):''));setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{setError('Copy is unavailable. You can select the SQL text in the expanded result.');}};
 const title=answer?.plan.title||'Your result';
 const summary=answer&&!answer.error&&answer.rows.length?answer.plan.threshold?<>Showing <strong>{answer.rows.length}</strong> {answer.plan.dimension==='none'?'results':answer.plan.dimension+'s'} meeting the threshold criteria.</>:answer.plan.dimension==='none'?<>The result is <strong>{fmt(answer.rows[0].value)}</strong>.</>:answer.plan.dimension==='date'?<>Showing <strong>{answer.rows.length}</strong> dates in chronological order.</>:<><strong>{answer.rows[0].label}</strong> {answer.plan.direction==='asc'?'has the lowest result at':'leads with'} <strong>{fmt(answer.rows[0].value)}</strong>.</>:null;
 const isListening=focused||question.trim().length>0;
 const aiState=loading?'thinking':isListening?'listening':'idle';
 const isConversational=!!answer&&(answer.plan.mode==='conversational'||(!answer.rows.length&&!!answer.explanation));
 return <>
 <section className="nx-ai nx-card"><div className="nx-ai-top"><h2><Sparkles size={15}/>Ask NexaCart</h2><span>{snapshot.geminiConfigured&&!offline?'Gemini':'Built-in'}</span></div>
  {!answer&&!loading&&!error?<><AssistantGlyph state={aiState}/><div className="nx-ai-intro"><span className="nx-overline">A LITTLE CLARITY GOES A LONG WAY</span><h3>Find the story<br/>behind your sales.</h3></div><div className="nx-ai-suggestions">{suggestions.map(q=><button key={q} onClick={()=>submit(q)} onMouseEnter={()=>setFocused(true)} onMouseLeave={()=>setFocused(false)}><span>{q}</span><ChevronRight size={13}/></button>)}<button type="button" onClick={toggleFullscreen} onMouseEnter={()=>setFocused(true)} onMouseLeave={()=>setFocused(false)} title={isFullscreen?'Exit fullscreen mode':'Enter fullscreen mode'} aria-label={isFullscreen?'Exit fullscreen mode':'Enter fullscreen mode'}><span>{isFullscreen?<Minimize size={12} style={{display:'inline',marginRight:'6px',verticalAlign:'-1px'}}/>:<Maximize size={12} style={{display:'inline',marginRight:'6px',verticalAlign:'-1px'}}/>}{isFullscreen?'Exit fullscreen mode':'Enter fullscreen mode'}</span><ChevronRight size={13}/></button></div></>:loading?<div className="nx-ai-progress" role="status"><AssistantGlyph state="thinking"/><h3>Connecting the dots…</h3><p>Checking your data and building a validated query.</p></div>:error?<div className="nx-ai-error" role="alert"><TriangleAlert size={23}/><h3>Let’s refine that question.</h3><p>{error}</p><button onClick={()=>{setError('');setQuestion('');}}>Try a suggested question<ChevronRight size={13}/></button></div>:answer&&<div className="nx-ai-answer"><span className="nx-overline">{isConversational?'ASSISTANT':answer.source==='demo'?'SAMPLE RESULT':'DATABASE RESULT'}</span><h3>{title}</h3>{answer.error?<p className="nx-inline-error">{answer.error}</p>:isConversational?<><p style={{fontSize:'0.88rem',color:'#065f46',lineHeight:1.55,margin:'10px 0',background:'#ecfdf5',padding:'12px 14px',borderRadius:'10px',border:'1px solid #a7f3d0'}}><Sparkles size={15} style={{display:'inline',marginRight:'7px',verticalAlign:'-2px',color:'#10b981'}}/>{answer.explanation}</p><div className="nx-ai-suggestions" style={{marginTop:'12px'}}>{suggestions.map(q=><button key={q} onClick={()=>submit(q)}><span>{q}</span><ChevronRight size={13}/></button>)}<button type="button" onClick={toggleFullscreen} title={isFullscreen?'Exit fullscreen mode':'Enter fullscreen mode'} aria-label={isFullscreen?'Exit fullscreen mode':'Enter fullscreen mode'}><span>{isFullscreen?<Minimize size={12} style={{display:'inline',marginRight:'6px',verticalAlign:'-1px'}}/>:<Maximize size={12} style={{display:'inline',marginRight:'6px',verticalAlign:'-1px'}}/>}{isFullscreen?'Exit fullscreen mode':'Enter fullscreen mode'}</span><ChevronRight size={13}/></button></div></>:!answer.rows.length?<p>No records match this question.</p>:<><p>{summary}</p>{answer.explanation&&<p style={{fontSize:'0.82rem',color:'#065f46',lineHeight:1.45,margin:'8px 0',background:'#ecfdf5',padding:'8px 10px',borderRadius:'8px',border:'1px solid #a7f3d0'}}><Sparkles size={13} style={{display:'inline',marginRight:'5px',verticalAlign:'-2px',color:'#10b981'}}/>{answer.explanation}</p>}{answer.plan.dimension!=='none'&&<div className="nx-answer-mini">{answer.rows.slice(0,3).map((r,i)=><div key={i}><span>{r.label}</span><strong>{fmt(r.value)}</strong><i style={{width:`${Math.max(0,(r.value||0)/Math.max(1,...answer.rows.map(r=>Math.abs(r.value||0)))*100)}%`}}/></div>)}</div>}<button className="nx-ai-open" onClick={()=>setExpanded(true)}>Explore answer<ArrowUpRight size={15}/></button></>}{stale&&<p className="nx-stale">Data or filters changed. Run this question again to update the answer.</p>}</div>}
  <form className="nx-ai-form" onSubmit={e=>{e.preventDefault();submit();}}><textarea aria-label="Ask a commerce question" placeholder="Ask about your commerce data…" maxLength={600} rows={2} value={question} onChange={e=>setQuestion(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit();}}}/><button type="submit" aria-label="Submit question" disabled={loading||question.trim().length<2}>{loading?<LoaderCircle className="nx-spin" size={17}/>:<ArrowUp size={18}/>}</button></form><div className="nx-ai-bottom">{snapshot.geminiConfigured&&<label style={{marginLeft:'auto'}}><input type="checkbox" checked={offline} onChange={e=>setOffline(e.target.checked)}/>Built-in mode</label>}</div>
 </section>
 {expanded&&answer&&<Dialog title={title} onClose={()=>setExpanded(false)} wide><p className="nx-answer-question">“{answer.question}”</p><div className="nx-answer-source"><span className="nx-status-dot sample"/>{answer.source==='demo'?'Sample transactions':'Supabase data'}<span>·</span>{answer.planner}</div>{stale&&<div className="nx-inline-error">This answer predates the current data or filters. Close and rerun it to refresh.</div>}<p className="nx-answer-summary">{summary}</p>{answer.explanation&&<div style={{background:'#ecfdf5',border:'1px solid #a7f3d0',padding:'10px 14px',borderRadius:'10px',marginBottom:'14px',display:'flex',gap:'8px',alignItems:'flex-start',fontSize:'0.88rem',color:'#065f46'}}><Sparkles size={16} style={{flexShrink:0,marginTop:'2px',color:'#10b981'}}/><span>{answer.explanation}</span></div>}<div className="nx-result-tabs">{([{id:'chart',label:'Chart',icon:ChartNoAxesColumn},{id:'table',label:'Table',icon:Table2},{id:'sql',label:'Query details',icon:Code2}] as const).map(({id,label,icon:Icon})=><button key={id} className={resultTab===id?'active':''} onClick={()=>setResultTab(id)}><Icon size={14}/>{label}</button>)}</div>{resultTab==='chart'?<div className="nx-answer-chart">{answer.rows.map((r,i)=><div key={i}><div><span>{r.label}</span><strong>{fmt(r.value)}</strong></div><div><i style={{width:`${Math.max(0,(r.value||0)/Math.max(1,...answer.rows.map(r=>Math.abs(r.value||0)))*100)}%`}}/></div></div>)}</div>:resultTab==='table'?<div className="nx-answer-table"><table><thead><tr><th>{answer.plan.dimension==='none'?'Scope':answer.plan.dimension}</th><th>{METRICS[answer.plan.metric].label}</th></tr></thead><tbody>{answer.rows.map((r,i)=><tr key={i}><td>{r.label}</td><td>{fmt(r.value)}</td></tr>)}</tbody></table></div>:<div className="nx-sql"><button onClick={copy}>{copied?<Check size={13}/>:<Copy size={13}/>} {copied?'Copied':'Copy query'}</button><pre>{answer.sql}</pre>{answer.parameters.length>0&&<p>Parameters: {JSON.stringify(answer.parameters)}</p>}<small>{answer.source==='demo'?'Equivalent PostgreSQL; sample records are evaluated on the server.':'Executed through the restricted nexacart_query function.'}</small></div>}<div className="nx-answer-footer"><span>Limit: {answer.plan.limit} results · Read-only</span><button className="nx-button dark" onClick={rows} disabled={!!answer.error||!answer.rows.length||stale}>View underlying records<ArrowUpRight size={14}/></button></div></Dialog>}
 </>;
}
