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

const createMeteorRain=count=>{
  const positions=new Float32Array(count*6);
  const speeds=new Float32Array(count);
  const lengths=new Float32Array(count);

  const reset=(index,initial=false)=>{
    const offset=index*6;
    const x=-420+seededRandom()*840;
    const y=initial?-270+seededRandom()*570:300+seededRandom()*80;
    const z=-110-seededRandom()*280;
    const length=9+seededRandom()*22;
    positions[offset]=x;positions[offset+1]=y;positions[offset+2]=z;
    positions[offset+3]=x+length*.34;positions[offset+4]=y+length;positions[offset+5]=z;
    speeds[index]=14+seededRandom()*24;
    lengths[index]=length;
  };

  for(let index=0;index<count;index++)reset(index,true);
  const geometry=new THREE.BufferGeometry();
  const attribute=new THREE.BufferAttribute(positions,3);
  geometry.setAttribute('position',attribute);
  const material=new THREE.LineBasicMaterial({color:'#e07ca6',transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending});
  const rain=new THREE.LineSegments(geometry,material);

  rain.userData.update=delta=>{
    for(let index=0;index<count;index++){
      const offset=index*6;
      const movement=speeds[index]*delta;
      positions[offset]-=movement*.34;positions[offset+1]-=movement;
      positions[offset+3]=positions[offset]+lengths[index]*.34;
      positions[offset+4]=positions[offset+1]+lengths[index];
      if(positions[offset+1]<-310||positions[offset]<-470)reset(index);
    }
    attribute.needsUpdate=true;
  };
  return rain;
};

export const createStarfield=()=>{
  const group=new THREE.Group();
  const mobile=window.matchMedia('(max-width: 768px)').matches;
  const rain=createMeteorRain(mobile?8:22);
  group.add(
    createLayer({count:mobile?160:380,size:.48,opacity:.42,depth:520}),
    createLayer({count:mobile?45:110,size:1.05,opacity:.34,depth:430}),
    rain
  );
  group.rotation.z=-.035;
  group.userData.update=delta=>rain.userData.update(delta);
  return group;
};