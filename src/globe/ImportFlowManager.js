import gsap from 'gsap';

export const DEBUG_IMPORT_FLOW = false;

export const FLOW_CONFIG = Object.freeze({
  minActiveRoutes: 5,
  maxActiveRoutes: 5,
  minSpawnDelay: .8,
  maxSpawnDelay: 1.8,
  minTravelDuration: 3.5,
  maxTravelDuration: 6.5,
  fadeDuration: .8,
  arrivalHold: .32,
  recentOriginCount: 3
});

const randomBetween = (min, max) => min + Math.random() * (max - min);
const randomInteger = (min, max) => Math.floor(randomBetween(min, max + 1));

export class ImportFlowManager {
  constructor({ routes, origins, config={} }) {
    this.routeSystem = routes;
    this.origins = origins;
    this.config = { ...FLOW_CONFIG, ...config };
    this.activeRoutes = new Map();
    this.recentOrigins = [];
    this.previousOriginId = null;
    this.running = false;
    this.paused = false;
    this.nextSpawnCall = null;
    this.bootstrapCalls = [];
    this.pulseTween = null;
    this.targetActiveRoutes = this.randomTarget();
    this.wasRunningBeforeHidden = false;
    this.visibilityHandler = () => this.handleVisibilityChange();
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.targetActiveRoutes = this.randomTarget();
    this.bootstrapCalls.forEach(call => call.kill());
    this.bootstrapCalls = Array.from({ length:this.config.minActiveRoutes }, (_item, index) =>
      gsap.delayedCall(index * .35, () => this.running && !this.paused && this.spawnRandomRoute())
    );
    this.scheduleNextRoute();
  }

  stop() {
    this.running = false;
    this.paused = false;
    this.nextSpawnCall?.kill();
    this.nextSpawnCall = null;
    this.bootstrapCalls.forEach((call) => call.kill());
    this.bootstrapCalls.length = 0;
    this.pulseTween?.kill();
    this.pulseTween = null;
    this.activeRoutes.forEach((_origin, routeId) => this.routeSystem.resetRoute(routeId));
    this.activeRoutes.clear();
  }

  pause() {
    if (!this.running || this.paused) return;
    this.paused = true;
    this.nextSpawnCall?.pause();
    this.bootstrapCalls.forEach((call) => call.pause());
    this.pulseTween?.pause();
    this.routeSystem.pauseAllRoutes();
  }

  resume() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.nextSpawnCall?.resume();
    this.bootstrapCalls.forEach((call) => call.resume());
    this.pulseTween?.resume();
    this.routeSystem.resumeAllRoutes();
    if (!this.nextSpawnCall) this.scheduleNextRoute();
  }

  setMaxActiveRoutes(max) {
    this.config.maxActiveRoutes = Math.max(this.config.minActiveRoutes, Math.floor(max));
    this.targetActiveRoutes = Math.min(this.targetActiveRoutes, this.config.maxActiveRoutes);
  }

  setSpawnInterval(min, max) {
    this.config.minSpawnDelay = Math.max(.1, min);
    this.config.maxSpawnDelay = Math.max(this.config.minSpawnDelay, max);
  }

  scheduleNextRoute(delay=randomBetween(this.config.minSpawnDelay, this.config.maxSpawnDelay)) {
    this.nextSpawnCall?.kill();
    if (!this.running) return;
    this.nextSpawnCall = gsap.delayedCall(delay, () => {
      this.nextSpawnCall = null;
      if (!this.running || this.paused) return;
      if (this.activeRoutes.size < this.targetActiveRoutes) this.spawnRandomRoute();
      else this.targetActiveRoutes = this.randomTarget();
      this.debugState(delay);
      const refillDelay = this.activeRoutes.size < this.config.minActiveRoutes
        ? randomBetween(.12, .32)
        : randomBetween(this.config.minSpawnDelay, this.config.maxSpawnDelay);
      this.scheduleNextRoute(refillDelay);
    });
  }

  spawnRandomRoute() {
    if (!this.running || this.paused || this.activeRoutes.size >= this.config.maxActiveRoutes) return null;
    const origin = this.getRandomOrigin();
    if (!origin) return null;
    const routeId = `${origin.id}-peru`;
    const duration = randomBetween(this.config.minTravelDuration, this.config.maxTravelDuration);
    this.activeRoutes.set(routeId, origin.id);
    this.rememberOrigin(origin.id);

    this.routeSystem.playImport(routeId, {
      duration,
      fadeDuration: this.config.fadeDuration,
      arrivalHold: this.config.arrivalHold,
      onArrival: () => this.pulsePeru(),
      onComplete: () => {
        this.activeRoutes.delete(routeId);
        this.targetActiveRoutes = this.randomTarget();
        if (this.running && !this.paused && this.activeRoutes.size < this.config.maxActiveRoutes) {
          // Repone esta ruta de forma individual; no espera a que termine el grupo.
          this.scheduleNextRoute(randomBetween(.12, .3));
        }
      }
    });
    if (DEBUG_IMPORT_FLOW) console.info(`[ImportFlow] ${origin.name} → Per\u00fa`);
    return routeId;
  }

  getRandomOrigin() {
    const activeOriginIds = new Set(this.activeRoutes.values());
    const activeRegions = new Set(
      [...activeOriginIds]
        .map(id => this.origins.find(origin => origin.id === id)?.region)
        .filter(Boolean)
    );
    let candidates = this.origins.filter(origin =>
      !activeOriginIds.has(origin.id) &&
      origin.id !== this.previousOriginId &&
      !this.recentOrigins.includes(origin.id) &&
      !activeRegions.has(origin.region)
    );
    // Si ya hay una ruta por cada región disponible, permite repetir región,
    // pero nunca el mismo país que continúa activo.
    if (!candidates.length) candidates = this.origins.filter(origin => !activeOriginIds.has(origin.id) && origin.id !== this.previousOriginId);
    if (!candidates.length) candidates = this.origins.filter(origin => !activeOriginIds.has(origin.id));
    return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
  }

  rememberOrigin(id) {
    this.previousOriginId = id;
    this.recentOrigins.push(id);
    this.recentOrigins = this.recentOrigins.slice(-this.config.recentOriginCount);
  }

  pulsePeru() {
    const pin = document.querySelector('.hero__location-pin');
    if (!pin) return;
    this.pulseTween?.kill();
    this.pulseTween = gsap.timeline().to(pin, { filter:'brightness(1.22)', duration:.18, ease:'power2.out' })
      .to(pin, { filter:'brightness(1)', duration:.24, ease:'power2.inOut' });
  }

  randomTarget() {
    return randomInteger(this.config.minActiveRoutes, this.config.maxActiveRoutes);
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.wasRunningBeforeHidden = this.running && !this.paused;
      if (this.wasRunningBeforeHidden) this.pause();
    } else if (this.wasRunningBeforeHidden) {
      this.wasRunningBeforeHidden = false;
      this.resume();
    }
  }

  debugState(nextSpawnDelay) {
    if (!DEBUG_IMPORT_FLOW) return;
    console.table({
      activeRoutes: this.activeRoutes.size,
      poolSize: this.routeSystem.poolSize,
      previousOrigin: this.previousOriginId,
      nextSpawnDelay: Number(nextSpawnDelay.toFixed(2))
    });
  }

  destroy() {
    this.stop();
    document.removeEventListener('visibilitychange', this.visibilityHandler);
  }
}
