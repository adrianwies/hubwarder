import { GlobeTheme } from './GlobeTheme.js';

const majorCities = [
  { name:'Nueva York', country:'city-us-ny', lat:40.7128, lng:-74.0060, isCity:true },
  { name:'Los Ángeles', country:'city-us-la', lat:34.0522, lng:-118.2437, isCity:true },
  { name:'Ciudad de México', country:'city-mx', lat:19.4326, lng:-99.1332, isCity:true },
  { name:'Bogotá', country:'city-co', lat:4.7110, lng:-74.0721, isCity:true },
  { name:'São Paulo', country:'city-br', lat:-23.5505, lng:-46.6333, isCity:true },
  { name:'Buenos Aires', country:'city-ar', lat:-34.6037, lng:-58.3816, isCity:true },
  { name:'Santiago', country:'city-cl', lat:-33.4489, lng:-70.6693, isCity:true },
  { name:'Londres', country:'city-uk', lat:51.5074, lng:-0.1278, isCity:true },
  { name:'París', country:'city-fr', lat:48.8566, lng:2.3522, isCity:true },
  { name:'Madrid', country:'city-es', lat:40.4168, lng:-3.7038, isCity:true },
  { name:'Fráncfort', country:'city-de', lat:50.1109, lng:8.6821, isCity:true },
  { name:'Dubái', country:'city-ae', lat:25.2048, lng:55.2708, isCity:true },
  { name:'Singapur', country:'city-sg', lat:1.3521, lng:103.8198, isCity:true },
  { name:'Shanghái', country:'city-cn', lat:31.2304, lng:121.4737, isCity:true },
  { name:'Tokio', country:'city-jp', lat:35.6762, lng:139.6503, isCity:true },
  { name:'Seúl', country:'city-kr', lat:37.5665, lng:126.9780, isCity:true }
];

export class GlobeMarkers {
  constructor(globe, routes, hub, debug=false) {
    this.globe = globe;
    this.debug = debug;
    this.visible = new Set([hub.country]);
    const origins = routes.map(route => ({ ...route.origin, isHub:false, isCity:false }));
    this.markers = [{ ...hub, isHub:true, isCity:false }, ...origins, ...majorCities]
      .filter((marker, index, all) => all.findIndex(item => item.lat === marker.lat && item.lng === marker.lng) === index);
  }

  init() {
    this.globe
      .pointLat(d => d.lat)
      .pointLng(d => d.lng)
      .pointColor(d => d.isHub ? GlobeTheme.coralSoft : d.isCity ? '#FFD08A' : '#FF6A98')
      .pointRadius(d => d.isHub ? .76 : d.isCity ? .13 : .30)
      .pointAltitude(d => d.isHub ? .04 : d.isCity ? .014 : .025)
      .pointResolution(14)
      .labelLat(d => d.lat)
      .labelLng(d => d.lng)
      .labelText(d => d.isCity ? '' : d.name)
      .labelColor(d => d.isHub ? GlobeTheme.coralSoft : '#F7F9FC')
      .labelSize(d => d.isHub ? 1.3 : .82)
      .labelDotRadius(0)
      .labelAltitude(.06)
      .ringLat(d => d.lat)
      .ringLng(d => d.lng)
      .ringColor(() => t => `rgba(242,46,120,${1-t})`)
      .ringMaxRadius(3.4)
      .ringPropagationSpeed(1.55)
      .ringRepeatPeriod(1150);
    this.update();
    return this;
  }

  update() {
    const data = this.markers.filter(marker => marker.isCity || this.visible.has(marker.country));
    this.globe.pointsData(data).labelsData(data).ringsData(data.filter(marker => marker.isHub));
  }

  showMarker(country) { this.visible.add(country); this.update(); }
  hideMarker(country) { this.visible.delete(country); this.update(); }
  showAll() { this.markers.forEach(marker => this.visible.add(marker.country)); this.update(); }
  hideAll() { this.visible.clear(); this.update(); }
}