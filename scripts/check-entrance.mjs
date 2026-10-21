import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
import * as THREE from 'three';
const out='.sites-runtime/entrance-check';
await fs.mkdir(out,{recursive:true});
for(const file of ['cart-model','entry-motion']){
 const source=await fs.readFile(`components/nexacart/entry/${file}.ts`,'utf8');
 await fs.writeFile(`${out}/${file}.js`,ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
}
const {createStudioCart}=await import(`../${out}/cart-model.js`);
const {cartIntro,entryReveal,studioFraming,ENTRY_TRANSITION_MS,ENTRY_QUICK_TRANSITION_MS}=await import(`../${out}/entry-motion.js`);
const {group,parcel,wheels}=createStudioCart();
assert.equal(wheels.length,4,'Cart must have four grounded wheels');
group.updateMatrixWorld(true);
for(const wheel of wheels){const bounds=new THREE.Box3().setFromObject(wheel);assert.ok(Math.abs(bounds.min.y)<.02,'Wheel must meet the studio floor');}
const basketParcel=new THREE.Box3().setFromObject(parcel);
assert.ok(basketParcel.min.y>.965+.18,'Parcel must rest above the basket base');
assert.ok(basketParcel.max.y<.965+1.4,'Settled parcel must fit inside the basket');
for(let seconds=0;seconds<=5;seconds+=1/60){
 const pose=cartIntro(seconds);assert.ok(Object.values(pose).every(Number.isFinite));
 assert.ok(pose.parcelY>=.78,'Parcel drop must not pass through basket floor');
 assert.ok(pose.parcelSquash>.9,'Impact must preserve parcel volume');
}
assert.ok(Math.abs(cartIntro(5).parcelY-.78)<.001,'Parcel must settle');
assert.ok(Math.abs(cartIntro(5).x)<.001,'Cart must complete its roll-in');
assert.deepEqual(cartIntro(0,true),cartIntro(5,true),'Reduced motion must start in the settled pose');
for(const p of [-1,0,.3,.7,1,2])for(const v of Object.values(entryReveal(p)))assert.ok(Number.isFinite(v)&&v>=0&&v<=1,'Map reveal must remain bounded');
assert.equal(entryReveal(1).landScale,1,'Coastline must reach the map scale');
assert.ok(ENTRY_QUICK_TRANSITION_MS<300&&ENTRY_TRANSITION_MS<1300,'Entry must remain prompt');
// Project every actual mesh vertex: the settled cart must clear the headline
// and entry control across desktop, tablet, and short/tall phone layouts.
for(const [width,height] of [[1363,936],[1920,1080],[1440,900],[900,600],[768,1024],[390,844],[390,590],[320,700]]){
 const {zoom,targetY}=studioFraming(width,height),aspect=width/height;
 const camera=new THREE.OrthographicCamera(-9.9*aspect,9.9*aspect,9.9,-9.9,.1,150);
 camera.position.set(5.1,3.6,9.3);camera.lookAt(0,targetY,0);camera.zoom=zoom;camera.updateProjectionMatrix();camera.updateMatrixWorld();group.rotation.y=-.25;group.updateMatrixWorld(true);
 let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
 group.traverse(o=>{if(!(o instanceof THREE.Mesh))return;const vertices=o.geometry.getAttribute('position');for(let i=0;i<vertices.count;i++){
  const v=new THREE.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(o.matrixWorld).project(camera),x=(v.x+1)*width/2,y=(1-v.y)*height/2;
  left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
 }});
 assert.ok(left>0&&right<width,`Cart must fit ${width}×${height} horizontally`);
 assert.ok(top>height*.33&&bottom<height*.87,`Cart must clear text and CTA at ${width}×${height}`);
}
console.log('Entrance checks passed: grounded geometry, parcel clearance, motion, reduced motion, reveal, and 8 viewport projections.');
