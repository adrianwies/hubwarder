import * as THREE from 'three';
import { mat,mesh } from '../utils/three-utils.js';

export function createPortScene(){
  const group=new THREE.Group();group.name='port-world';group.position.z=-42;
  const dock=mesh(new THREE.BoxGeometry(24,.45,30),mat(0x252c2b,.95),[0,-1.05,-8]);group.add(dock);
  const palette=[0x9dffcf,0x49675d,0x334944,0x84958f];
  for(let i=0;i<22;i++){const c=mesh(new THREE.BoxGeometry(2.6,1.25,5.2),mat(palette[i%palette.length],.68,.25),[-8+(i%5)*3.2,-.15+Math.floor(i/10)*1.3,-15+Math.floor(i/5)*5.6]);group.add(c);}
  const crane=new THREE.Group(),steel=mat(0x688078,.58,.6);
  [-5,5].forEach(x=>crane.add(mesh(new THREE.BoxGeometry(.45,9,.45),steel,[x,3.2,0])));
  crane.add(mesh(new THREE.BoxGeometry(11,.5,.55),steel,[0,7.45,0]),mesh(new THREE.BoxGeometry(.25,6,.25),steel,[0,4.2,0]));
  crane.position.set(1,0,-3);group.add(crane);
  const cargo=mesh(new THREE.BoxGeometry(2.35,1.25,4.8),mat(0x9dffcf,.55,.35),[1,.05,8]);group.add(cargo);
  return {group,crane,cargo,hook:crane.children.at(-1)};
}
