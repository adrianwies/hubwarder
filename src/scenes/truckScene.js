import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mat,mesh } from '../utils/three-utils.js';

export function createTruckScene(){
  const group=new THREE.Group(),truck=new THREE.Group(),roadGroup=new THREE.Group(),roadMaterials=[],wheels=[];
  const roadMat=new THREE.MeshPhysicalMaterial({color:0x0d0d0d,roughness:.92,metalness:.04,transparent:true,opacity:0});roadMaterials.push(roadMat);
  const road=mesh(new THREE.PlaneGeometry(115,9),roadMat,[0,-.04,0]);road.rotation.x=-Math.PI/2;roadGroup.add(road);
  [-3.4,3.4].forEach(z=>{const m=new THREE.MeshBasicMaterial({color:0x2d2d2d,transparent:true,opacity:0});roadMaterials.push(m);const edge=mesh(new THREE.PlaneGeometry(115,.055),m,[0,-.025,z]);edge.rotation.x=-Math.PI/2;roadGroup.add(edge);});
  for(let x=-55;x<60;x+=5){const m=new THREE.MeshBasicMaterial({color:0x777,transparent:true,opacity:0});roadMaterials.push(m);const stripe=mesh(new THREE.PlaneGeometry(2.4,.055),m,[x,-.02,0]);stripe.rotation.x=-Math.PI/2;roadGroup.add(stripe);}
  group.add(roadGroup);
  const placeholder=mesh(new THREE.BoxGeometry(8,2.6,2.5),mat(0x181818,.42,.5),[0,1.3,0]);truck.add(placeholder);group.add(truck);
  const ready=new GLTFLoader().loadAsync('/models/realistic-container-truck.glb').then(gltf=>{
    const model=gltf.scene.getObjectByName('Truck_Root');if(!model)throw new Error('Truck_Root no existe');model.removeFromParent();
    model.traverse(o=>{if(!o.isMesh)return;o.castShadow=o.receiveShadow=true;if(/^Wheel_/i.test(o.name))wheels.push({node:o,base:o.rotation.clone()});});
    const box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3());model.position.set(-center.x,-box.min.y,-center.z);model.scale.setScalar(.7);truck.remove(placeholder);placeholder.geometry.dispose();placeholder.material.dispose();truck.add(model);return model;
  }).catch(error=>{console.warn('Fallback del camión activo.',error);return placeholder;});
  const motion={wheel:0};const updateWheels=()=>wheels.forEach(({node,base})=>node.rotation.set(base.x,base.y,base.z+motion.wheel));
  return {group,truck,roadGroup,roadMaterials,motion,updateWheels,ready};
}
