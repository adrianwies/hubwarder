import * as THREE from 'three';
import { mat,mesh } from '../utils/three-utils.js';

function hullGeometry(){
  const shape=new THREE.Shape();shape.moveTo(-2,0);shape.lineTo(-1.65,-1.1);shape.lineTo(1.65,-1.1);shape.lineTo(2,0);shape.lineTo(-2,0);
  const g=new THREE.ExtrudeGeometry(shape,{depth:13,bevelEnabled:true,bevelSegments:2,bevelSize:.12,bevelThickness:.12});g.center();g.rotateY(Math.PI/2);return g;
}
export function createShipScene(){
  const group=new THREE.Group();group.name='ocean-world';group.position.set(5,-.4,-59);
  const waterMat=new THREE.MeshPhysicalMaterial({color:0x0a3035,roughness:.18,metalness:.12,clearcoat:1,clearcoatRoughness:.12,transparent:true,opacity:.98});
  const ocean=mesh(new THREE.PlaneGeometry(180,180,48,48),waterMat,[0,-1,0]);ocean.rotation.x=-Math.PI/2;ocean.userData.base=Float32Array.from(ocean.geometry.attributes.position.array);group.add(ocean);
  const ship=new THREE.Group();ship.add(mesh(hullGeometry(),new THREE.MeshPhysicalMaterial({color:0x242c2b,roughness:.38,metalness:.65,clearcoat:.35}),[0,0,0]));
  ship.add(mesh(new THREE.BoxGeometry(3.35,.2,12.3),mat(0x515d59,.65,.5),[0,.52,0]),mesh(new THREE.BoxGeometry(3.15,2.5,2.6),mat(0xd6ddd9,.5,.4),[0,1.75,4.4]));
  const windowMat=new THREE.MeshStandardMaterial({color:0x142727,roughness:.15,metalness:.7,emissive:0x1e4541,emissiveIntensity:.35});
  for(let i=-2;i<=2;i++)ship.add(mesh(new THREE.BoxGeometry(.35,.22,.04),windowMat,[i*.52,2.1,5.72]));
  const colors=[0x526b62,0x87958f,0x9dffcf,0x394944];
  for(let r=0;r<3;r++)for(let c=0;c<3;c++)for(let z=0;z<3;z++)ship.add(mesh(new THREE.BoxGeometry(.98,.72,2.05),mat(colors[(r+c+z)%4],.58,.32),[-1.05+c*1.05,.98+r*.74,-3.4+z*2.15]));
  const mast=mesh(new THREE.CylinderGeometry(.035,.055,2.3,10),mat(0xaab4b0,.35,.8),[0,3.6,4.3]);ship.add(mast);ship.rotation.y=.15;group.add(ship);
  return {group,ship,ocean};
}
