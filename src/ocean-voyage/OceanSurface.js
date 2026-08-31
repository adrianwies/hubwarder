import * as THREE from 'three';

// Ajustes del océano. La wake vive en ShipWake.js y no altera este material.
export const OCEAN_CONFIG = {
  timeScale: .78,
  largeWaveAmplitude: .085,
  mediumWaveAmplitude: .042,
  organicWaveAmplitude: .032,
  deepColor: 0x0d3b52,
  midColor: 0x1f6983,
  lightColor: 0x82bdca,
};

const WAVES = [
  { x: .9701, z: .2425, frequency: .29, speed: .31, amplitude: OCEAN_CONFIG.largeWaveAmplitude },
  { x: -.3304, z: .9438, frequency: .61, speed: -.43, amplitude: OCEAN_CONFIG.mediumWaveAmplitude },
  { x: .7863, z: -.6178, frequency: 1.18, speed: .67, amplitude: .015 },
];

export function getWaveHeight(x, z, time) {
  let height = 0;
  for (const wave of WAVES) {
    height += Math.sin((x * wave.x + z * wave.z) * wave.frequency + time * wave.speed)
      * wave.amplitude;
  }
  return height;
}

const noiseFunctions = /* glsl */ `
  vec2 gradientHash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }
  float gradientNoise(vec2 p) {
    vec2 cell = floor(p);
    vec2 local = fract(p);
    vec2 fade = local * local * local * (local * (local * 6.0 - 15.0) + 10.0);
    float a = dot(gradientHash(cell), local);
    float b = dot(gradientHash(cell + vec2(1.0, 0.0)), local - vec2(1.0, 0.0));
    float c = dot(gradientHash(cell + vec2(0.0, 1.0)), local - vec2(0.0, 1.0));
    float d = dot(gradientHash(cell + vec2(1.0)), local - vec2(1.0));
    return mix(mix(a, b, fade.x), mix(c, d, fade.x), fade.y) * .5 + .5;
  }
  float organicFbm(vec2 p) {
    float value = 0.0;
    float amplitude = .52;
    mat2 rotation = mat2(.80, -.60, .60, .80);
    for (int octave = 0; octave < 5; octave++) {
      value += gradientNoise(p) * amplitude;
      p = rotation * p * 1.93 + vec2(7.31, -4.17);
      amplitude *= .48;
    }
    return value;
  }
`;

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vOceanPosition;
  varying vec3 vWorldPosition;
  varying float vHeight;
  ${noiseFunctions}
  float surfaceHeight(vec2 point) {
    float large = sin(dot(point, vec2(.9701, .2425)) * .29 + uTime * .31) * .085;
    float medium = sin(dot(point, vec2(-.3304, .9438)) * .61 - uTime * .43) * .042;
    float small = sin(dot(point, vec2(.7863, -.6178)) * 1.18 + uTime * .67) * .015;
    vec2 organicFlow = point * .105 + vec2(0.0, uTime * .070);
    float organic = (organicFbm(organicFlow) - .5) * .086;
    return large + medium + small + organic;
  }
  void main() {
    vec3 displaced = position;
    vec2 oceanPoint = vec2(position.x, -position.y);
    float height = surfaceHeight(oceanPoint);
    displaced.z += height;
    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vOceanPosition = oceanPoint;
    vWorldPosition = world.xyz;
    vHeight = height;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeepColor;
  uniform vec3 uMidColor;
  uniform vec3 uLightColor;
  varying vec2 vOceanPosition;
  varying vec3 vWorldPosition;
  varying float vHeight;
  ${noiseFunctions}
  float normalField(vec2 point) {
    vec2 flowA = point * .48 + vec2(0.0, uTime * .158);
    vec2 flowB = mat2(.64, -.77, .77, .64) * point * 1.34 + vec2(0.0, uTime * .211);
    return organicFbm(flowA) * .64 + organicFbm(flowB) * .36;
  }
  vec3 proceduralNormal(vec2 point) {
    float epsilon = .045;
    float center = normalField(point);
    float dx = normalField(point + vec2(epsilon, 0.0)) - center;
    float dz = normalField(point + vec2(0.0, epsilon)) - center;
    return normalize(vec3(-dx * 6.6, 1.0, -dz * 6.6));
  }
  void main() {
    vec2 point = vOceanPosition;
    vec3 normal = proceduralNormal(point);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 lightDirection = normalize(vec3(-.48, .84, -.24));
    vec3 fillLightDirection = normalize(vec3(.56, .78, .18));
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float fillDiffuse = max(dot(normal, fillLightDirection), 0.0);
    float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0);
    float specular = pow(max(dot(normal, normalize(lightDirection + viewDirection)), 0.0), 58.0);
    float fillSpecular = pow(max(dot(normal, normalize(fillLightDirection + viewDirection)), 0.0), 68.0);
    float broadColor = organicFbm(point * .075 + vec2(0.0, uTime * .054));
    float mediumColor = organicFbm(mat2(.87, -.49, .49, .87) * point * .21
      + vec2(0.0, uTime * .080));
    float movingSwell = sin(dot(point, vec2(0.0, .27)) + uTime * .72 + broadColor * 2.8) * .5 + .5;
    movingSwell = smoothstep(.5, .94, movingSwell);
    float depthMix = clamp(.16 + broadColor * .46 + mediumColor * .25 + diffuse * .23
      + fillDiffuse * .14 + movingSwell * .19, 0.0, 1.0);
    vec3 color = mix(uDeepColor, uMidColor, depthMix);
    color = mix(color, uLightColor, fresnel * .2 + specular * .38
      + fillSpecular * .22 + movingSwell * .105);
    float fineGlint = pow(max(normal.y * .5 + .5, 0.0), 4.5) * mediumColor * .095;
    color += uLightColor * fineGlint;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export class OceanSurface {
  constructor({ mobile = false } = {}) {
    this.time = 0;
    this.uniforms = {
      uTime: { value: 0 },
      uDeepColor: { value: new THREE.Color(OCEAN_CONFIG.deepColor) },
      uMidColor: { value: new THREE.Color(OCEAN_CONFIG.midColor) },
      uLightColor: { value: new THREE.Color(OCEAN_CONFIG.lightColor) },
    };
    const segments = mobile ? 88 : 180;
    this.geometry = new THREE.PlaneGeometry(48, 48, segments, segments);
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      extensions: { derivatives: true },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = -.16;
  }
  update(delta) {
    this.time += delta * OCEAN_CONFIG.timeScale;
    this.uniforms.uTime.value = this.time;
  }
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
