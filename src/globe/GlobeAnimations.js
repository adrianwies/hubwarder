import gsap from 'gsap';

export class GlobeAnimations {
  constructor(globe) { this.globe = globe; }

  init() {
    const globe = this.globe;
    globe.startImportFlow();
    globe.markers.showAll();
    globe.clearHighlights();
    globe.highlightCountry('Peru');

    gsap.set('[data-stage-progress]', { scaleX: 1 });
    this.intro = gsap.timeline()
      .from('.hero__content > *', {
        opacity: 0,
        y: 25,
        stagger: 0.075,
        duration: 0.75,
        ease: 'power3.out'
      })
      .from('.hero__planet-wrap', {
        opacity: 0,
        scale: 0.96,
        duration: 1.1,
        ease: 'power2.out'
      }, 0)
      .from('.hero__vehicles', {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out'
      }, 0.2);

    return this;
  }

  destroy() { this.intro?.kill(); }
}