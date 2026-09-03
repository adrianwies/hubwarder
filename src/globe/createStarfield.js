import * as THREE from 'three';

const seededRandom=(()=>{
  let seed=14731;
  return ()=>((seed=(seed*16807)%2147483647)-1)/2147483646;
})();

const createLayer=({count,size,opacity,depth})=>{
  const positions=new Float32Array(count*3);
  const colors=new Float32Array(count*3);
  const white=new THREE.Color('#f5f7fa');
  const pink=new THREE.Color('#d95a93');
  const color=new THREE.Color();

  for(let index=0;index<count;index++){
    const offset=index*3;
    positions[offset]=(seededRandom()-.5)*980;
    positions[offset+1]=(seededRandom()-.5)*560;
    positions[offset+2]=-90-seededRandom()*depth;
    color.copy(white).lerp(pink,seededRandom()>.91?.32:0);
    colors[offset]=color.r;colors[offset+1]=color.g;colors[offset+2]=color.b;
  }

  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const material=new THREE.PointsMaterial({size,opacity,transparent:true,vertexColors:true,sizeAttenuation:true,depthWrite:false,blending:THREE.AdditiveBlending});
  return new THREE.Points(geometry,material);
};

export const createStarfield=()=>{
  const group=new THREE.Group();
  const mobile=window.matchMedia('(max-width: 768px)').matches;
  group.add(
    createLayer({count:mobile?160:380,size:.48,opacity:.42,depth:520}),
    createLayer({count:mobile?45:110,size:1.05,opacity:.34,depth:430})
  );
  group.rotation.z=-.035;
  return group;
};