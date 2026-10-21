import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as THREE from 'three';
import {SELLERS,SHIPPING,PLACES,JOURNEYS,STAGES,DURATION,getPlace,sellerPlace,placePoint,flowAt,advanceTime,clockLabel,journeyFrame,loadingPoint} from '../.sites-runtime/map-test-build/map-data.js';
import {routePoints,playbackFrame,buildingRect,inside,playbackPose,arrangeLabels} from '../.sites-runtime/map-test-build/map-playback.js';
import {routeCurve} from '../.sites-runtime/map-test-build/map-renderer.js';
import {createPhilippinesLand,LAND_TOP} from '../.sites-runtime/map-test-build/geography.js';
import {placeModel,vehicleModel,disposeMapMaterials} from '../.sites-runtime/map-test-build/map-models.js';

test('all 30 imported sellers appear in exactly one location without losing their original cities',()=>{
 assert.deepEqual(SELLERS.map(s=>s.seller_id),Array.from({length:30},(_,i)=>i+1));
 const mapped=PLACES.flatMap(p=>p.sellerIds||[]).sort((a,b)=>a-b);
 assert.deepEqual(mapped,SELLERS.map(s=>s.seller_id));
 assert.equal(new Set(SELLERS.map(s=>s.seller_city)).size,9);
 assert.equal(getPlace('metro-shops').sellerIds.length,21);
 assert.equal(sellerPlace(22).city,'Legazpi City');
 assert.equal(SELLERS.find(s=>s.seller_id===22).shop_name,'Snack Station PH');
 for(const seller of SELLERS)assert.ok(sellerPlace(seller.seller_id));
});
test('all five shipping options retain their distinct methods and courier names',()=>{
 assert.deepEqual(SHIPPING.map(s=>[s.shipping_id,s.shipping_method,s.courier_name]),[
  [1,'Standard Delivery','J&T Express'],[2,'Standard Delivery','SPX Express'],
  [3,'Express Delivery','SPX Express'],[4,'Standard Delivery','Ninja Van'],[5,'Economy Delivery','Flash Express'],
 ]);
});
test('developer HQ is anchored in Polangui, Albay and simulation places disclose their role',()=>{
 const hq=getPlace('nexacart-hq');assert.equal(hq.city,'Polangui, Albay');assert.equal(hq.kind,'hq');assert.deepEqual(hq.geo,[123.4855,13.2923]);
 for(const p of PLACES){assert.ok(p.geo[0]>116&&p.geo[0]<127&&p.geo[1]>4&&p.geo[1]<22);assert.ok(placePoint(p).every(Number.isFinite));if(p.kind==='hub'||p.kind==='home')assert.match(p.note,/Illustrative/);}
});
test('playback boundaries stay synchronized through sorting and doorstep delivery',()=>{
 for(const [time,expected] of [[-5,0],[0,0],[5.999,0],[6,1],[21.999,1],[22,2],[29.999,2],[30,3],[53.999,3],[54,4],[60,4],[200,4],[NaN,0]])assert.equal(flowAt(time).stageIndex,expected,`stage at ${time}`);
 assert.equal(flowAt(6).firstProgress,0);assert.equal(flowAt(22).firstProgress,1);
 assert.equal(flowAt(29).lastProgress,0);assert.equal(flowAt(54).lastProgress,1);
 assert.equal(flowAt(53.999).delivered,false);assert.equal(flowAt(54).delivered,true);
 assert.equal(STAGES[0].start,0);assert.equal(STAGES.at(-1).end,DURATION);
 assert.equal(advanceTime(59,2,1,false),60);assert.equal(advanceTime(59,2,1,true),1);
 assert.equal(advanceTime(10,1,4,false),14);assert.equal(advanceTime(10,-2,1,false),10);
 assert.equal(clockLabel(60),'01:00');assert.equal(clockLabel(-1),'00:00');
});
test('every journey has valid imported records and continuous finite route curves',()=>{
 for(const j of JOURNEYS){
  assert.ok(SELLERS.some(s=>s.seller_id===j.sellerId));assert.ok(SHIPPING.some(s=>s.shipping_id===j.shippingId));
  assert.ok(getPlace(j.source).sellerIds.includes(j.sellerId));assert.equal(getPlace(j.hub).kind,'hub');assert.equal(getPlace(j.destination).kind,'home');
  for(const leg of ['first','last']){
   const curve=routeCurve(j,leg),from=loadingPoint(getPlace(leg==='first'?j.source:j.hub)),to=loadingPoint(getPlace(leg==='first'?j.hub:j.destination));
   assert.ok(curve.getPointAt(0).distanceTo(new THREE.Vector3(from[0],leg==='first'&&j.firstMode==='ferry'?.07:LAND_TOP+.055,from[1]))<1e-7);
   assert.ok(Math.abs(curve.getPointAt(1).x-to[0])<1e-7);assert.ok(Math.abs(curve.getPointAt(1).z-to[1])<1e-7);
   for(let i=0;i<=100;i++){const p=curve.getPointAt(i/100),t=curve.getTangentAt(i/100);assert.ok(p.toArray().every(Number.isFinite));assert.ok(Math.abs(t.length()-1)<1e-5);}
  }
 }
 assert.equal(JOURNEYS.find(j=>j.id==='DEMO-004').firstMode,'ferry');
});
test('the Polangui delivery focuses the local area rather than the entire Luzon region',()=>{
 const j=JOURNEYS.find(j=>j.id==='DEMO-005');assert.ok(j);assert.equal(j.sellerId,22);assert.equal(getPlace(j.hub).city,'Polangui, Albay');assert.equal(getPlace(j.destination).city,'Polangui, Albay');const frame=playbackFrame(j);assert.ok(frame.height<9);assert.ok(frame.center.every(Number.isFinite));
});

test('country geometry and all miniature types have finite nonempty 3D bounds',async()=>{
 const data=JSON.parse(await fs.readFile('public/philippines-land.json','utf8'));
 assert.ok(data.polygons.length>=80);const land=createPhilippinesLand(data);const bounds=new THREE.Box3().setFromObject(land);assert.ok(bounds.max.y>=LAND_TOP);assert.ok(bounds.max.x-bounds.min.x>10);assert.ok(bounds.max.z-bounds.min.z>20);
 const models=[land,...['hq','shop','hub','home'].map(kind=>placeModel(kind,'Test',4)),...['van','car','motorcycle','ferry'].map(mode=>vehicleModel(mode))];
 for(const group of models){const b=new THREE.Box3().setFromObject(group);assert.equal(b.isEmpty(),false);assert.ok([...b.min.toArray(),...b.max.toArray()].every(Number.isFinite));group.traverse(o=>{if(!o.geometry)return;const positions=o.geometry.getAttribute('position');assert.ok(positions.count>0);for(const value of positions.array)assert.ok(Number.isFinite(value));o.geometry.dispose();});}
 disposeMapMaterials();
});

test('miniature footprints and every loading point leave room for delivery vehicles',()=>{
 for(const p of PLACES){const dock=loadingPoint(p);for(const other of PLACES){assert.equal(inside(dock,buildingRect(other,.59)),false,`${p.id} loading point obstructed by ${other.id}`);if(p.id===other.id)continue;const a=buildingRect(p,.3),b=buildingRect(other,.3);assert.equal(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top,false,`${p.id} overlaps ${other.id}`);}}
});
test('all ten rounded routes keep the complete vehicle footprint clear of buildings',()=>{
 for(const j of JOURNEYS)for(const leg of ['first','last']){
  const curve=routeCurve(j,leg),mode=leg==='first'?j.firstMode:j.lastMode,vehicle=vehicleModel(mode),bounds=new THREE.Box3().setFromObject(vehicle);
  for(let i=0;i<=800;i++){
   const p=curve.getPointAt(i/800),t=curve.getTangentAt(i/800),angle=Math.atan2(t.x,t.z),cos=Math.cos(angle),sin=Math.sin(angle);
   const corners=[[bounds.min.x,bounds.min.z],[bounds.min.x,bounds.max.z],[bounds.max.x,bounds.min.z],[bounds.max.x,bounds.max.z]].map(([x,z])=>[p.x+x*cos+z*sin,p.z-x*sin+z*cos]);
   for(const place of PLACES){const obstacle=buildingRect(place,.025);const separation=Math.hypot(Math.max(obstacle.left-p.x,0,p.x-obstacle.right),Math.max(obstacle.top-p.z,0,p.z-obstacle.bottom));assert.ok(separation>.48,`${j.id} ${leg} lacks body clearance from ${place.id}`);for(const corner of corners)assert.equal(inside(corner,obstacle),false,`${j.id} ${leg} hits ${place.id} at ${i/800}`);assert.equal(inside([p.x,p.z],obstacle),false);}
  }
  const from=curve.getPointAt(0),to=curve.getPointAt(1);assert.ok(from.distanceTo(to)>.5,'Route must not collapse');
 }
});
test('handoffs show one moving vehicle and delivery completion is accurate when scrubbing',()=>{
 for(const [time,vehicle] of [[0,'first'],[21.99,'first'],[22,null],[29.99,null],[30,'last'],[53.99,'last'],[54,null],[60,null]])assert.equal(playbackPose(time).vehicle,vehicle);
 assert.equal(playbackPose(54).journeyProgress,1);assert.equal(playbackPose(54).stageProgress,1);assert.equal(playbackPose(22).stageProgress,0);assert.equal(playbackPose(0).journeyProgress,0);
 assert.equal(playbackPose(6).firstTravel,0);assert.equal(playbackPose(22).firstTravel,1);assert.equal(playbackPose(30).lastTravel,0);assert.equal(playbackPose(54).lastTravel,1);
 for(const j of JOURNEYS){const inbound=routeCurve(j,'first').getPointAt(1),outbound=routeCurve(j,'last').getPointAt(0);assert.ok(Math.hypot(inbound.x-outbound.x,inbound.z-outbound.z)<1e-7,'The hub handoff must stay in the same loading bay');}
});
test('label placement accounts for actual widths, neighboring labels, and interface panels',()=>{
 const blockers=[{left:0,right:250,top:0,bottom:450}];const candidates=[{id:'shop',x:400,y:300,width:190,height:28,priority:100,visible:true},{id:'hub',x:425,y:302,width:210,height:28,priority:100,visible:true},{id:'covered',x:100,y:250,width:120,height:28,priority:20,visible:true}];
 const result=arrangeLabels(candidates,900,700,blockers);assert.equal(result.find(p=>p.id==='covered').visible,false);
 const shown=result.filter(p=>p.visible);assert.equal(shown.length,2);const [a,b]=shown;assert.ok(Math.abs(a.y-b.y)>28||Math.abs(a.x-b.x)>(a.width+b.width)/2);
});
