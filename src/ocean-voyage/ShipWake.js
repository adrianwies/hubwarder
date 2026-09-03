import * as THREE from 'three';

const WAKE_VIDEO_URL = '/video/ship-wake-test-v3.mp4';
const WAKE_POSTER_URL = '/video/ship-wake-test-v3-poster.png';
const WAKE_OVERLAY_VIDEO_URL = '/video/ship-wake.mp4';

// Controles exclusivos de la capa de video. No afectan al shader del océano.
export const SHIP_WAKE_CONFIG = {
  width: 8.5,
  length: 18.5,
  // Compensa la longitud extra para mantener la estela anclada a la popa.
  offsetForward: -4.8,
  offsetSide: 0,
  baseOpacity: 0,
  intensity: 1.12,
  // Descarta negros comprimidos del MP4 y evita bandas verticales residuales.
  blackThreshold: .09,
  whiteThreshold: .46,
  heightOffset: .035,
  overlayOpacity: 0.6,
  overlayWidth: 1,
  overlayOffsetX: 0,
  overlayOffsetY: -0.2,
  playbackRate: 1.5,
  overlayPlaybackRate: 0.5,
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uWakeTexture;
  uniform sampler2D uOverlayTexture;
  uniform vec3 uFoamColor;
  uniform float uBaseOpacity;
  uniform float uIntensity;
  uniform float uBlackThreshold;
  uniform float uWhiteThreshold;
  uniform float uOverlayOpacity;
  uniform float uOverlayWidth;
  uniform float uVisibility;
  uniform vec2 uOverlayOffset;
  varying vec2 vUv;

  void main() {
    // Orientación invertida respecto a la prueba anterior: la U nace junto a
    // la popa y la apertura de la V continúa detrás del barco.
    vec3 videoColor = texture2D(uWakeTexture, vUv).rgb;
    vec2 overlayUv = vec2(
      (vUv.x - .5 - uOverlayOffset.x) / uOverlayWidth + .5,
      vUv.y - uOverlayOffset.y
    );
    // Fuera de 0-1 VideoTexture usa ClampToEdge. Sin esta mÃ¡scara, el Ãºltimo
    // pÃ­xel del MP4 se estira y produce columnas blancas en los extremos.
    float overlayBounds = smoothstep(0.0, .012, overlayUv.x)
      * smoothstep(0.0, .012, overlayUv.y)
      * (1.0 - smoothstep(.988, 1.0, overlayUv.x))
      * (1.0 - smoothstep(.988, 1.0, overlayUv.y));
    // La cola de la estela pierde fuerza gradualmente antes de alcanzar el
    // borde del video, evitando que su terminacion se perciba recortada.
    float tailFade = 1.0 - smoothstep(.70, .98, overlayUv.y);
    overlayBounds *= tailFade;
    vec3 overlayColor = texture2D(uOverlayTexture, overlayUv).rgb * overlayBounds;
    float baseLuminance = dot(videoColor, vec3(.299, .587, .114));
    float overlayLuminance = dot(overlayColor, vec3(.299, .587, .114));
    float baseAlpha = smoothstep(uBlackThreshold, uWhiteThreshold, baseLuminance);
    float overlayAlpha = smoothstep(uBlackThreshold, uWhiteThreshold, overlayLuminance);
    // Segunda puerta suave: elimina ruido gris lineal de la compresiÃ³n sin
    // recortar los bordes orgÃ¡nicos de las crestas blancas.
    baseAlpha *= smoothstep(.075, .18, baseLuminance);
    overlayAlpha *= smoothstep(.075, .18, overlayLuminance);
    baseAlpha *= baseLuminance * uBaseOpacity * uIntensity;
    overlayAlpha *= overlayLuminance * uOverlayOpacity * uIntensity;
    float alpha = max(baseAlpha, overlayAlpha) * uVisibility;
    float luminance = max(baseLuminance, overlayLuminance);
    if (alpha < .006) discard;
    gl_FragColor = vec4(uFoamColor * mix(.8, 1.0, luminance), alpha);
  }
`;

export class ShipWake {
  constructor({ config = {} } = {}) {
    this.config = { ...SHIP_WAKE_CONFIG, ...config };
    this.video = document.createElement('video');
    this.video.src = WAKE_VIDEO_URL;
    this.video.poster = WAKE_POSTER_URL;
    this.video.loop = true;
    this.video.muted = true;
    this.video.autoplay = false;
    this.video.playsInline = true;
    this.video.preload = this.config.baseOpacity > .001 ? 'auto' : 'none';
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('muted', '');
    this.video.playbackRate = this.config.playbackRate;

    this.overlayVideo = document.createElement('video');
    this.overlayVideo.src = WAKE_OVERLAY_VIDEO_URL;
    this.overlayVideo.loop = true;
    this.overlayVideo.muted = true;
    this.overlayVideo.autoplay = false;
    this.overlayVideo.playsInline = true;
    this.overlayVideo.preload = 'auto';
    this.overlayVideo.setAttribute('playsinline', '');
    this.overlayVideo.setAttribute('muted', '');
    this.overlayVideo.playbackRate = this.config.overlayPlaybackRate;

    this.texture = new THREE.VideoTexture(this.video);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;

    this.overlayTexture = new THREE.VideoTexture(this.overlayVideo);
    this.overlayTexture.colorSpace = THREE.SRGBColorSpace;
    this.overlayTexture.minFilter = THREE.LinearFilter;
    this.overlayTexture.magFilter = THREE.LinearFilter;
    this.overlayTexture.generateMipmaps = false;

    this.uniforms = {
      uWakeTexture: { value: this.texture },
      uOverlayTexture: { value: this.overlayTexture },
      uFoamColor: { value: new THREE.Color(.90, .96, 1) },
      uBaseOpacity: { value: this.config.baseOpacity },
      uIntensity: { value: this.config.intensity },
      uBlackThreshold: { value: this.config.blackThreshold },
      uWhiteThreshold: { value: this.config.whiteThreshold },
      uOverlayOpacity: { value: this.config.overlayOpacity },
      uOverlayWidth: { value: this.config.overlayWidth },
      uVisibility: { value: 0 },
      uOverlayOffset: {
        value: new THREE.Vector2(this.config.overlayOffsetX, this.config.overlayOffsetY),
      },
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      // La superficie del océano tiene desplazamiento vertical. Desactivar la
      // prueba de profundidad evita que sus crestas atraviesen el plano del wake;
      // renderOrder mantiene la espuma bajo el barco y sobre el agua.
      depthTest: false,
      toneMapped: false,
      blending: THREE.NormalBlending,
    });
    this.geometry = new THREE.PlaneGeometry(this.config.width, this.config.length);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'ShipWakeVideo';
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.set(this.config.offsetSide, this.config.heightOffset, this.config.offsetForward);
    this.mesh.renderOrder = 2;
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;

    // El elemento HTML continúa reproduciéndose sin depender de RAF, GSAP o scroll.
    if (this.config.baseOpacity > .001) this.video.load();
    this.overlayVideo.load();
  }

  setVisibility(value) {
    this.uniforms.uVisibility.value = THREE.MathUtils.clamp(value, 0, 1);
  }

  setActive(active) {
    if (active) {
      if (this.config.baseOpacity > .001) this.video.play().catch(() => {});
      if (this.config.overlayOpacity > .001) this.overlayVideo.play().catch(() => {});
      return;
    }
    this.video.pause();
    this.overlayVideo.pause();
  }

  dispose() {
    this.video.pause();
    this.video.removeAttribute('src');
    this.video.load();
    this.overlayVideo.pause();
    this.overlayVideo.removeAttribute('src');
    this.overlayVideo.load();
    this.texture.dispose();
    this.overlayTexture.dispose();
    this.geometry.dispose();
    this.material.dispose();
  }
}
