import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export class HorizontalTruckScene {
  constructor(section){
    this.section=section;
    this.stage=section?.querySelector('[data-container-crane]');
    this.trolley=section?.querySelector('[data-crane-trolley]');
    this.cargo=section?.querySelector('[data-crane-cargo]');
    this.status=section?.querySelector('[data-crane-status]');
  }
  async init(){
    if(!this.stage||!this.trolley||!this.cargo)return this;
    await Promise.all([...this.stage.querySelectorAll('img')].map(image=>image.decode().catch(()=>{})));
    this.buildTimeline();
    this.resizeObserver=new ResizeObserver(()=>this.refresh());
    this.resizeObserver.observe(this.stage);
    return this;
  }
  measure(){
    // Proporciones visibles medidas en los PNG: barra 50% del ancho y 90% de la altura.
    const cargoWidth=this.cargo.offsetWidth;
    const rigWidth=cargoWidth/.50;
    this.trolley.style.width=rigWidth+'px';
    this.trolley.style.top=(this.cargo.offsetTop-(rigWidth/1.5)*.90)+'px';
    const stage=this.stage.getBoundingClientRect();
    const pile=this.stage.querySelector('.container-crane__yard img').getBoundingClientRect();
    const cargoBottom=this.cargo.offsetTop+this.cargo.offsetHeight;
    const rigBottom=this.trolley.offsetTop+this.trolley.offsetHeight;
    this.startY=-Math.max(cargoBottom,rigBottom)-48;
    const scaleCompensation=Math.max(0,cargoWidth-410)/3;
    this.dropY=Math.max(-4,12-scaleCompensation,pile.top-stage.top-cargoBottom-this.cargo.offsetHeight*1.10);
  }
  buildTimeline(){
    this.measure();
    this.timeline=gsap.timeline({
      scrollTrigger:{trigger:this.section,start:'top top',end:'bottom bottom',scrub:.8,invalidateOnRefresh:true}
    });
    this.timeline
      .fromTo([this.trolley,this.cargo],{y:()=>this.startY},{y:()=>this.dropY-2,duration:.55,ease:'power2.out'},0)
      .to([this.trolley,this.cargo],{x:-5,duration:.12,ease:'sine.inOut'},.06)
      .to([this.trolley,this.cargo],{x:4,duration:.14,ease:'sine.inOut'},.18)
      .to([this.trolley,this.cargo],{x:-2,duration:.12,ease:'sine.inOut'},.32)
      .to([this.trolley,this.cargo],{x:0,duration:.10,ease:'sine.out'},.44)
      .to(this.cargo,{y:()=>this.dropY,duration:.04,ease:'sine.inOut'},.54)
      .to(this.stage,{'--crane-glow':1,duration:.07},.5)
      .to(this.trolley,{y:()=>this.dropY-12,duration:.06,ease:'power2.out'},.54)
      .set(this.cargo,{zIndex:1},.57)
      .set(this.status,{textContent:'Contenedor entregado'},.57)
      .to(this.trolley,{y:()=>this.startY,duration:.35,ease:'power1.inOut'},.62)
      .to(this.status,{autoAlpha:1,duration:.08},.9);
    this.timeline.progress(0);
  }
  refresh(){const progress=this.timeline?.progress()??0;this.measure();this.timeline?.invalidate().progress(progress);ScrollTrigger.refresh();}
  destroy(){this.timeline?.scrollTrigger?.kill();this.timeline?.kill();this.resizeObserver?.disconnect();}
}
















