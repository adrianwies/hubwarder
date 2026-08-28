import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { GlobeTheme } from './GlobeTheme.js';
import { GlobeRoutes } from './GlobeRoutes.js';
import { GlobeMarkers } from './GlobeMarkers.js';
import { GlobeController } from './GlobeController.js';
import { ImportFlowManager } from './ImportFlowManager.js';
import { routes,hub,importOrigins } from '../data/routes.js';
import { DEBUG } from '../config.js';
import { createStarfield } from './createStarfield.js';

const nameOf=feature=>feature.properties.ADMIN||feature.properties.NAME||feature.properties.SOVEREIGNT;
export class GlobeScene {
  constructor({container,debug=DEBUG}){if(!container)throw new Error('GlobeScene requiere un container');this.container=container;this.debug=debug;this.activeCountries=new Set(['Peru']);this.countryIndex=new Map();this.raf=0;this.timer=new THREE.Timer();this.timer.connect(document);}
  async init(){
    const response=await fetch('/data/countries.geojson');if(!response.ok)throw new Error(`No se pudo cargar countries.geojson: ${response.status}`);const geojson=await response.json();let cityLights=null;try{cityLights=await new THREE.TextureLoader().loadAsync('/textures/earth-night.jpg');cityLights.colorSpace=THREE.SRGBColorSpace;}catch(error){console.warn('[GlobeScene] No se pudo cargar la textura de luces urbanas:',error);}this.features=geojson.features;this.features.forEach(f=>this.countryIndex.set(nameOf(f),f));this.peruFeature=this.features.find(f=>nameOf(f)==='Peru');
    this.scene=new THREE.Scene();this.starfield=createStarfield();this.scene.add(this.starfield);this.reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;this.elapsed=0;this.cameraRig=new THREE.Group();this.camera=new THREE.PerspectiveCamera(34,1,.1,1200);this.camera.position.set(0,0,445);this.cameraRig.add(this.camera);this.scene.add(this.cameraRig);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.3;this.renderer.setClearColor(GlobeTheme.background,0);this.container.appendChild(this.renderer.domElement);
    this.globeRoot=new THREE.Group();this.globe=new ThreeGlobe({animateIn:false,waitForGlobeReady:true})
      .globeImageUrl('/textures/earth-night.jpg')
      .polygonsData(this.features)
      .polygonAltitude(d=>nameOf(d)==='Peru'?.022:.003)
      .polygonCapColor(d=>nameOf(d)==='Peru'?'rgba(242,46,120,.52)':'rgba(104,139,168,.035)')
      .polygonSideColor(d=>nameOf(d)==='Peru'?'rgba(255,82,99,.30)':'rgba(0,0,0,0)')
      .polygonStrokeColor(d=>nameOf(d)==='Peru'?'rgba(255,122,50,.88)':'rgba(255,255,255,.045)')
      .showAtmosphere(true)
      .atmosphereColor('#F22E78')
      .atmosphereAltitude(.16);
    const material=this.globe.globeMaterial();material.color.set(0xffffff);material.roughness=.9;material.metalness=.01;if(cityLights){material.emissive=new THREE.Color(0xffc58f);material.emissiveMap=cityLights;material.emissiveIntensity=.72;material.needsUpdate=true;}
    this.globeRoot.add(this.globe);const haloVertex='varying vec3 n;varying vec3 v;void main(){n=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}';
    const haloFragment='uniform float intensity;uniform float power;varying vec3 n;varying vec3 v;void main(){float fresnel=pow(1.-max(0.,dot(n,v)),power);float upper=smoothstep(-.15,.72,n.y);vec3 pink=vec3(.851,.353,.576);vec3 coral=vec3(.894,.478,.361);vec3 white=vec3(1.);vec3 color=mix(pink,coral,upper);float whiteBand=smoothstep(.15,.48,n.y)*(1.-smoothstep(.5,.82,n.y));color=mix(color,white,whiteBand*.72);gl_FragColor=vec4(color,fresnel*intensity);}';
    const createHalo=(radius,intensity,power)=>new THREE.Mesh(
      new THREE.SphereGeometry(radius,64,48),
      new THREE.ShaderMaterial({
        uniforms:{intensity:{value:intensity},power:{value:power}},
        transparent:true,
        side:THREE.BackSide,
        blending:THREE.AdditiveBlending,
        depthWrite:false,
        vertexShader:haloVertex,
        fragmentShader:haloFragment
      })
    );
    [createHalo(102.7,.14,5.4),createHalo(104.4,.055,3.25),createHalo(106.5,.018,1.9)].forEach(halo=>this.globeRoot.add(halo));this.scene.add(this.globeRoot);this.scene.add(new THREE.HemisphereLight(0xfff0e6,0x10243d,2.15));const key=new THREE.DirectionalLight(0xffd5b8,2.05);key.position.set(-140,180,220);this.scene.add(key);const rim=new THREE.DirectionalLight(GlobeTheme.coral,1.5);rim.position.set(180,120,-120);this.scene.add(rim);
    this.routes=new GlobeRoutes(this.globeRoot,routes,this.debug,{globeRadius:100}).init();this.importFlow=new ImportFlowManager({routes:this.routes,origins:importOrigins});this.markers=new GlobeMarkers(this.globe,routes,hub,this.debug).init();this.controller=new GlobeController(this.camera,this.renderer.domElement,this.globeRoot);this.controller.focus({...hub,duration:0});this.locationElement=document.querySelector('.hero__peru-location');
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.container);this.resize();this.render();
    if(this.debug)console.info('[GlobeScene]',this.features.length,'paÃ­ses cargados;',routes.length,'rutas disponibles');return this;
  }
  findCountry(name){return this.countryIndex.get(name)||[...this.countryIndex.entries()].find(([key])=>key.toLowerCase()===name.toLowerCase())?.[1];}
  highlightCountry(name){const feature=this.findCountry(name);if(!feature){if(this.debug)console.warn('[GlobeScene] PaÃ­s no encontrado:',name);return false;}this.activeCountries.clear();this.activeCountries.add('Peru');this.globe.polygonsData([...this.features]);return nameOf(feature)==='Peru';}
  clearHighlights(){this.activeCountries.clear();this.activeCountries.add('Peru');this.globe.polygonsData([...this.features]);}
  focusCountry(nameOrCoords){const coords=typeof nameOrCoords==='string'?routes.flatMap(r=>[r.origin,r.destination]).find(p=>p.country===nameOrCoords||p.name===nameOrCoords):nameOrCoords;if(!coords){if(this.debug)console.warn('[GlobeScene] Sin coordenadas para:',nameOrCoords);return;}return this.controller.focus(coords);}
  showRoute(id){this.routes.showRoute(id);}hideRoute(id){this.routes.hideRoute(id);}animateRoute(id,options){return this.routes.animateRoute(id,options);}pauseRoute(id){this.routes.pauseRoute(id);}resetRoute(id){this.routes.resetRoute(id);}highlightRoute(id){this.routes.highlightRoute(id);}showAllRoutes(){this.routes.showAllRoutes();}hideAllRoutes(){this.routes.hideAllRoutes();}startImportFlow(){this.importFlow.start();}stopImportFlow(){this.importFlow.stop();}pauseImportFlow(){this.importFlow.pause();}resumeImportFlow(){this.importFlow.resume();}
  showMarker(country){this.markers.showMarker(country);}hideMarker(country){this.markers.hideMarker(country);}enableInteraction(){this.controller.enable();}disableInteraction(){this.controller.disable();}
  resize(){const {width,height}=this.container.getBoundingClientRect();if(!width||!height)return;this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.setSize(width,height,false);const radius=108,fov=THREE.MathUtils.degToRad(this.camera.fov),vertical=radius/Math.tan(fov/2)*1.015,horizontalFov=2*Math.atan(Math.tan(fov/2)*this.camera.aspect),horizontal=radius/Math.tan(horizontalFov/2)*1.025,distance=Math.max(vertical,horizontal);this.camera.position.normalize().multiplyScalar(distance);this.controller.controls.minDistance=distance*.82;this.controller.controls.maxDistance=distance*1.38;this.controller.controls.update();}
  render=()=>{
    this.timer.update();const delta=Math.min(this.timer.getDelta(),.05);this.elapsed+=delta;
    if(!this.reducedMotion&&this.starfield)this.starfield.userData.update?.(delta);
    this.controller.tick(delta);this.controller.update();
    this.renderer.render(this.scene,this.camera);
    this.updatePeruLocation();
    this.raf=requestAnimationFrame(this.render);
  }
  updatePeruLocation(){
    if(!this.locationElement||!this.globe)return;
    const point=this.globe.getCoords(hub.lat,hub.lng,.035);
    const projected=new THREE.Vector3(point.x,point.y,point.z).applyMatrix4(this.globe.matrixWorld).project(this.camera);
    const canvasRect=this.renderer.domElement.getBoundingClientRect();
    const heroRect=this.locationElement.offsetParent?.getBoundingClientRect();
    if(!heroRect)return;
    this.locationElement.style.left=`${canvasRect.left+(projected.x+1)*canvasRect.width/2-heroRect.left}px`;
    this.locationElement.style.top=`${canvasRect.top+(1-projected.y)*canvasRect.height/2-heroRect.top}px`;
    this.locationElement.style.visibility=projected.z<1?'visible':'hidden';
  }
  destroy(){cancelAnimationFrame(this.raf);this.timer?.dispose();this.importFlow?.destroy();this.routes?.destroy();this.resizeObserver?.disconnect();this.controller?.destroy();this.scene?.traverse(o=>{o.geometry?.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(!m)return;Object.values(m).forEach(v=>v?.isTexture&&v.dispose());m.dispose?.();});});this.renderer?.dispose();this.renderer?.forceContextLoss();this.renderer?.domElement.remove();}
}
