# Hub Warder — Global Import Network

Hero WebGL para una empresa peruana de importación. Implementado con Vite, JavaScript, Three.js, three-globe, GSAP ScrollTrigger y OrbitControls.

## Instalación

```bash
npm install
npm run dev
```

Compilación:

```bash
npm run build
```

## Personalización

- Países, coordenadas y rutas: `src/data/routes.js`.
- Paleta del globo: `src/globe/GlobeTheme.js`.
- Variables CSS y colores de interfaz: `src/styles/global.css`.
- Secuencia y velocidad del scroll: `src/globe/GlobeAnimations.js`.
- Velocidad de arcos: `arcDashAnimateTime(2600)` en `src/globe/GlobeRoutes.js`.
- Rotación automática y OrbitControls: `src/globe/GlobeController.js`.
- GeoJSON local: `public/data/countries.geojson` (Natural Earth 1:110m).
- Debug: cambia `DEBUG` en `src/config.js`.

## Añadir una ruta

Agrega un objeto al array `routes` de `src/data/routes.js`:

```js
{
  id: 'mexico-peru',
  origin: {
    name: 'México',
    country: 'Mexico',
    lat: 19.4326,
    lng: -99.1332
  },
  destination: {
    name: 'Perú',
    country: 'Peru',
    lat: -12.0464,
    lng: -77.0428
  },
  type: 'sea'
}
```

No es necesario modificar el renderer.

## API

```js
const globe = window.hubWarderGlobe;
globe.focusCountry('Peru');
globe.showRoute('china-peru');
globe.hideRoute('china-peru');
globe.showAllRoutes();
globe.enableInteraction();
globe.disableInteraction();
```

En una integración independiente:

```js
const globe = new GlobeScene({ container: document.querySelector('#globe') });
await globe.init();
```

Llama `globe.destroy()` al desmontar el componente.
