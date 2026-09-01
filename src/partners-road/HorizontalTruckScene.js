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
    ScrollTrigger.refresh();
    this.section.classList.remove('is-crane-pending');
    this.section.classList.add('is-crane-ready');
    this.resizeObserver=new ResizeObserver(()=>this.refresh());
    this.resizeObserver.observe(this.stage);
    return this;
  }
  measure(){
    const stage=this.stage.getBoundingClientRect();
    const pileImage=this.stage.querySelector('.container-crane__yard img');
    const pileBox=pileImage.getBoundingClientRect();
    const naturalRatio=(pileImage.naturalWidth&&pileImage.naturalHeight)
      ? pileImage.naturalWidth/pileImage.naturalHeight
      : pileBox.width/pileBox.height;
    let pileWidth=pileBox.width;
    let pileHeight=pileWidth/naturalRatio;
    if(pileHeight>pileBox.height){
      pileHeight=pileBox.height;
      pileWidth=pileHeight*naturalRatio;
    }
    const pileTop=pileBox.bottom-pileHeight;
    const cargoWidth=Math.max(110,Math.min(pileWidth*.44,stage.width*.46,stage.height*.78));
    this.cargo.style.width=cargoWidth+'px';
    this.cargo.style.top=Math.min(180,Math.max(96,stage.height*.25))+'px';
    const rigWidth=cargoWidth/.50;
    this.trolley.style.width=rigWidth+'px';
    const gripOffset=this.cargo.offsetHeight*.14;
    this.trolley.style.top=(this.cargo.offsetTop-(rigWidth/1.5)*.90+gripOffset)+'px';
    const cargoBottom=this.cargo.offsetTop+this.cargo.offsetHeight;
    const rigBottom=this.trolley.offsetTop+this.trolley.offsetHeight;
    const landingOverlap=Math.max(12,this.cargo.offsetHeight*.10);
    this.startY=-Math.max(cargoBottom,rigBottom)-48;
    this.dropY=pileTop-stage.top-cargoBottom+landingOverlap;
  }
  buildTimeline(){
    this.measure();
    this.timeline=gsap.timeline({
      scrollTrigger:{trigger:this.section,start:'top top',end:'bottom bottom',scrub:.8,invalidateOnRefresh:true}
    });
    this.timeline
      .set(this.status,{autoAlpha:0},0)
      .set([this.trolley,this.cargo],{xPercent:-50,x:0,y:()=>this.startY},0)
      .to([this.trolley,this.cargo],{x:-5,y:()=>this.startY+(this.dropY-this.startY)*.28,duration:.14,ease:'sine.inOut'},0)
      .to([this.trolley,this.cargo],{x:4,y:()=>this.startY+(this.dropY-this.startY)*.56,duration:.14,ease:'sine.inOut'},.14)
      .to([this.trolley,this.cargo],{x:-2,y:()=>this.startY+(this.dropY-this.startY)*.80,duration:.13,ease:'sine.inOut'},.28)
      .to([this.trolley,this.cargo],{x:0,y:()=>this.dropY-2,duration:.14,ease:'power2.out'},.41)
      .to(this.cargo,{y:()=>this.dropY,duration:.04,ease:'sine.inOut'},.54)
      .to(this.stage,{'--crane-glow':1,duration:.07},.5)
      .to(this.trolley,{y:()=>this.dropY-12,duration:.06,ease:'power2.out'},.54)
      .set(this.cargo,{zIndex:1},.57)
      .set(this.status,{textContent:'Contenedor entregado'},.57)
      .to(this.trolley,{y:()=>this.startY,duration:.35,ease:'power1.inOut'},.62)
      .to(this.status,{autoAlpha:1,duration:.08},.9);
    this.timeline.progress(0);
  }
  refresh(){
    if(this.refreshFrame)return;
    this.refreshFrame=requestAnimationFrame(()=>{
      this.refreshFrame=0;
      const progress=this.timeline?.progress()??0;
      this.measure();
      this.timeline?.invalidate().progress(progress);
      ScrollTrigger.refresh();
    });
  }
  destroy(){
    if(this.refreshFrame)cancelAnimationFrame(this.refreshFrame);
    this.timeline?.scrollTrigger?.kill();
    this.timeline?.kill();
    this.resizeObserver?.disconnect();
  }
}
















