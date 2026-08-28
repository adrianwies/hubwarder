import * as THREE from 'three';
import { ROAD_LAYOUT } from './RoadPath.js';
const material=(color,options={})=>new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.08,...options});
const box=(size,mat,position)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);mesh.position.set(...position);mesh.castShadow=mesh.receiveShadow=true;return mesh;};
export function createWarehouse(){
  const root=new THREE.Group();root.name='WarehouseRoot';const x=ROAD_LAYOUT.centerX,z=ROAD_LAYOUT.endZ+8;
  const navy=material(0x13233b),wall=material(0xe9edf3),trim=material(0xd91e63),dock=material(0x26364d);
  const light=material(0xffb06b,{emissive:0xff7a32,emissiveIntensity:.35});
  const building=box([20,5.8,9],wall,[x,2.9,z+4]);building.name='Building';root.add(building);
  root.add(box([21,.45,10],navy,[x,6,z+4]),box([20.4,.22,.45],trim,[x,5.55,z-.25]));
  [-5.7,0,5.7].forEach((offset,index)=>{const door=box([4.2,3.7,.32],dock,[x+offset,2,z-.62]);door.name='LoadingDock_'+(index+1);root.add(door,box([4.8,.35,1.4],navy,[x+offset,.22,z-1.25]),box([.3,.3,.3],light,[x+offset,4.45,z-.84]));});
  const sign=box([8,1.1,.25],navy,[x,5.05,z-.82]);sign.name='HubWarderSign';root.add(sign);
  return {root,dockLight:light};
}
