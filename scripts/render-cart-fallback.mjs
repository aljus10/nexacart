// A compact, no-WebGL vector projection of the actual studio model.
import fs from 'node:fs/promises';
import ts from 'typescript';
import * as THREE from 'three';
const out='.sites-runtime/entry-reference';await fs.mkdir(out,{recursive:true});
await fs.writeFile(out+'/cart-model.js',ts.transpileModule(await fs.readFile('components/nexacart/entry/cart-model.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
const {createStudioCart}=await import('../'+out+'/cart-model.js'),{group}=createStudioCart();group.rotation.y=-.25;group.updateMatrixWorld(true);
const camera=new THREE.OrthographicCamera(-2.65,2.65,2.1,-2.1,.1,100);camera.position.set(5.1,3.6,9.3);camera.lookAt(0,1.5,0);camera.updateMatrixWorld();camera.updateProjectionMatrix();
const project=v=>{const p=v.clone().project(camera);return {x:(p.x+1)*400,y:(1-p.y)*310,z:p.z};},path=ps=>'M'+ps.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join('L');
const faces=[],light=new THREE.Vector3(-3.8,7.5,5.2).normalize();
function hex(material,shade=1){const rgb=material.color.clone().convertLinearToSRGB();return '#'+[rgb.r,rgb.g,rgb.b].map(v=>Math.min(255,Math.round(v*shade*255)).toString(16).padStart(2,'0')).join('');}
function polygon(ps,material){const normal=ps[1].clone().sub(ps[0]).cross(ps[2].clone().sub(ps[0])).normalize();if(normal.dot(camera.position.clone().sub(ps[0]))<=0)return;const points=ps.map(project),color=hex(material,.72+.28*Math.max(0,normal.dot(light)));faces.push({z:points.reduce((n,p)=>n+p.z,0)/points.length,svg:`<path d="${path(points)}Z" fill="${color}" opacity="${material.transparent?.27:1}"/>`});}
group.traverse(o=>{if(!(o instanceof THREE.Mesh))return;const g=o.geometry,m=o.material,world=v=>v.applyMatrix4(o.matrixWorld);
 if(g.type==='TubeGeometry'){const points=g.parameters.path.getPoints(32).map(p=>project(world(p))),width=g.parameters.radius*2*800/5.3;faces.push({z:points.reduce((n,p)=>n+p.z,0)/points.length,svg:`<path d="${path(points)}" fill="none" stroke="${hex(m)}" stroke-width="${width.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${path(points)}" fill="none" stroke="#d2d8c9" stroke-opacity=".13" stroke-width="${(width*.28).toFixed(2)}" stroke-linecap="round"/>`});return;}
 if(/BoxGeometry$/.test(g.type)){g.computeBoundingBox();const {min:a,max:b}=g.boundingBox,vertices=[[a.x,a.y,a.z],[b.x,a.y,a.z],[b.x,b.y,a.z],[a.x,b.y,a.z],[a.x,a.y,b.z],[b.x,a.y,b.z],[b.x,b.y,b.z],[a.x,b.y,b.z]].map(p=>world(new THREE.Vector3(...p)));for(const face of [[3,2,1,0],[4,5,6,7],[0,1,5,4],[2,3,7,6],[1,2,6,5],[3,0,4,7]])polygon(face.map(i=>vertices[i]),m);return;}
 if(g.type==='CylinderGeometry'){const pos=g.getAttribute('position'),points=Array.from({length:pos.count},(_,i)=>project(world(new THREE.Vector3().fromBufferAttribute(pos,i))));const sorted=points.sort((a,b)=>a.x-b.x||a.y-b.y),cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);const lower=[],upper=[];for(const p of sorted){while(lower.length>=2&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}for(const p of [...sorted].reverse()){while(upper.length>=2&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}const hull=lower.slice(0,-1).concat(upper.slice(0,-1));faces.push({z:points.reduce((n,p)=>n+p.z,0)/points.length,svg:`<path d="${path(hull)}Z" fill="${hex(m,.85)}"/>`});return;}
 const pos=g.getAttribute('position'),idx=g.index;for(let i=0;i<(idx?idx.count:pos.count);i+=3)polygon([0,1,2].map(n=>world(new THREE.Vector3().fromBufferAttribute(pos,idx?idx.getX(i+n):i+n))),m);
});
faces.sort((a,b)=>b.z-a.z);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 620"><defs><radialGradient id="s"><stop stop-color="#62694f" stop-opacity=".17"/><stop offset="1" stop-color="#62694f" stop-opacity="0"/></radialGradient></defs><ellipse cx="417" cy="507" rx="250" ry="52" fill="url(#s)"/>${faces.map(f=>f.svg).join('')}</svg>`;
await fs.writeFile('public/cart-fallback.svg',svg);process.stdout.write(`Studio cart fallback: ${Math.round(svg.length/1024)} KiB\n`);
