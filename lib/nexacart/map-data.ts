import catalog from './map-catalog.json';
export const SELLERS=catalog.sellers;
export const SHIPPING=catalog.shipping;
export type Island='all'|'luzon'|'visayas'|'mindanao'|'palawan';
export type PlaceKind='shop'|'hub'|'home'|'hq';
export type Transport='van'|'motorcycle'|'car'|'ferry';
export type Geo=[number,number];
export type Place={id:string;name:string;city:string;island:Exclude<Island,'all'>;kind:PlaceKind;geo:Geo;offset?:[number,number];sellerIds?:number[];note:string};
const metroIds=SELLERS.filter(s=>!['Baguio','Legazpi City','Cebu City','Davao City'].includes(s.seller_city)).map(s=>s.seller_id);
export const PLACES:Place[]=[
 {id:'nexacart-hq',name:'NexaCart Developer HQ',city:'Polangui, Albay',island:'luzon',kind:'hq',geo:[123.4855,13.2923],offset:[-1.99,-1.12],note:'Your NexaCart development team, based in Polangui, Albay. This is a city-level marker, not a precise street address.'},
 {id:'polangui-hub',name:'Polangui delivery hub',city:'Polangui, Albay',island:'luzon',kind:'hub',geo:[123.49,13.30],offset:[-0.045,-0.010],note:'Illustrative local delivery hub for the Polangui demonstration. This is not a verified courier branch.'},
 {id:'polangui-home',name:'Polangui neighborhood',city:'Polangui, Albay',island:'luzon',kind:'home',geo:[123.483,13.31],offset:[-1.34,1.55],note:'Illustrative recipient homes for the local Polangui demonstration. No customer addresses were supplied.'},
 {id:'metro-shops',name:'Metro Manila shops',city:'Metro Manila',island:'luzon',kind:'shop',geo:[120.984,14.6],sellerIds:metroIds,note:'21 shops from Manila, Quezon City, Makati, Pasig, and Taguig. Grouped here at city level.'},
 {id:'baguio-shop',name:'Brew and Bites',city:'Baguio',island:'luzon',kind:'shop',geo:[120.596,16.412],sellerIds:[21],note:'Shop name and city from your seller CSV. Placement is at city level.'},
 {id:'legazpi-shop',name:'Snack Station PH',city:'Legazpi City',island:'luzon',kind:'shop',geo:[123.744,13.139],offset:[0.18,0.18],sellerIds:[22],note:'Shop name and city from your seller CSV. Placement is at city level.'},
 {id:'cebu-shops',name:'Cebu City shops',city:'Cebu City',island:'visayas',kind:'shop',geo:[123.885,10.315],offset:[-.32,.12],sellerIds:[8,13,18,24],note:'4 shops from your seller CSV, grouped at the Cebu City anchor.'},
 {id:'davao-shops',name:'Davao City shops',city:'Davao City',island:'mindanao',kind:'shop',geo:[125.612,7.07],sellerIds:[9,14,25],note:'3 shops from your seller CSV, grouped at the Davao City anchor.'},
 {id:'clark-hub',name:'Clark sorting hub',city:'Clark',island:'luzon',kind:'hub',geo:[120.561,15.189],offset:[-.22,0],note:'Illustrative sorting hub for playback. The shipping CSV does not contain depot addresses.'},
 {id:'cebu-hub',name:'Cebu transfer hub',city:'Cebu City',island:'visayas',kind:'hub',geo:[123.925,10.43],offset:[.64,-.15],note:'Illustrative transfer hub for playback. This is not a verified courier branch.'},
 {id:'cdo-hub',name:'Northern Mindanao hub',city:'Cagayan de Oro',island:'mindanao',kind:'hub',geo:[124.647,8.478],note:'Illustrative sorting hub for playback. This is not a verified courier branch.'},
 {id:'palawan-hub',name:'Palawan transfer hub',city:'Puerto Princesa',island:'palawan',kind:'hub',geo:[118.738,9.739],note:'Illustrative sea-transfer hub. The source CSV has no hub locations.'},
 {id:'baguio-home',name:'Baguio neighborhood',city:'Baguio',island:'luzon',kind:'home',geo:[120.616,16.395],offset:[.66,-.02],note:'Illustrative recipient neighborhood. No customer addresses were supplied.'},
 {id:'bogo-home',name:'North Cebu neighborhood',city:'Bogo',island:'visayas',kind:'home',geo:[124.006,11.051],offset:[.25,-.1],note:'Illustrative recipient neighborhood for the last-mile demonstration.'},
 {id:'butuan-home',name:'Butuan neighborhood',city:'Butuan',island:'mindanao',kind:'home',geo:[125.529,8.947],note:'Illustrative recipient neighborhood. No customer addresses were supplied.'},
 {id:'roxas-home',name:'Roxas neighborhood',city:'Roxas, Palawan',island:'palawan',kind:'home',geo:[119.35,10.32],offset:[-.05,-.08],note:'Illustrative recipient neighborhood for a Palawan delivery.'},
];
export type Journey={id:string;name:string;subtitle:string;island:Exclude<Island,'all'>;source:string;hub:string;destination:string;sellerId:number;shippingId:number;color:string;firstMode:Transport;lastMode:Transport;firstRoute:Geo[];lastRoute:Geo[]};
export const JOURNEYS:Journey[]=[
 {id:'DEMO-005',name:'Legazpi to Polangui',subtitle:'Our Albay demonstration',island:'luzon',source:'legazpi-shop',hub:'polangui-hub',destination:'polangui-home',sellerId:22,shippingId:3,color:'#ed7957',firstMode:'van',lastMode:'motorcycle',firstRoute:[[123.744,13.139],[123.65,13.18],[123.59,13.22],[123.54,13.25],[123.49,13.30]],lastRoute:[[123.49,13.30],[123.482,13.30],[123.483,13.31]]},
 {id:'DEMO-001',name:'Manila to Baguio',subtitle:'A Luzon delivery',island:'luzon',source:'metro-shops',hub:'clark-hub',destination:'baguio-home',sellerId:1,shippingId:1,color:'#ef704c',firstMode:'van',lastMode:'motorcycle',firstRoute:[[120.984,14.6],[120.8,14.84],[120.65,15.04],[120.561,15.189]],lastRoute:[[120.561,15.189],[120.59,15.48],[120.55,15.92],[120.58,16.2],[120.616,16.395]]},
 {id:'DEMO-002',name:'Cebu to North Cebu',subtitle:'A Visayas delivery',island:'visayas',source:'cebu-shops',hub:'cebu-hub',destination:'bogo-home',sellerId:8,shippingId:2,color:'#628bea',firstMode:'car',lastMode:'motorcycle',firstRoute:[[123.885,10.315],[123.902,10.37],[123.925,10.43]],lastRoute:[[123.925,10.43],[124.02,10.54],[124.06,10.7],[124.04,10.92],[124.006,11.051]]},
 {id:'DEMO-003',name:'Davao to Butuan',subtitle:'A Mindanao delivery',island:'mindanao',source:'davao-shops',hub:'cdo-hub',destination:'butuan-home',sellerId:9,shippingId:4,color:'#ad81bd',firstMode:'van',lastMode:'motorcycle',firstRoute:[[125.612,7.07],[125.38,7.35],[125.12,7.65],[125.02,8.15],[124.647,8.478]],lastRoute:[[124.647,8.478],[124.81,8.65],[125.1,8.83],[125.31,8.94],[125.529,8.947]]},
 {id:'DEMO-004',name:'Cebu to Palawan',subtitle:'An inter-island delivery',island:'palawan',source:'cebu-shops',hub:'palawan-hub',destination:'roxas-home',sellerId:18,shippingId:5,color:'#3f9b9c',firstMode:'ferry',lastMode:'van',firstRoute:[[123.885,10.315],[124.11,10.81],[124.03,11.5],[122.55,12.13],[121.55,11.56],[120.56,10.86],[119.35,10.1],[118.738,9.739]],lastRoute:[[118.738,9.739],[118.91,9.97],[119.08,10.14],[119.35,10.32]]},
];
export const DURATION=60;
export const STAGES=[{id:'placed',label:'Order placed',start:0,end:6},{id:'pickup',label:'Pickup',start:6,end:22},{id:'sorting',label:'At the hub',start:22,end:30},{id:'lastmile',label:'Out for delivery',start:30,end:54},{id:'delivered',label:'Delivered',start:54,end:60}] as const;
export const REGIONS:{id:Island;label:string;center:Geo;height:number}[]=[{id:'all',label:'Philippines',center:[122.2,12.55],height:19.8},{id:'luzon',label:'Luzon',center:[121.55,16.2],height:9.2},{id:'visayas',label:'Visayas',center:[123.25,10.9],height:5.6},{id:'mindanao',label:'Mindanao',center:[124.65,7.72],height:7},{id:'palawan',label:'Palawan',center:[119.15,10.25],height:6.8}];
export const KIND_LABEL={shop:'Shops',hub:'Sorting hubs',home:'Homes',hq:'Developer HQ'};
export function toWorld([lon,lat]:Geo):[number,number]{return [(lon-122)*1.3*Math.cos(12*Math.PI/180),-(lat-12)*1.3];}
// Miniatures are diagrammatic. Keep their footprints and loading lanes apart;
// the small anchor dots continue to mark the original city coordinates.
export const PLACE_SIZE={hq:[1.02,.884],shop:[.918,.721],hub:[1.122,.939],home:[.986,.762]} as const;
export const placeLayout=new Map<string,[number,number]>();
for(const p of PLACES){const [x,z]=toWorld(p.geo);placeLayout.set(p.id,[x+(p.offset?.[0]||0),z+(p.offset?.[1]||0)]);}
for(let pass=0;pass<160;pass++){
 let moved=false;
 for(let i=0;i<PLACES.length;i++)for(let k=i+1;k<PLACES.length;k++){
  const a=PLACES[i],b=PLACES[k],pa=placeLayout.get(a.id)!,pb=placeLayout.get(b.id)!;
  const dx=pb[0]-pa[0],dz=pb[1]-pa[1],sx=(PLACE_SIZE[a.kind][0]+PLACE_SIZE[b.kind][0])/2+1.35-Math.abs(dx),sz=(PLACE_SIZE[a.kind][1]+PLACE_SIZE[b.kind][1])/2+1.35-Math.abs(dz);
  if(sx<=0||sz<=0)continue;
  const axis=sx<sz?0:1,step=((axis===0?sx:sz)+.001)/2,sign=(axis===0?dx:dz)>=0?1:-1;
  pa[axis]-=step*sign;pb[axis]+=step*sign;moved=true;
 }
 if(!moved)break;
}
placeLayout.set('polangui-hub',[1.65,-1.70]);
placeLayout.set('nexacart-hq',[-0.10,-2.80]);
placeLayout.set('polangui-home',[0.55,-0.15]);
placeLayout.set('legazpi-shop',[3.30,-1.90]);
export function placePoint(p:Place):[number,number]{return [...placeLayout.get(p.id)!];}
export function loadingPoint(p:Place):[number,number]{const [x,z]=placePoint(p);return [x,z+PLACE_SIZE[p.kind][1]/2+.65];}
export function getPlace(id:string){const p=PLACES.find(p=>p.id===id);if(!p)throw new Error('Unknown map place.');return p;}
export function getJourney(id:string){const j=JOURNEYS.find(j=>j.id===id);if(!j)throw new Error('Unknown demo journey.');return j;}
export function flowAt(seconds:number){
 const time=Math.max(0,Math.min(DURATION,Number.isFinite(seconds)?seconds:0));
 const stageIndex=STAGES.findIndex((s,i)=>time<s.end||i===STAGES.length-1);
 const firstProgress=Math.max(0,Math.min(1,(time-6)/16));
 const lastProgress=Math.max(0,Math.min(1,(time-30)/24));
 const stage=STAGES[stageIndex],delivered=time>=54;
 return {time,stageIndex,stage,firstProgress,lastProgress,delivered,stageProgress:delivered?1:(time-stage.start)/(stage.end-stage.start),journeyProgress:Math.min(1,time/54)};
}
export function advanceTime(time:number,delta:number,speed:number,loop:boolean){const next=time+Math.max(0,delta)*Math.max(.25,Math.min(4,speed));return next>=DURATION?(loop?next%DURATION:DURATION):Math.max(0,next);}
export function clockLabel(t:number){const sec=Math.floor(Math.max(0,Math.min(60,t)));return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}
export function regionForSeller(sellerId:number){const p=PLACES.find(p=>p.sellerIds?.includes(sellerId));return p?.island||'all';}
export function sellerPlace(sellerId:number){return PLACES.find(p=>p.sellerIds?.includes(sellerId));}
export function journeyFrame(j:Journey){
 const points=[...j.firstRoute,...j.lastRoute].map(toWorld).concat([j.source,j.hub,j.destination].map(id=>placePoint(getPlace(id))));
 const xs=points.map(p=>p[0]),zs=points.map(p=>p[1]);const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);
 return {center:[(minX+maxX)/2,(minZ+maxZ)/2] as [number,number],height:Math.max(4.2,maxZ-minZ+2.6,(maxX-minX+2.4)/1.35)};
}
export type MapState={playing?:boolean;detailsOpen?:boolean;active?:boolean;journeyFocus?:boolean;time:number;journeyId:string;shippingId:number;region:Island;selectedPlace:string|null;selectedSeller:number|null;follow:boolean;topDown:boolean;routes:boolean;labels:boolean;zoomRequest:number;focusRequest:number};
export type GeoLand={source:string;polygons:Geo[][][]};
