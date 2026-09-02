import './styles/global.css';
import './logistics-road/logistics-road.css';
import './ocean-voyage/ocean-voyage.css';
import './styles/home-modern.css';
import { GlobeScene } from './globe/GlobeScene.js';
import { GlobeAnimations } from './globe/GlobeAnimations.js';
import { runLoader } from './components/loader.js';
import { preloadCritical } from './utils/preload.js';
import { HorizontalTruckScene } from './partners-road/HorizontalTruckScene.js';
import { OceanVoyageScene } from './ocean-voyage/OceanVoyageScene.js';
import { HomeExperience } from './home/HomeExperience.js';
import { mountFooter } from './components/footer.js';
import { mountWhatsApp } from './components/whatsapp.js';
import './shared/i18n.js';
import './shared/mobile-menu.js';

const globe = new GlobeScene({ container: document.querySelector('#globe') });
const partnersRoad = new HorizontalTruckScene(document.querySelector('.partners-section'));
const oceanVoyages = [new OceanVoyageScene(document.querySelector('[data-ocean-continuum]'))];
mountFooter();
mountWhatsApp();

// Las escenas pesadas se preparan poco antes de entrar al viewport. AsÃ­ el
// primer render no descarga dos GLB y dos videos que todavÃ­a no son visibles.
const lazyScenes = [];
function initSceneWhenNear(scene, element, rootMargin = '120% 0px') {
  if (!element) return null;
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    observer.disconnect();
    scene.init().catch(error => console.error('[Scene] No se pudo inicializar:', error));
  };
  const observer = new IntersectionObserver((entries) => {
    if (started || !entries[0].isIntersecting) return;
    start();
  }, { rootMargin });
  observer.observe(element);
  lazyScenes.push(observer);
  return { start };
}

await runLoader(Promise.all([preloadCritical(), globe.init(), ...oceanVoyages.map(scene => scene.init())]));

// La grúa depende de medidas reales de toda la página. Se empieza a observar
// solo después de retirar el loader para que ScrollTrigger no calcule su
// progreso contra un layout que todavía está cambiando.
initSceneWhenNear(partnersRoad, partnersRoad.section, '100% 0px');
const animations = new GlobeAnimations(globe).init();
const homeExperience = new HomeExperience().init();

window.hubWarderGlobe = globe;
window.addEventListener('pagehide', () => {
  lazyScenes.forEach(observer => observer.disconnect());
  animations.destroy();
  homeExperience.destroy();
  globe.destroy();
  oceanVoyages.forEach(scene => scene.destroy());
  partnersRoad.destroy();
}, { once: true });










