export const PERU = {
  id: 'peru',
  name: 'Perú',
  country: 'Peru',
  lat: -12.0464,
  lng: -77.0428
};

export const importOrigins = [
  { id:'china', name:'China', country:'China', lat:31.2304, lng:121.4737, type:'sea' },
  { id:'usa', name:'Estados Unidos', country:'United States of America', lat:33.749, lng:-84.388, type:'air' },
  { id:'japan', name:'Japón', country:'Japan', lat:35.6762, lng:139.6503, type:'sea' },
  { id:'south-korea', name:'Corea del Sur', country:'South Korea', lat:37.5665, lng:126.978, type:'sea' },
  { id:'germany', name:'Alemania', country:'Germany', lat:53.5511, lng:9.9937, type:'sea' },
  { id:'spain', name:'España', country:'Spain', lat:40.4168, lng:-3.7038, type:'sea' },
  { id:'brazil', name:'Brasil', country:'Brazil', lat:-23.5505, lng:-46.6333, type:'land' },
  { id:'chile', name:'Chile', country:'Chile', lat:-33.4489, lng:-70.6693, type:'land' }
];

export const hub = PERU;
export const routes = importOrigins.map(origin => ({
  id: `${origin.id}-peru`,
  origin,
  destination: { ...PERU },
  type: origin.type
}));