export const DEBUG = false;
export const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const MOBILE = matchMedia('(max-width: 767px)').matches;
export const COPY = { routes: ['La red comienza en Lima.','Por aire, hacia Norteamérica.','Por mar, conectando Europa y Asia.','Cinco corredores. Una sola visión.'] };
export const ROUTES = [
 {name:'Miami',from:[-12.0464,-77.0428],to:[25.7617,-80.1918],color:0x9dffcf},
 {name:'Madrid',from:[-12.0464,-77.0428],to:[40.4168,-3.7038],color:0xd9f7e7},
 {name:'Shanghái',from:[-12.0464,-77.0428],to:[31.2304,121.4737],color:0x78cfa5},
 {name:'Ciudad de México',from:[-12.0464,-77.0428],to:[19.4326,-99.1332],color:0xa8e7c5},
 {name:'São Paulo',from:[-12.0464,-77.0428],to:[-23.5505,-46.6333],color:0xe2fff0}
];
