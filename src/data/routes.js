export const PERU = {
  id: 'peru',
  name: 'Per\u00fa',
  country: 'Peru',
  lat: -12.0464,
  lng: -77.0428
};

export const importOrigins = [
  { id:'china', name:'China', country:'China', lat:31.2304, lng:121.4737, type:'sea', region:'east-asia' },
  { id:'japan', name:'Jap\u00f3n', country:'Japan', lat:35.6762, lng:139.6503, type:'sea', region:'east-asia' },
  { id:'south-korea', name:'Corea del Sur', country:'South Korea', lat:37.5665, lng:126.978, type:'sea', region:'east-asia' },
  { id:'vietnam', name:'Vietnam', country:'Vietnam', lat:10.8231, lng:106.6297, type:'sea', region:'southeast-asia' },
  { id:'thailand', name:'Tailandia', country:'Thailand', lat:13.7563, lng:100.5018, type:'sea', region:'southeast-asia' },
  { id:'singapore', name:'Singapur', country:'Singapore', lat:1.3521, lng:103.8198, type:'sea', region:'southeast-asia' },
  { id:'indonesia', name:'Indonesia', country:'Indonesia', lat:-6.2088, lng:106.8456, type:'sea', region:'southeast-asia' },
  { id:'india', name:'India', country:'India', lat:19.076, lng:72.8777, type:'sea', region:'south-asia' },
  { id:'usa', name:'Estados Unidos', country:'United States of America', lat:33.749, lng:-84.388, type:'air', region:'north-america' },
  { id:'canada', name:'Canad\u00e1', country:'Canada', lat:49.2827, lng:-123.1207, type:'sea', region:'north-america' },
  { id:'mexico', name:'M\u00e9xico', country:'Mexico', lat:19.4326, lng:-99.1332, type:'air', region:'north-america' },
  { id:'panama', name:'Panam\u00e1', country:'Panama', lat:8.9824, lng:-79.5199, type:'sea', region:'central-america' },
  { id:'costa-rica', name:'Costa Rica', country:'Costa Rica', lat:9.9281, lng:-84.0907, type:'air', region:'central-america' },
  { id:'guatemala', name:'Guatemala', country:'Guatemala', lat:14.6349, lng:-90.5069, type:'air', region:'central-america' },
  { id:'honduras', name:'Honduras', country:'Honduras', lat:14.0723, lng:-87.1921, type:'sea', region:'central-america' },
  { id:'el-salvador', name:'El Salvador', country:'El Salvador', lat:13.6929, lng:-89.2182, type:'air', region:'central-america' },
  { id:'dominican-republic', name:'Rep\u00fablica Dominicana', country:'Dominican Republic', lat:18.4861, lng:-69.9312, type:'sea', region:'caribbean' },
  { id:'colombia', name:'Colombia', country:'Colombia', lat:4.711, lng:-74.0721, type:'air', region:'south-america' },
  { id:'ecuador', name:'Ecuador', country:'Ecuador', lat:-2.1709, lng:-79.9224, type:'sea', region:'south-america' },
  { id:'brazil', name:'Brasil', country:'Brazil', lat:-23.5505, lng:-46.6333, type:'land', region:'south-america' },
  { id:'chile', name:'Chile', country:'Chile', lat:-33.4489, lng:-70.6693, type:'land', region:'south-america' },
  { id:'argentina', name:'Argentina', country:'Argentina', lat:-34.6037, lng:-58.3816, type:'sea', region:'south-america' },
  { id:'uruguay', name:'Uruguay', country:'Uruguay', lat:-34.9011, lng:-56.1645, type:'sea', region:'south-america' },
  { id:'germany', name:'Alemania', country:'Germany', lat:53.5511, lng:9.9937, type:'sea', region:'europe' },
  { id:'spain', name:'Espa\u00f1a', country:'Spain', lat:40.4168, lng:-3.7038, type:'sea', region:'europe' },
  { id:'united-kingdom', name:'Reino Unido', country:'United Kingdom', lat:51.5074, lng:-0.1278, type:'sea', region:'europe' },
  { id:'france', name:'Francia', country:'France', lat:48.8566, lng:2.3522, type:'sea', region:'europe' },
  { id:'italy', name:'Italia', country:'Italy', lat:45.4642, lng:9.19, type:'sea', region:'europe' },
  { id:'netherlands', name:'Pa\u00edses Bajos', country:'Netherlands', lat:51.9244, lng:4.4777, type:'sea', region:'europe' },
  { id:'belgium', name:'B\u00e9lgica', country:'Belgium', lat:51.2194, lng:4.4025, type:'sea', region:'europe' },
  { id:'portugal', name:'Portugal', country:'Portugal', lat:38.7223, lng:-9.1393, type:'sea', region:'europe' },
  { id:'switzerland', name:'Suiza', country:'Switzerland', lat:47.3769, lng:8.5417, type:'air', region:'europe' },
  { id:'turkey', name:'Turqu\u00eda', country:'Turkey', lat:41.0082, lng:28.9784, type:'sea', region:'middle-east' },
  { id:'uae', name:'Emiratos \u00c1rabes Unidos', country:'United Arab Emirates', lat:25.2048, lng:55.2708, type:'sea', region:'middle-east' },
  { id:'south-africa', name:'Sud\u00e1frica', country:'South Africa', lat:-33.9249, lng:18.4241, type:'sea', region:'africa' },
  { id:'morocco', name:'Marruecos', country:'Morocco', lat:33.5731, lng:-7.5898, type:'sea', region:'africa' },
  { id:'egypt', name:'Egipto', country:'Egypt', lat:31.2001, lng:29.9187, type:'sea', region:'africa' },
  { id:'kenya', name:'Kenia', country:'Kenya', lat:-4.0435, lng:39.6682, type:'sea', region:'africa' },
  { id:'nigeria', name:'Nigeria', country:'Nigeria', lat:6.5244, lng:3.3792, type:'sea', region:'africa' },
  { id:'australia', name:'Australia', country:'Australia', lat:-33.8688, lng:151.2093, type:'sea', region:'oceania' }
];

export const hub = PERU;
export const routes = importOrigins.map(origin => ({
  id: `${origin.id}-peru`,
  origin,
  destination: { ...PERU },
  type: origin.type
}));
