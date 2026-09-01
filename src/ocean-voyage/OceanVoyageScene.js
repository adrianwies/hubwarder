import * as THREE from 'three';
import { OceanSurface, getWaveHeight } from './OceanSurface.js';
import { ShipBuoyancy } from './ShipBuoyancy.js';
import { ShipScrollController } from './ShipScrollController.js';
import { ShipWake } from './ShipWake.js';

const SHIP_URL = new URL('../../imagenes/barco.png', import.meta.url).href;

export class OceanVoyageScene {
  constructor(section) {
    this.section = section;
    this.canvas = section?.querySelector('[data-ocean-voyage]');
    this.raf = 0;
    this.visible = null;
    this.clock = new THREE.Clock();
    this.destroyed = false;
  }

  async init() {
    if (!this.canvas) return this;

    this.mobile = matchMedia('(max-width: 700px)').matches;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(31, 1, .1, 100);
    this.camera.position.set(0, 25, .01);
    this.camera.up.set(0, 0, -1);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x0d3b52, 1);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1 : 1.25));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;

    // El océano ya no utiliza render targets ni mapas GPU cuadriculados.
    this.ocean = new OceanSurface({ mobile: this.mobile });
    this.scene.add(this.ocean.mesh);

    this.ship = await this.createImageShip();
    this.shipRoot = new THREE.Group();
    this.shipRoot.name = 'ShipScrollRoot';
    this.floatRoot = new THREE.Group();
    this.floatRoot.name = 'ShipBuoyancyRoot';
    this.wake = new ShipWake();
    this.floatRoot.add(this.wake.mesh);
    this.floatRoot.add(this.ship);
    this.shipRoot.add(this.floatRoot);
    this.scene.add(this.shipRoot);

    // Evita la compilaciÃ³n del shader en el primer frame visible.
    await this.renderer.compileAsync(this.scene, this.camera).catch(() => {});

    this.scrollController = new ShipScrollController(this.section, this.shipRoot).init();
    this.buoyancy = new ShipBuoyancy({
      floatRoot: this.floatRoot,
      anchors: {},
      getWaveHeight,
    });

    this.resize();
    // Render inicial: evita mostrar solamente el color azul antes de entrar al viewport.
    this.ocean.update(0);
    this.buoyancy.update(0, this.ocean.time, 0);
    this.renderer.render(this.scene, this.camera);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.setActive(entry.isIntersecting);
    }, { rootMargin: '0px', threshold: .01 });
    this.intersectionObserver.observe(this.section);
    this.section.classList.add('is-ocean-ready');
    return this;
  }

  async createImageShip() {
    const texture = await new THREE.TextureLoader().loadAsync(SHIP_URL);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    const image = texture.image;
    const aspect = image.width / image.height;
    const length = this.mobile ? 7.2 : 8.8;
    const width = length * aspect;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      alphaTest: .025,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, length), material);
    mesh.name = 'CargoShipImage';
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = .07;
    mesh.renderOrder = 4;
    this.shipDimensions = { width, length };
    return mesh;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.camera.aspect = rect.width / rect.height;
    this.camera.fov = rect.width < 700 ? 40 : 31;
    this.camera.position.y = rect.width < 700 ? 27 : 25;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height, false);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1 : 1.25));
    const viewHeight = 2 * this.camera.position.y * Math.tan(THREE.MathUtils.degToRad(this.camera.fov * .5));
    const shipHalf = (this.shipDimensions?.length ?? 8.8) * .5;
    this.scrollController?.setTravelBounds(-viewHeight * .34, viewHeight * .58 + shipHalf);
  }

  setActive(active) {
    if (this.destroyed || this.visible === active) return;
    this.visible = active;
    this.wake?.setActive(active);
    if (active) {
      this.clock.getDelta();
      this.animate();
    } else {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  animate() {
    if (!this.visible || this.destroyed) return;
    const delta = Math.min(this.clock.getDelta(), .05);
    const motion = this.scrollController?.update(delta) ?? 0;
    this.ocean.update(delta);
    this.buoyancy.update(delta, this.ocean.time, motion * 2);
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.scrollController?.destroy();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.ocean?.dispose();
    this.wake?.dispose();
    this.ship?.geometry.dispose();
    this.ship?.material.map?.dispose();
    this.ship?.material.dispose();
    this.renderer?.dispose();
  }
}






