import * as THREE from 'three';
import gsap from 'gsap';

export const DEBUG_ROUTES = false;

export const ROUTE_CONFIG = Object.freeze({
  globeRadius: 100,
  minAltitudeFactor: .02,
  maxAltitudeFactor: .15,
  distanceAltitudeFactor: .18,
  segments: 72,
  tubeRadius: .14,
  radialSegments: 6,
  travelerStartProgress: .15,
  routeOpacity: .82,
  travelerOpacity: .92
});

const START_COLOR = new THREE.Color('#D95A93');
const END_COLOR = new THREE.Color('#E47A5C');
const Y_AXIS = new THREE.Vector3(0, 1, 0);

export function latLngToVector3(lat, lng, radius=1) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(90 - lng);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function sphericalInterpolate(startDirection, endDirection, t) {
  const dot = THREE.MathUtils.clamp(startDirection.dot(endDirection), -1, 1);
  const angle = Math.acos(dot);
  if (angle < 1e-6) return startDirection.clone();
  const sinAngle = Math.sin(angle);
  return startDirection.clone().multiplyScalar(Math.sin((1 - t) * angle) / sinAngle)
    .add(endDirection.clone().multiplyScalar(Math.sin(t * angle) / sinAngle))
    .normalize();
}

export class GlobeRoutes {
  constructor(globeRoot, routes, debug=false, options={}) {
    this.globeRoot = globeRoot;
    this.routesData = routes;
    this.debug = debug || DEBUG_ROUTES;
    this.options = { ...ROUTE_CONFIG, ...options };
    this.routes = new Map();
    this.group = new THREE.Group();
    this.group.name = 'ActiveRoutes';
    this.globeRoot.add(this.group);
  }

  get poolSize() { return this.routes.size; }

  init() {
    // Pool acotado: una geometría reusable por origen. Nunca crece durante el loop.
    this.routesData.forEach((route, index) => this.createRoute(route, index));
    return this;
  }

  createRoute(route, routeIndex=0) {
    const { globeRadius, minAltitudeFactor, maxAltitudeFactor, distanceAltitudeFactor,
      segments, tubeRadius, radialSegments, routeOpacity } = this.options;
    const startDirection = latLngToVector3(route.origin.lat, route.origin.lng).normalize();
    const endDirection = latLngToVector3(route.destination.lat, route.destination.lng).normalize();
    const angularDistance = startDirection.angleTo(endDirection);
    const maxAltitude = THREE.MathUtils.clamp(
      globeRadius * (angularDistance / Math.PI) * distanceAltitudeFactor,
      globeRadius * minAltitudeFactor,
      globeRadius * maxAltitudeFactor
    );

    const points = [];
    for (let index = 0; index <= segments; index += 1) {
      const t = index / segments;
      const direction = sphericalInterpolate(startDirection, endDirection, t);
      const altitude = Math.sin(Math.PI * t) * maxAltitude;
      points.push(direction.multiplyScalar(globeRadius + altitude));
    }

    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', .5);
    const geometry = new THREE.TubeGeometry(curve, segments, tubeRadius, radialSegments, false);
    this.applyGradientColors(geometry, segments, radialSegments);
    geometry.setDrawRange(0, 0);

    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: routeOpacity,
      depthTest: true,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `Route_${route.id}`;
    mesh.visible = false;

    const particleMaterial = new THREE.MeshBasicMaterial({
      color:'#F6A07D', transparent:true, opacity:this.options.travelerOpacity,
      depthTest:true, depthWrite:false
    });
    const particle = new THREE.Mesh(new THREE.ConeGeometry(.34, 1.0, 8), particleMaterial);
    particle.name = `RouteTraveler_${route.id}`;
    particle.visible = false;

    const routeGroup = new THREE.Group();
    routeGroup.name = `RouteGroup_${route.id}`;
    routeGroup.add(mesh, particle);
    this.group.add(routeGroup);

    const entry = {
      id:route.id, data:route, routeIndex, group:routeGroup, mesh, particle,
      curve, geometry, material, particleMaterial, timeline:null, active:false,
      diagnostics:{ angularDistance, maxAltitude, segments, startDirection, endDirection }
    };
    this.routes.set(route.id, entry);
    this.updateRoute(entry, 0, 0, false);
    if (this.debug) this.addDebugGeometry(entry, points);
    return entry;
  }

  applyGradientColors(geometry, tubularSegments, radialSegments) {
    const colors = [];
    for (let segment = 0; segment <= tubularSegments; segment += 1) {
      const color = START_COLOR.clone().lerp(END_COLOR, segment / tubularSegments);
      for (let radial = 0; radial <= radialSegments; radial += 1) colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }

  updateRoute(entry, drawProgress, travelerProgress=drawProgress, travelerVisible=true) {
    const draw = THREE.MathUtils.clamp(drawProgress, 0, 1);
    const travel = THREE.MathUtils.clamp(travelerProgress, 0, 1);
    const indexCount = entry.geometry.index?.count ?? 0;
    entry.geometry.setDrawRange(0, Math.floor((indexCount * draw) / 6) * 6);
    const point = entry.curve.getPointAt(travel);
    const tangent = entry.curve.getTangentAt(Math.min(travel, .999999)).normalize();
    entry.particle.position.copy(point);
    entry.particle.quaternion.setFromUnitVectors(Y_AXIS, tangent);
    entry.particle.visible = entry.mesh.visible && travelerVisible;
  }

  playImport(id, options={}) {
    const entry = this.routes.get(id);
    if (!entry || entry.active) return null;
    const duration = options.duration ?? 4.8;
    const travelerStart = this.options.travelerStartProgress;
    const state = { draw:0, travel:0 };

    entry.timeline?.kill();
    entry.active = true;
    entry.mesh.visible = true;
    entry.particle.visible = false;
    entry.material.opacity = this.options.routeOpacity;
    entry.particleMaterial.opacity = this.options.travelerOpacity;
    this.updateRoute(entry, 0, 0, false);

    entry.timeline = gsap.timeline();
    entry.timeline.to(state, {
      draw:1, duration, ease:'power1.inOut',
      onUpdate:() => this.updateRoute(entry, state.draw, state.travel, state.travel > 0)
    }, 0);
    entry.timeline.to(state, {
      travel:1,
      duration:duration * (1 - travelerStart),
      ease:'power1.inOut',
      onStart:() => { entry.particle.visible = true; },
      onUpdate:() => this.updateRoute(entry, state.draw, state.travel, true)
    }, duration * travelerStart);
    entry.timeline.call(() => options.onArrival?.(), null, duration);
    entry.timeline.to({}, { duration:options.arrivalHold ?? .32 }, duration);
    entry.timeline.to([entry.material, entry.particleMaterial], {
      opacity:0, duration:options.fadeDuration ?? .8, ease:'power2.inOut'
    }, duration + (options.arrivalHold ?? .32));
    entry.timeline.call(() => {
      this.releaseRoute(entry);
      options.onComplete?.();
    });
    return entry.timeline;
  }

  releaseRoute(entry) {
    entry.timeline = null;
    entry.active = false;
    entry.mesh.visible = false;
    entry.particle.visible = false;
    entry.material.opacity = this.options.routeOpacity;
    entry.particleMaterial.opacity = this.options.travelerOpacity;
    this.updateRoute(entry, 0, 0, false);
  }

  showRoute(id) {
    const entry = this.routes.get(id);
    if (!entry) return null;
    entry.mesh.visible = true;
    this.updateRoute(entry, 1, 1, false);
    return entry;
  }

  hideRoute(id) {
    const entry = this.routes.get(id);
    if (!entry) return null;
    this.resetRoute(id);
  }

  animateRoute(id, options={}) { return this.playImport(id, options); }
  pauseRoute(id) { this.routes.get(id)?.timeline?.pause(); }
  resumeRoute(id) { this.routes.get(id)?.timeline?.resume(); }
  pauseAllRoutes() { this.routes.forEach(entry => entry.timeline?.pause()); }
  resumeAllRoutes() { this.routes.forEach(entry => entry.timeline?.resume()); }

  resetRoute(id) {
    const entry = this.routes.get(id);
    if (!entry) return null;
    entry.timeline?.kill();
    this.releaseRoute(entry);
    return entry;
  }

  highlightRoute(id) {
    this.hideAllRoutes();
    return this.playImport(id);
  }

  showAllRoutes() { this.routesData.forEach(route => this.showRoute(route.id)); }
  hideAllRoutes() { this.routes.forEach(entry => this.resetRoute(entry.id)); }

  addDebugGeometry(entry, points) {
    const sphereGeometry = new THREE.SphereGeometry(.55, 10, 8);
    [points[0], points[Math.floor(points.length / 2)], points.at(-1)].forEach((point, index) => {
      const marker = new THREE.Mesh(sphereGeometry.clone(), new THREE.MeshBasicMaterial({ color:'#00F5FF', depthTest:true }));
      marker.position.copy(point);
      marker.name = `RouteDebug_${entry.id}_${['start','midpoint','end'][index]}`;
      entry.group.add(marker);
    });
    console.info(`[RouteDebug] ${entry.id}`, entry.diagnostics);
  }

  destroy() {
    this.routes.forEach(entry => {
      entry.timeline?.kill();
      entry.group.traverse(object => { object.geometry?.dispose(); object.material?.dispose(); });
    });
    this.routes.clear();
    this.group.removeFromParent();
  }
}