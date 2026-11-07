/* Real exercise photos, alternating between starting and finishing positions. Source: yuhonas/free-exercise-db. */
(function(){
 const source="https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
 const paths={
  squat:"Goblet_Squat",row:"One-Arm_Dumbbell_Row",bridge:"Butt_Lift_Bridge",
  press:"Dumbbell_Floor_Press",deadbug:"Dead_Bug",
  hinge:"Romanian_Deadlift",calf:"Standing_Calf_Raises"
 };
 const fallback=art;
 const artById={goblet:"squat",row:"row",bridge:"bridge",floorpress:"press",deadbug:"deadbug",hinge:"hinge",calf:"calf","bird-dog":"bird-dog"};
 EXERCISES.forEach(ex=>{ex.art=artById[ex.id]||ex.art});
 art=function(type){
  if(!paths[type])return fallback(type);
  const p=source+paths[type]+"/";
  const alt=type==="hinge"?"Demonstração com peso; começa sem peso":type==="row"?"Remada unilateral":type==="press"?"Press de peito":type==="squat"?"Agachamento":type==="bridge"?"Ponte de glúteos":type==="deadbug"?"Dead bug":"Elevação de gémeos";
  return '<div class="real-demo" role="img" aria-label="'+alt+' em duas posições"><img loading="lazy" class="pose pose-a" src="'+p+'0.jpg" alt=""><img loading="lazy" class="pose pose-b" src="'+p+'1.jpg" alt="" onerror="this.parentElement.classList.add(\'photo-error\')"><span class="demo-tag">INÍCIO ↔ FIM</span><div class="photo-fallback">'+fallback(type)+'</div></div>';
 };
 const previousOpen=openExercise;
 openExercise=function(id){
  previousOpen(id);
  const ex=EXERCISES.find(item=>item.id===id);
  if(!ex)return;
  const container=document.getElementById("dialogContent");
  const old=container.querySelector(".dialog-meta");
  if(old){
   old.outerHTML='<div class="training-summary"><div class="training-stat"><span>SÉRIES</span><strong>'+ex.sets+'</strong></div><div class="training-stat"><span>REPETIÇÕES</span><strong>'+esc(ex.reps)+'</strong></div></div><div class="training-equipment"><strong>Equipamento:</strong> '+esc(ex.gear)+'</div>';
  }
  const done=container.querySelector("[data-dialog-done]");
  if(done)done.textContent="✓ Terminei este exercício";
 };
 const renderOld=render;
 render=function(){renderOld()};
 render();
 const info=document.querySelector("#libraryView .page-intro p:last-child");
 if(info)info.textContent="Fotografias reais de duas fases do movimento. Toca no exercício para ver as instruções.";
 const settings=document.querySelector("#settingsView .version");
 if(settings)settings.insertAdjacentHTML("beforebegin",'<p class="muted media-credit">Fotografias dos exercícios: <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener noreferrer">Free Exercise DB</a>. As imagens requerem ligação à Internet na primeira visualização.</p>');
})();