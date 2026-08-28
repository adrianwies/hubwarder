export async function preloadCritical(){
  if(document.fonts?.ready) await document.fonts.ready;
  await new Promise(requestAnimationFrame);
}
