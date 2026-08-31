import * as THREE from 'three';
import { createRoadPath, DEBUG_ROAD, ROAD_CONFIG, ROAD_SEGMENTS } from './RoadPath.js';
import { TruckController } from './TruckController.js';
import { ScrollController } from './ScrollController.js';

const asphaltMaterial=()=>new THREE.MeshBasicMaterial({color:0x000000});
const simpleMaterial=(color)=>new THREE.MeshBasicMaterial({color});

export class LogisticsRoadScene {
  constructor(section){
    this.section=section;this.canvas=section?.querySelector('[data-logistics-canvas]');this.status=section?.querySelector('[data-road-status]');
    this.progressBar=section?.querySelector('[data-road-progress]');this.config={...ROAD_CONFIG,horizontalScale:innerWidth<768?.38:innerWidth<992?.72:1};this.progress=0;this.raf=0;this.visible=false;
    this.point=new THREE.Vector3();this.tangent=new THREE.Vector3();this.cameraTarget=new THREE.Vector3();this.cameraPosition=new THREE.Vector3();
  }
  async init(){
    if(!this.canvas)return this;
    this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-24,24,74,-74,.1,240);
    this.camera.position.set(0,100,62);this.camera.up.set(0,0,-1);this.camera.lookAt(0,0,62);
    this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.25:1.5));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1;this.renderer.shadowMap.enabled=false;
    this.roadRoot=new THREE.Group();this.roadRoot.name='RoadRoot';this.scene.add(this.roadRoot);
    this.path=createRoadPath(this.config);this.buildRoad();
    this.warehouseRoot=null;this.dockLight={emissiveIntensity:0};
    this.scene.add(new THREE.HemisphereLight(0xffffff,0xc9d0dc,2.5));
    const sun=new THREE.DirectionalLight(0xffffff,3.2);sun.position.set(-12,28,-8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);this.scene.add(sun);
    const accent=new THREE.DirectionalLight(0xff7a32,1.1);accent.position.set(18,10,12);this.scene.add(accent);
    this.truck=new TruckController(this.scene,this.path,this.config);await this.truck.init();
    this.scroll=new ScrollController(this.section,this,this.config).init();
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.canvas);this.resize();this.scroll.refresh();
    this.intersectionObserver=new IntersectionObserver(([entry])=>this.setRenderActive(entry.isIntersecting),{rootMargin:'30% 0px'});this.intersectionObserver.observe(this.section);
    this.setProgress(0);
    window.hubWarderRoad=this;
    return this;
  }
  buildRoad(){
    const samples=this.config.samples,half=this.config.roadWidth/2,positions=[],uvs=[],indices=[];
    const p=new THREE.Vector3(),t=new THREE.Vector3(),normal=new THREE.Vector3();
    for(let i=0;i<=samples;i++){
      const u=i/samples;this.path.getPointAt(u,p);this.path.getTangentAt(Math.min(u,.99999),t).normalize();normal.set(-t.z,0,t.x).normalize();
      positions.push(p.x+normal.x*half,.02,p.z+normal.z*half,p.x-normal.x*half,.02,p.z-normal.z*half);uvs.push(0,u,1,u);
      if(i<samples){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
    const surface=new THREE.Mesh(geometry,asphaltMaterial());surface.name='RoadSurface';surface.visible=false;this.roadRoot.add(surface);
    if(DEBUG_ROAD)this.addDebugPoints();
  }
  buildEdge(offset,color,width){
    const points=[],p=new THREE.Vector3(),t=new THREE.Vector3(),normal=new THREE.Vector3();
    for(let i=0;i<=this.config.samples;i++){const u=i/this.config.samples;this.path.getPointAt(u,p);this.path.getTangentAt(Math.min(u,.9999),t);normal.set(-t.z,0,t.x).normalize();points.push(p.clone().addScaledVector(normal,offset).setY(.07));}
    const curve=new THREE.CatmullRomCurve3(points);const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,this.config.samples,width,4,false),simpleMaterial(color));mesh.name='RoadEdges';this.roadRoot.add(mesh);
  }
  addDebugPoints(){
    const material=new THREE.MeshBasicMaterial({color:0x00bfff});ROAD_SEGMENTS.forEach(item=>{const marker=new THREE.Mesh(new THREE.SphereGeometry(.25,8,8),material);this.path.getPointAt(item.progress,marker.position);marker.position.y=.35;this.scene.add(marker);});
  }
  setProgress(progress){
    this.progress=THREE.MathUtils.clamp(progress,0,1);const truckProgress=.025+this.progress*.95;this.truck?.update(truckProgress);this.path.getPointAt(truckProgress,this.cameraTarget);const cameraZ=this.cameraTarget.z;this.camera.position.set(0,100,cameraZ);this.camera.lookAt(0,0,cameraZ);
    this.path.getPointAt(Math.min(this.progress,.995),this.point);this.path.getTangentAt(Math.min(this.progress,.995),this.tangent);
    if(this.progressBar)this.progressBar.style.transform='scaleX('+this.progress+')';
    this.updateStory();this.dockLight.emissiveIntensity=.35+THREE.MathUtils.smoothstep(this.progress,.91,1)*1.5;
    if(DEBUG_ROAD)this.status.textContent='Progreso '+Math.round(this.progress*100)+'%';
    this.requestRender();
  }
  updateStory(){
    if(!this.status)return;const labels=['Origen confirmado','Coordinación internacional','Operación visible','Control en tránsito','Llegada al centro logístico'];
    const index=Math.min(labels.length-1,Math.floor(this.progress*labels.length));this.status.textContent=labels[index];
    this.section.querySelectorAll('[data-road-segment]').forEach((card,i)=>card.classList.toggle('is-active',i===index));
  }
  resize(){
    const rect=this.canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
    const viewHeight=38,halfWidth=(viewHeight*(rect.width/rect.height))/2;this.camera.left=-halfWidth;this.camera.right=halfWidth;this.camera.top=viewHeight/2;this.camera.bottom=-viewHeight/2;this.camera.updateProjectionMatrix();this.renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.25:1.5));this.renderer.setSize(rect.width,rect.height,false);this.requestRender();
  }
  setRenderActive(active){if(this.visible===active)return;this.visible=active;if(active)this.requestRender();else{cancelAnimationFrame(this.raf);this.raf=0;this.renderer.clear();}}
  requestRender(){if(!this.visible||this.raf)return;this.raf=requestAnimationFrame(()=>{this.raf=0;if(this.visible)this.renderer.render(this.scene,this.camera);});}
  setSectionActive(active){this.section.classList.toggle('is-road-active',active);this.truck?.setVisible(active);}
  setTruckVisible(value){this.truck?.setVisible(value);}
  destroy(){
    cancelAnimationFrame(this.raf);this.scroll?.destroy();this.resizeObserver?.disconnect();this.intersectionObserver?.disconnect();this.truck?.destroy();
    this.scene?.traverse(o=>{o.geometry?.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m?.dispose());});this.renderer?.dispose();
    if(window.hubWarderRoad===this)delete window.hubWarderRoad;
  }
}
