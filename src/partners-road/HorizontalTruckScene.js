import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createTruckInstance } from '../logistics-road/TruckAsset.js';

gsap.registerPlugin(ScrollTrigger);

export class HorizontalTruckScene {
  constructor(section){
    this.section=section;this.canvas=section?.querySelector('[data-partners-truck]');this.progress=0;this.raf=0;this.visible=false;
    this.wheels=[];this.ownedMaterials=new Set();this.truckSize=new THREE.Vector3();this.startX=0;this.endX=0;this.motionState={progress:0};this.lastOpacity=-1;
  }
  async init(){
    if(!this.canvas)return this;
    this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-10,10,3,-3,.1,120);
    this.camera.position.set(0,1.7,12);this.camera.lookAt(0,1.7,0);
    this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1;
    this.renderer.shadowMap.enabled=false;
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x29364b,2.2));
    const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-8,13,12);key.castShadow=true;key.shadow.mapSize.set(1024,1024);this.scene.add(key);
    const rim=new THREE.DirectionalLight(0xff7a32,1.4);rim.position.set(12,7,-8);this.scene.add(rim);

    const instance=await createTruckInstance({cloneMaterials:true});this.model=instance.model;this.ownedMaterials=instance.ownedMaterials;
    this.model.traverse(object=>{if(object.isMesh){object.castShadow=false;object.receiveShadow=false;}if(/^Wheel_/.test(object.name))this.wheels.push({object,base:object.rotation.z});});
    const box=new THREE.Box3().setFromObject(this.model),size=box.getSize(new THREE.Vector3());
    const scale=10.5/size.x;this.model.scale.setScalar(scale);this.model.updateMatrixWorld(true);
    const scaledBox=new THREE.Box3().setFromObject(this.model),center=scaledBox.getCenter(new THREE.Vector3());
    this.model.position.set(-center.x,-scaledBox.min.y,-center.z);this.truckPivot=new THREE.Group();this.truckPivot.name='HorizontalTruckRoot';this.truckPivot.add(this.model);this.scene.add(this.truckPivot);
    scaledBox.setFromObject(this.model);scaledBox.getSize(this.truckSize);
    this.setOpacity(0);this.resize();
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.canvas);
    this.motionTween=gsap.to(this.motionState,{progress:1,ease:'none',onUpdate:()=>this.update(this.motionState.progress),scrollTrigger:{trigger:this.section,start:'top top',end:'bottom bottom',scrub:1.5,invalidateOnRefresh:true,onEnter:()=>{this.visible=true;},onEnterBack:()=>{this.visible=true;},onLeave:()=>{this.visible=false;},onLeaveBack:()=>{this.visible=false;this.motionState.progress=0;this.update(0);}}});
    this.trigger=this.motionTween.scrollTrigger;
    this.contentTimeline=gsap.timeline({scrollTrigger:{trigger:this.section,start:'top top',end:()=>'+='+(innerHeight*.48),scrub:.8,invalidateOnRefresh:true}})
      .fromTo(this.section.querySelector('.partners-section__copy'),{autoAlpha:0,y:28},{autoAlpha:1,y:0,duration:.42,ease:'none'},.08)
      .fromTo(this.section.querySelectorAll('.partner-card'),{autoAlpha:0,y:22},{autoAlpha:1,y:0,duration:.5,stagger:.14,ease:'none'},.34);
    this.intersectionObserver=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)this.renderer.clear();},{rootMargin:'30% 0px'});this.intersectionObserver.observe(this.section);
    this.update(0);this.render();return this;
  }
  resize(){
    const rect=this.canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
    const viewHeight=5.2,halfHeight=viewHeight/2,halfWidth=halfHeight*(rect.width/rect.height);
    this.camera.left=-halfWidth;this.camera.right=halfWidth;this.camera.top=halfHeight;this.camera.bottom=-halfHeight;this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setSize(rect.width,rect.height,false);
    const truckHalf=this.truckSize.x/2;
    this.startX=-halfWidth-truckHalf-1;this.endX=halfWidth+truckHalf+1;
    this.update(this.progress);
  }
  setOpacity(value){if(Math.abs(value-this.lastOpacity)<.008)return;this.lastOpacity=value;this.ownedMaterials.forEach(material=>{material.transparent=true;material.opacity=value;material.depthWrite=value>.98;});}
  update(progress){
    this.progress=THREE.MathUtils.clamp(progress,0,1);if(!this.truckPivot)return;
    const x=THREE.MathUtils.lerp(this.startX,this.endX,this.progress);this.truckPivot.position.set(x,0,0);
    const distance=(this.endX-this.startX)*this.progress,wheelRotation=distance/(.48*this.model.scale.x);
    this.wheels.forEach(({object,base})=>{object.rotation.z=base-wheelRotation;});
    this.setOpacity(THREE.MathUtils.smoothstep(this.progress,.02,.1));
  }
  render(){if(this.visible)this.renderer.render(this.scene,this.camera);this.raf=requestAnimationFrame(()=>this.render());}
  destroy(){
    cancelAnimationFrame(this.raf);this.motionTween?.kill();this.trigger?.kill();this.contentTimeline?.scrollTrigger?.kill();this.contentTimeline?.kill();this.resizeObserver?.disconnect();this.intersectionObserver?.disconnect();
    this.ownedMaterials.forEach(material=>material.dispose());this.scene?.traverse(object=>{if(object===this.model||this.model?.getObjectById(object.id))return;object.geometry?.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>material?.dispose());});this.renderer?.dispose();
  }
}
