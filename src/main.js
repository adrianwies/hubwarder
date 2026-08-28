import './styles/global.css';
import './logistics-road/logistics-road.css';
import './partners-road/partners-road.css';
import { GlobeScene } from './globe/GlobeScene.js';
import { GlobeAnimations } from './globe/GlobeAnimations.js';
import { runLoader } from './components/loader.js';
import { preloadCritical } from './utils/preload.js';
import { LogisticsRoadScene } from './logistics-road/LogisticsRoadScene.js';
import { HorizontalTruckScene } from './partners-road/HorizontalTruckScene.js';

const globe = new GlobeScene({ container: document.querySelector('#globe') });
const logisticsRoad = new LogisticsRoadScene(document.querySelector('.logistics-road'));
const partnersRoad = new HorizontalTruckScene(document.querySelector('.partners-section'));
await runLoader(Promise.all([preloadCritical(), globe.init(), logisticsRoad.init(), partnersRoad.init()]));
const animations = new GlobeAnimations(globe).init();

window.hubWarderGlobe = globe;
window.addEventListener('pagehide', () => {
  animations.destroy();
  globe.destroy();
  logisticsRoad.destroy();
  partnersRoad.destroy();
}, { once: true });