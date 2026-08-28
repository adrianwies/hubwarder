import * as THREE from 'three';

export const DEBUG_ROAD = false;
export const ROAD_CONFIG = Object.freeze({
  roadWidth: 6.2, shoulderWidth: .34, cornerRadius: 0, horizontalScale: 1, samples: 240,
  truckScale: 2.72, truckLateralOffset: -.38, modelYawOffset: -Math.PI / 2, wheelRadius: .48,
  scrollScrub: 1.4, entryProgress: .14, entryCameraOffset: 22, finalProgress: .992
});
export const ROAD_LAYOUT = Object.freeze({ centerX:0, startZ:-8, endZ:116 });
const v = (x,z) => new THREE.Vector3(x,0,z);

export function createRoadPath() {
  const path=new THREE.CurvePath();
  path.add(new THREE.LineCurve3(v(ROAD_LAYOUT.centerX,ROAD_LAYOUT.startZ),v(ROAD_LAYOUT.centerX,ROAD_LAYOUT.endZ)));
  return path;
}
export const ROAD_SEGMENTS = Object.freeze([
  {id:'segment-01',progress:.12},{id:'segment-02',progress:.31},{id:'segment-03',progress:.50},
  {id:'segment-04',progress:.70},{id:'segment-05',progress:.90}
]);
