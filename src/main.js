import './styles/global.css';
import './logistics-road/logistics-road.css';
import './ocean-voyage/ocean-voyage.css';
import './styles/home-modern.css';
import { GlobeScene } from './globe/GlobeScene.js';
import { GlobeAnimations } from './globe/GlobeAnimations.js';
import { runLoader } from './components/loader.js';
import { preloadCritical } from './utils/preload.js';
import { LogisticsRoadScene } from './logistics-road/LogisticsRoadScene.js';
import { HorizontalTruckScene } from './partners-road/HorizontalTruckScene.js';
import { OceanVoyageScene } from './ocean-voyage/OceanVoyageScene.js';
import { HomeExperience } from './home/HomeExperience.js';
import { mountFooter } from './components/footer.js';

const globe = new GlobeScene({ container: document.querySelector('#globe') });
const logisticsRoad = new LogisticsRoadScene(document.querySelector('.logistics-road'));
const partnersRoad = new HorizontalTruckScene(document.querySelector('.partners-section'));
const oceanVoyage = new OceanVoyageScene(document.querySelector('.ocean-voyage'));
mountFooter();

// Las escenas pesadas se preparan poco antes de entrar al viewport. Así el
// primer render no descarga dos GLB y dos videos que todavía no son visibles.
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

initSceneWhenNear(logisticsRoad, logisticsRoad.section, '150% 0px');
const oceanLazyScene = initSceneWhenNear(oceanVoyage, oceanVoyage.section, '35% 0px');
initSceneWhenNear(partnersRoad, partnersRoad.section, '100% 0px');

await runLoader(Promise.all([preloadCritical(), globe.init()]));
const animations = new GlobeAnimations(globe).init();
const homeExperience = new HomeExperience().init();

// Compila y prepara la escena marÃ­tima durante tiempo ocioso, evitando que
// esa tarea coincida con el Ãºltimo tramo de scroll del camiÃ³n.
const prepareOcean = () => oceanLazyScene?.start();
if ('requestIdleCallback' in window) requestIdleCallback(prepareOcean, { timeout: 1800 });
else setTimeout(prepareOcean, 600);

window.hubWarderGlobe = globe;
window.addEventListener('pagehide', () => {
  lazyScenes.forEach(observer => observer.disconnect());
  animations.destroy();
  homeExperience.destroy();
  globe.destroy();
  logisticsRoad.destroy();
  oceanVoyage.destroy();
  partnersRoad.destroy();
}, { once: true });
