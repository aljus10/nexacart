import {PLACES,PLACE_SIZE,placePoint,loadingPoint,getPlace,toWorld,flowAt,type Journey,type Place} from './map-data';
export type Point=[number,number];
export type Rect={left:number;right:number;top:number;bottom:number};
export const ROUTE_CLEARANCE=.60;
export function buildingRect(place:Place,padding=0):Rect{const [x,z]=placePoint(place),[w,d]=PLACE_SIZE[place.kind];return {left:x-w/2-padding,right:x+w/2+padding,top:z-d/2-padding,bottom:z+d/2+padding};}
export const inside=(p:Point,b:Rect)=>p[0]>b.left+1e-7&&p[0]<b.right-1e-7&&p[1]>b.top+1e-7&&p[1]<b.bottom-1e-7;
// A segment may touch the expanded boundary, but never enter its interior.
function crosses(a:Point,b:Point,r:Rect){
 let low=0,high=1;
 for(const [start,end,min,max] of [[a[0],b[0],r.left+1e-6,r.right-1e-6],[a[1],b[1],r.top+1e-6,r.bottom-1e-6]]){
  const delta=end-start;if(Math.abs(delta)<1e-10){if(start<min||start>max)return false;continue;}
  const u=(min-start)/delta,v=(max-start)/delta;low=Math.max(low,Math.min(u,v));high=Math.min(high,Math.max(u,v));if(low>high)return false;
 }
 return low<=high;
}
const distance=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export function clearPath(from:Point,to:Point,obstacles:Rect[]):Point[]{
 const visible=(a:Point,b:Point)=>!obstacles.some(r=>crosses(a,b,r));
 if(visible(from,to))return [from,to];
 const corners=obstacles.flatMap(r=>[[r.left,r.top],[r.right,r.top],[r.right,r.bottom],[r.left,r.bottom]] as Point[]).filter(p=>!obstacles.some(r=>inside(p,r)));
 const nodes=[from,to,...corners],cost=nodes.map(()=>Infinity),previous=nodes.map(()=>-1),done=new Set<number>();cost[0]=0;
 while(done.size<nodes.length){let current=-1;for(let i=0;i<nodes.length;i++)if(!done.has(i)&&(current<0||cost[i]<cost[current]))current=i;
  if(current<0||!Number.isFinite(cost[current]))break;if(current===1)break;done.add(current);
  for(let i=0;i<nodes.length;i++){if(done.has(i)||i===current||!visible(nodes[current],nodes[i]))continue;const next=cost[current]+distance(nodes[current],nodes[i]);if(next<cost[i]){cost[i]=next;previous[i]=current;}}
 }
 if(!Number.isFinite(cost[1]))throw new Error('The delivery loading lane is blocked.');
 const path:Point[]=[];for(let i=1;i>=0;i=previous[i]){path.unshift(nodes[i]);if(i===0)break;}return path;
}
export const paths=new Map<string,Point[]>();
export function routePoints(j:Journey,leg:'first'|'last'):Point[]{
 const key=j.id+leg,cached=paths.get(key);if(cached)return cached;
 const from=loadingPoint(getPlace(leg==='first'?j.source:j.hub)),to=loadingPoint(getPlace(leg==='first'?j.hub:j.destination));
 const obstacles=PLACES.map(p=>buildingRect(p,ROUTE_CLEARANCE));
 const guides=distance(from,to)<3?[]:(leg==='first'?j.firstRoute:j.lastRoute).slice(1,-1).map(toWorld).filter(p=>distance(p,from)>1&&distance(p,to)>1&&!obstacles.some(r=>inside(p,r)));
 const stops=[from,...guides,to],result:Point[]=[from];
 for(let i=1;i<stops.length;i++)result.push(...clearPath(stops[i-1],stops[i],obstacles).slice(1));
 const clean=result.filter((p,i)=>!i||distance(p,result[i-1])>1e-5);paths.set(key,clean);return clean;
}
export function playbackFrame(j:Journey){const points=[...routePoints(j,'first'),...routePoints(j,'last'),...[j.source,j.hub,j.destination].map(id=>placePoint(getPlace(id)))],xs=points.map(p=>p[0]),zs=points.map(p=>p[1]);const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);return {center:[(minX+maxX)/2,(minZ+maxZ)/2] as Point,height:Math.max(4.8,maxZ-minZ+2.5,(maxX-minX+2.5)/1.1)};}
export const travelEase=(t:number)=>{const p=Math.max(0,Math.min(1,t));return p*p*(3-2*p);};
export function playbackPose(seconds:number){const flow=flowAt(seconds);return {...flow,firstTravel:travelEase(flow.firstProgress),lastTravel:travelEase(flow.lastProgress),vehicle:flow.stageIndex<2?'first':flow.stageIndex===3?'last':null,handoff:travelEase(Math.max(0,Math.min(1,flow.time-54)))};}
export type LabelCandidate={id:string;x:number;y:number;width:number;height:number;priority:number;visible:boolean};
const overlaps=(a:Rect,b:Rect)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
export function arrangeLabels(candidates:LabelCandidate[],width:number,height:number,blockers:Rect[]=[]){
 const occupied=[...blockers];return [...candidates].sort((a,b)=>b.priority-a.priority).map(c=>{
  if(!c.visible)return c;
  for(const [dx,dy] of [[0,0],[0,-34],[-c.width*.55,-18],[c.width*.55,-18],[0,34]]){
   const x=c.x+dx,y=c.y+dy,rect={left:x-c.width/2-5,right:x+c.width/2+5,top:y-c.height-4,bottom:y+4};
   if(rect.left<12||rect.right>width-12||rect.top<12||rect.bottom>height-12||occupied.some(b=>overlaps(rect,b)))continue;
   occupied.push(rect);return {...c,x,y};
  }
  return {...c,visible:false};
 });
}
