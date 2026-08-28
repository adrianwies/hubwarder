import * as THREE from 'three';
import { mat,mesh } from '../utils/three-utils.js';

export function createAirplane(){
  const plane=new THREE.Group(),body=mat(0xf0f4ef,.38,.55),accent=mat(0x9dffcf,.45,.35);
  const fuselage=mesh(new THREE.CylinderGeometry(.08,.15,.8,10),body);fuselage.rotation.x=Math.PI/2;plane.add(fuselage);
  plane.add(mesh(new THREE.BoxGeometry(.85,.035,.16),body,[0,0,0]),mesh(new THREE.BoxGeometry(.3,.04,.13),accent,[0,.05,.34]));
  plane.scale.setScalar(.55);return plane;
}
