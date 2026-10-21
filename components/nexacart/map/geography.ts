import * as THREE from 'three';
import {toWorld,type GeoLand,type Geo} from '@/lib/nexacart/map-data';
export const LAND_TOP=.2;
export function createPhilippinesLand(data:GeoLand){
 const g=new THREE.Group();g.name='Philippines · Natural Earth coastlines';
 const top=new THREE.MeshStandardMaterial({color:0xfbfeff,roughness:.82,metalness:0});
 const side=new THREE.MeshStandardMaterial({color:0x889eb5,roughness:.92,metalness:0});
 const coast=new THREE.LineBasicMaterial({color:0x34d399,transparent:true,opacity:.78});
 const path=(ring:Geo[])=>ring.map(v=>{const [x,z]=toWorld(v);return new THREE.Vector2(x,-z);});
 for(const polygon of data.polygons){
  if(!polygon[0]||polygon[0].length<4)continue;
  const shape=new THREE.Shape(path(polygon[0]));
  polygon.slice(1).forEach(ring=>{if(ring.length>=4)shape.holes.push(new THREE.Path(path(ring)));});
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:LAND_TOP,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1,steps:1,curveSegments:1});
  geometry.rotateX(-Math.PI/2);
  const m=new THREE.Mesh(geometry,[top,side]);m.castShadow=true;m.receiveShadow=true;g.add(m);
  const points=polygon[0].map(v=>{const [x,z]=toWorld(v);return new THREE.Vector3(x,LAND_TOP+.016,z);});
  g.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),coast));
 }
 return g;
}
