import * as THREE from 'three';
import { createTruckInstance } from './TruckAsset.js';
import { DEBUG_ROAD, ROAD_CONFIG } from './RoadPath.js';

export class TruckController {
  constructor(parent,path,config=ROAD_CONFIG){
    this.parent=parent;this.path=path;this.config=config;this.root=new THREE.Group();this.root.name='TruckRoot';
    this.modelPivot=new THREE.Group();this.root.add(this.modelPivot);parent.add(this.root);
    this.wheels=[];this.steers=[];this.previousProgress=0;this.totalDistance=path.getLength();
    this.tmpPoint=new THREE.Vector3();this.tmpTangent=new THREE.Vector3();this.tmpAhead=new THREE.Vector3();this.ready=false;
  }
  async init(){
    const instance=await createTruckInstance();
    const model=instance.model;
    model.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}if(/^Wheel_/.test(o.name)&&o.children.length)this.wheels.push(o);if(/^Steer_/.test(o.name))this.steers.push(o);});
    const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3());
    const scale=(5.4/Math.max(size.x,size.z))*this.config.truckScale;model.scale.setScalar(scale);model.updateMatrixWorld(true);
    const scaledBox=new THREE.Box3().setFromObject(model),center=scaledBox.getCenter(new THREE.Vector3());
    model.position.set(-center.x,-scaledBox.min.y+.08,-center.z);model.rotation.y=this.config.modelYawOffset;this.modelPivot.add(model);this.ready=true;
    if(DEBUG_ROAD){console.group('[LogisticsRoad] camion.glb');console.log('Truck root:',model.name);console.log('Wheel roots:',this.wheels.map(w=>w.name));console.log('Steering pivots:',this.steers.map(s=>s.name));console.groupEnd();}
    this.update(0);return this;
  }
  update(progress){
    const p=THREE.MathUtils.clamp(progress,0,this.config.finalProgress);
    this.path.getPointAt(p,this.tmpPoint);this.path.getTangentAt(Math.min(p,.9999),this.tmpTangent).normalize();
    this.root.position.copy(this.tmpPoint);this.root.position.x+=this.config.truckLateralOffset;this.root.position.y=.16;this.root.rotation.y=Math.atan2(this.tmpTangent.x,this.tmpTangent.z);
    if(this.ready){
      const delta=(p-this.previousProgress)*this.totalDistance/this.config.wheelRadius;
      this.wheels.forEach(w=>{w.rotation.z-=delta;});
      const before=this.path.getTangentAt(Math.max(0,p-.008),this.tmpAhead).normalize();
      const cross=before.x*this.tmpTangent.z-before.z*this.tmpTangent.x;
      const steering=THREE.MathUtils.clamp(-cross*5,-.42,.42);
      this.steers.forEach(s=>{s.rotation.y=THREE.MathUtils.lerp(s.rotation.y,steering,.25);});
      this.modelPivot.rotation.z=0;
    }
    this.previousProgress=p;
  }
  setVisible(value){this.root.visible=value;}
  destroy(){this.root.removeFromParent();}
}
