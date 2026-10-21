'use client';
import {useEffect,useRef,useState,useMemo} from 'react';
import {PLACES,JOURNEYS,REGIONS,getPlace,placePoint,toWorld,type MapState,type GeoLand,type Geo} from '@/lib/nexacart/map-data';
import {Truck,Bike,Car,Ship,Package,Check} from 'lucide-react';
import {routePoints,playbackFrame,playbackPose} from '@/lib/nexacart/map-playback';
import type {Projected} from './map-renderer';
export type ViewportAPI={read:()=>MapState;onPlace:(id:string)=>void;onVehicle:(id:string)=>void;onStopJump?:(stageIndex:number)=>void;onManual:()=>void};
function interpolate(points:number[][],t:number){const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));let remaining=t*lengths.reduce((a,b)=>a+b,0);for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]||i===lengths.length-1){const a=points[i],b=points[i+1],f=lengths[i]?remaining/lengths[i]:0;return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];}remaining-=lengths[i];}return points[0];}
function MapFallback({land,state,onPlace}:{land:GeoLand;state:MapState;onPlace:(id:string)=>void}){
 const [zoom,setZoom]=useState(1),previousZoom=useRef(state.zoomRequest);
 useEffect(()=>{const delta=state.zoomRequest-previousZoom.current;previousZoom.current=state.zoomRequest;setZoom(v=>Math.max(.5,Math.min(8,v*Math.pow(1.25,delta))));},[state.zoomRequest]);
 useEffect(()=>setZoom(1),[state.region,state.selectedPlace,state.focusRequest,state.journeyFocus,state.journeyId]);
 const journey=JOURNEYS.find(j=>j.id===state.journeyId)!,flow=playbackPose(state.time),first=routePoints(journey,'first'),last=routePoints(journey,'last');
 const moving=flow.vehicle==='first'?interpolate(first,flow.firstTravel):flow.vehicle==='last'?interpolate(last,flow.lastTravel):flow.delivered?last.at(-1)!:first.at(-1)!;
 const region=REGIONS.find(r=>r.id===state.region)||REGIONS[0],routeFrame=state.journeyFocus?playbackFrame(journey):null;
 const p=state.follow?moving:state.selectedPlace&&state.focusRequest>0?placePoint(getPlace(state.selectedPlace)):routeFrame?.center||toWorld(region.center),height=(state.follow?5.8:state.selectedPlace&&state.focusRequest>0?4:routeFrame?.height||region.height)/zoom,w=height*1.6;
 const shape=(ring:Geo[])=>ring.map((g,i)=>{const p=toWorld(g);return `${i?'L':'M'}${p[0]},${p[1]}`;}).join(' ')+'Z';
 const landPaths=useMemo(()=>land.polygons.map(poly=>poly.map(shape).join(' ')),[land]);
 const svg=useRef<SVGSVGElement>(null),view=useRef([p[0],p[1],w,height]),target=useRef(view.current);target.current=[p[0],p[1],w,height];
 useEffect(()=>{let frame=0,previous=0;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const tick=(now:number)=>{const dt=Math.min(.06,(now-previous)/1000||.016);previous=now;const alpha=reduced?1:1-Math.exp(-dt*5);view.current=view.current.map((v,i)=>v+(target.current[i]-v)*alpha);const [x,z,width,height]=view.current;svg.current?.setAttribute('viewBox',`${x-width/2} ${z-height/2} ${width} ${height}`);frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[]);
 const Vehicle=flow.vehicle?{van:Truck,car:Car,motorcycle:Bike,ferry:Ship}[flow.vehicle==='first'?journey.firstMode:journey.lastMode]:flow.delivered?Check:Package;

 return <svg ref={svg} className="ph-fallback-svg" viewBox={`${view.current[0]-view.current[2]/2} ${view.current[1]-view.current[3]/2} ${view.current[2]} ${view.current[3]}`} aria-label="Philippines map fallback">
  <defs><filter id="landDrop"><feDropShadow dx="0" dy=".11" stdDeviation=".05" floodColor="#4a627c" floodOpacity=".13"/></filter></defs>
  <g fill="#f8fafb" stroke="#c9d4df" strokeWidth=".012" filter="url(#landDrop)">{landPaths.map((path,i)=><path key={i} d={path} fillRule="evenodd"/>)}</g>
  {state.routes&&JOURNEYS.filter(j=>!state.journeyFocus||j.id===journey.id).map(j=><g key={j.id} fill="none" stroke="#a8b9c8" strokeWidth={j.id===journey.id?.025:.018} strokeDasharray=".09 .07" opacity={j.id===journey.id?.8:.2}>{(['first','last'] as const).map(leg=><polyline key={leg} points={routePoints(j,leg).map(p=>p.join(',')).join(' ')}/>)}</g>)}
  {state.routes&&(['first','last'] as const).map(leg=><polyline key={leg} fill="none" stroke={journey.color} strokeWidth=".055" strokeLinecap="round" pathLength="1" strokeDasharray={`${leg==='first'?flow.firstTravel:flow.lastTravel} 1`} points={routePoints(journey,leg).map(p=>p.join(',')).join(' ')}/>)}

  {PLACES.filter(place=>!state.journeyFocus||[journey.source,journey.hub,journey.destination].includes(place.id)).map(place=>{const [x,z]=placePoint(place),[gx,gz]=toWorld(place.geo);return <g key={place.id} opacity=".55"><line x1={gx} y1={gz} x2={x} y2={z} stroke="#a2b5c7" strokeWidth=".014" strokeDasharray=".05 .05"/><circle cx={gx} cy={gz} r=".035" fill="#91a5b6"/></g>;})}
  {PLACES.filter(place=>!state.journeyFocus||[journey.source,journey.hub,journey.destination].includes(place.id)||place.id===state.selectedPlace).map(place=>{const [x,z]=placePoint(place);const selected=place.id===state.selectedPlace;return <g key={place.id} transform={`translate(${x} ${z})`} role="button" tabIndex={0} aria-label={place.name} onClick={()=>onPlace(place.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onPlace(place.id);}}} className="ph-fallback-place"><circle r={selected?.24:.18} fill={place.kind==='hq'?'#233a50':place.kind==='shop'?'#e38465':place.kind==='hub'?'#7a96b3':'#91ada1'} stroke="#fff" strokeWidth=".045"/>{place.kind==='hq'&&<text y=".08" textAnchor="middle" fill="white" fontSize=".21" fontWeight="700">N</text>}{state.labels&&(!state.journeyFocus||[journey.source,journey.hub,journey.destination].includes(place.id))&&<text x=".25" y=".035" fontSize=".16" fill="#566e84" stroke="#eef3f8" strokeWidth=".03" paintOrder="stroke">{place.kind==='hq'?'Polangui · NexaCart HQ':place.city}</text>}</g>;})}
  <g transform={`translate(${moving[0]} ${moving[1]})`} aria-label={`${flow.stage.label}, ${Math.round(flow.stageProgress*100)} percent of stage`}><circle r=".32" fill={journey.color} opacity=".13"/><circle r=".205" fill={flow.delivered?'#7fa591':journey.color} stroke="white" strokeWidth=".035"/><Vehicle x={-.13} y={-.13} width={.26} height={.26} color="white" strokeWidth={1.8}/></g>

 </svg>;
}
export default function MapViewport({api,state}:{api:ViewportAPI;state:MapState}){
 const host=useRef<HTMLDivElement>(null),labels=useRef(new Map<string,HTMLButtonElement>()),labelSizes=useRef(new Map<string, {width:number;height:number}>()),latest=useRef(api);latest.current=api;
 const [land,setLand]=useState<GeoLand|null>(null),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[error,setError]=useState('');
 const updateLabelSizes=()=>{for(const [id,node] of labels.current){if(node){labelSizes.current.set(id,{width:node.offsetWidth||145,height:node.offsetHeight||28});}}};
 useEffect(()=>{
  updateLabelSizes();
  window.addEventListener('resize',updateLabelSizes);
  return()=>window.removeEventListener('resize',updateLabelSizes);
 },[ready]);
 useEffect(()=>{
  let cancelled=false,dispose:(()=>void)|undefined;const controller=new AbortController();
  fetch('/philippines-land.json',{signal:controller.signal}).then(res=>{if(!res.ok)throw new Error('The map geometry could not be loaded.');return res.json();}).then(async data=>{
   if(cancelled)return;const geo=data as GeoLand;if(!Array.isArray(geo.polygons))throw new Error('Invalid coastline data.');setLand(geo);
   const {mountPhilippinesMap}=await import('./map-renderer');if(cancelled||!host.current)return;
   try{dispose=mountPhilippinesMap(host.current,geo,{getState:()=>latest.current.read(),onReady:()=>{if(!cancelled){updateLabelSizes();setReady(true);}},onFailure:()=>{if(!cancelled){setReady(false);setFailed(true);}},onPlace:id=>latest.current.onPlace(id),onVehicle:id=>latest.current.onVehicle(id),onStopJump:stageIndex=>latest.current.onStopJump?.(stageIndex),onManual:()=>latest.current.onManual(),labelSize:id=>labelSizes.current.get(id)||{width:145,height:28},overlays:()=>{const viewport=host.current?.parentElement,app=viewport?.parentElement;if(!viewport||!app)return [];const origin=viewport.getBoundingClientRect();return Array.from(app.querySelectorAll<HTMLElement>('.ph-intro,.ph-directory,.ph-info,.ph-regions,.ph-player,.ph-delivery-progress,.ph-map-tools')).filter(n=>n.getClientRects().length>0).map(n=>{const r=n.getBoundingClientRect();return {left:r.left-origin.left-8,right:r.right-origin.left+8,top:r.top-origin.top-8,bottom:r.bottom-origin.top+8};});},onProject:(projected:Projected[])=>{for(const p of projected){const node=labels.current.get(p.id);if(node){node.style.transform=`translate(${p.x}px,${p.y}px) translate(-50%,-100%)`;node.style.visibility=p.visible?'visible':'hidden';node.tabIndex=p.visible?0:-1;}}}});}catch{if(!cancelled)setFailed(true);}
  }).catch(err=>{if(!cancelled&&err?.name!=='AbortError')setError('The Philippines map could not load. Refresh the page to retry.');});
  return()=>{cancelled=true;controller.abort();dispose?.();};
 },[]);
 return <div className={`ph-viewport ${ready?'is-ready':''}`}>
  <div className="ph-fallback">{land&&!ready&&<MapFallback land={land} state={state} onPlace={api.onPlace}/>}</div>
  <div className="ph-webgl" ref={host}/>
  <div className="ph-place-labels" aria-hidden={!ready}>{PLACES.map(place=><button key={place.id} ref={node=>{if(node)labels.current.set(place.id,node);else labels.current.delete(place.id);}} data-map-label={place.id} className={`ph-place-label ${place.kind} ${state.selectedPlace===place.id?'selected':''}`} onClick={()=>api.onPlace(place.id)} title={`${place.name} · ${place.city}`} tabIndex={-1}><span className="ph-label-dot"/><span>{place.kind==='hq'?'NexaCart · Polangui':place.kind==='shop'?place.sellerIds?.length===1?place.name:`${place.city} shops`:place.name.replace(' neighborhood','').replace(' sorting hub',' hub').replace(' transfer hub',' hub')}</span>{place.sellerIds&&place.sellerIds.length>1&&<b>{place.sellerIds.length}</b>}</button>)}</div>
  {(!land||error)&&<div className="ph-geometry-status" role="status">{error||'Preparing the islands…'}</div>}
  {failed&&<div className="ph-fallback-note">3D is unavailable on this device. Delivery playback is available in 2D.</div>}
 </div>;
}
