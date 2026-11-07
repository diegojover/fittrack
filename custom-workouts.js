/* FitTrack 1.3 — editable plans and sets/reps, saved in the existing local backup. */
(function(){
 const planDefaults={A:[...PLANS.A],B:[...PLANS.B],C:[...PLANS.C]};
 state.customPlans=state.customPlans||{};
 state.exerciseTargets=state.exerciseTargets||{};
 const plans=()=>Object.fromEntries(["A","B","C"].map(k=>[k,state.customPlans[k]||planDefaults[k]]));
 planIds=function(date){const p=planFor(date);return p?[...(plans()[p]||[])]:[]};
 const target=(id)=>{const ex=EXERCISES.find(x=>x.id===id);return state.exerciseTargets[id]||{sets:ex.sets,reps:ex.reps}};
 const safeNumber=(x,min,max)=>Number.isInteger(Number(x))&&Number(x)>=min&&Number(x)<=max;
 const originalCard=card;
 card=function(ex,date,done){const t=target(ex.id),copy={...ex,sets:t.sets,reps:t.reps};return originalCard(copy,date,done)};
 const originalHome=renderHome;
 renderHome=function(){
  originalHome();
  document.querySelectorAll("#todayWorkout .exercise-card").forEach(node=>{
   const id=node.querySelector("[data-toggle]")?.dataset.toggle;
   if(!id)return;
   const t=target(id);
   const meta=node.querySelector(".exercise-meta");
   if(meta)meta.innerHTML='<span class="mini-tag">'+esc(t.sets)+' séries</span><span class="mini-tag">'+esc(t.reps)+'</span>';
  });
 };
 const originalLibrary=renderLibrary;
 renderLibrary=function(){
  originalLibrary();
  document.querySelectorAll("#libraryList .exercise-card").forEach(node=>{
   const id=node.querySelector("[data-detail]")?.dataset.detail;
   if(!id)return;
   const ex=EXERCISES.find(x=>x.id===id),t=target(id);
   const meta=node.querySelector(".exercise-meta");
   if(meta)meta.insertAdjacentHTML("beforeend",'<span class="mini-tag">'+esc(t.sets)+' × '+esc(t.reps)+'</span>');
  });
 };
 const originalOpen=openExercise;
 openExercise=function(id){
  originalOpen(id);
  const ex=EXERCISES.find(x=>x.id===id);
  if(!ex)return;
  const t=target(id),dialog=document.getElementById("dialogContent");
  const stats=dialog.querySelectorAll(".training-stat strong");
  if(stats.length===2){stats[0].textContent=t.sets;stats[1].textContent=t.reps}
  else{
   const meta=dialog.querySelector(".dialog-meta");
   if(meta)meta.textContent=t.sets+" séries · "+t.reps+" · "+ex.gear;
  }
  const heading=dialog.querySelector("h2");
  if(heading)heading.insertAdjacentHTML("afterend",'<button type="button" class="secondary-btn edit-target-btn" data-edit-exercise="'+esc(id)+'">✎ Alterar séries e repetições</button>');
 };
 const section=document.querySelector("#settingsView .page-intro");
 section.insertAdjacentHTML("afterend",'<section class="panel plan-editor"><h3>Personalizar os treinos</h3><p class="muted">Escolhe o treino e adiciona ou retira exercícios. As alterações são guardadas neste telemóvel e incluídas nas cópias de segurança.</p><label for="editPlanSelect">Treino</label><select id="editPlanSelect"><option value="A">A — segunda-feira</option><option value="B">B — quarta-feira</option><option value="C">C — sexta-feira</option></select><div id="editableExercises"></div><label for="addExerciseSelect">Adicionar exercício</label><div class="plan-add-row"><select id="addExerciseSelect"></select><button type="button" class="primary-btn" id="addExerciseBtn">Adicionar</button></div><button type="button" class="secondary-btn" id="resetPlanBtn">Repor plano original deste dia</button></section>');
 const select=document.getElementById("editPlanSelect"),list=document.getElementById("editableExercises"),add=document.getElementById("addExerciseSelect");
 function refreshEditor(){
  const p=select.value,ids=plans()[p];
  list.innerHTML=ids.map(id=>{
   const ex=EXERCISES.find(e=>e.id===id);if(!ex)return"";
   const t=target(id);
   return '<div class="edit-exercise-row"><div><strong>'+esc(ex.name)+'</strong><small>'+esc(t.sets)+' séries · '+esc(t.reps)+'</small></div><button class="secondary-btn" data-edit-exercise="'+esc(id)+'">Editar</button><button class="danger-btn" data-remove-exercise="'+esc(id)+'" aria-label="Retirar '+esc(ex.name)+'">×</button></div>';
  }).join("")||'<p class="muted">Sem exercícios neste treino.</p>';
  add.innerHTML=EXERCISES.filter(e=>!ids.includes(e.id)).map(e=>'<option value="'+esc(e.id)+'">'+esc(e.name)+'</option>').join("");
  document.getElementById("addExerciseBtn").disabled=!add.options.length;
 }
 select.addEventListener("change",refreshEditor);
 document.getElementById("addExerciseBtn").addEventListener("click",()=>{
  const p=select.value,id=add.value;if(!id)return;
  state.customPlans[p]=[...plans()[p],id];save();refreshEditor();render();
 });
 document.getElementById("resetPlanBtn").addEventListener("click",()=>{
  if(!confirm("Repor a lista original do treino "+select.value+"? Os registos anteriores não serão apagados."))return;
  delete state.customPlans[select.value];save();refreshEditor();render();
 });
 document.addEventListener("click",event=>{
  const remove=event.target.closest("[data-remove-exercise]");
  if(remove){
   const p=select.value;
   state.customPlans[p]=plans()[p].filter(id=>id!==remove.dataset.removeExercise);
   save();refreshEditor();render();
  }
  const edit=event.target.closest("[data-edit-exercise]");
  if(edit){
   const id=edit.dataset.editExercise,ex=EXERCISES.find(e=>e.id===id);if(!ex)return;
   const t=target(id);
   const sets=prompt("Quantas séries para "+ex.name+"? (1–10)",String(t.sets));
   if(sets===null)return;
   if(!safeNumber(sets,1,10)){toast("Indica entre 1 e 10 séries.");return}
   const reps=prompt("Repetições (ex.: 12 repetições ou 10 por lado)",String(t.reps));
   if(reps===null)return;
   if(!reps.trim()||reps.length>40){toast("Indica repetições válidas.");return}
   state.exerciseTargets[id]={sets:Number(sets),reps:reps.trim()};
   save();refreshEditor();render();
   if(document.getElementById("exerciseDialog").open){const stats=document.querySelectorAll("#dialogContent .training-stat strong");if(stats.length===2){stats[0].textContent=sets;stats[1].textContent=reps.trim()}const meta=document.querySelector("#dialogContent .dialog-meta");if(meta)meta.textContent=sets+" séries · "+reps.trim()+" · "+ex.gear;}
   toast("Objetivo do exercício atualizado");
  }
 });
 // Accurate, purpose-drawn Bird Dog fallback: quadruped with opposite arm and leg extended.
 const previousArt=art;
 art=function(type){
  if(type!=="bird-dog")return previousArt(type);
  return '<svg viewBox="0 0 240 180" role="img" aria-label="Bird dog: em quatro apoios, estende um braço e a perna contrária" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="180" rx="15" fill="#e8f1eb"/><path d="M18 151H220" stroke="#abc7b4" stroke-width="3"/><g fill="none" stroke="#285d49" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M74 81L145 83"/><path d="M88 83L82 122L73 145"/><path d="M139 85L150 118L145 145"/><path d="M113 82L173 61L216 57"/><path d="M145 83L180 87L222 104"/></g><circle cx="62" cy="75" r="16" fill="#e8b894" stroke="#285d49" stroke-width="4"/><text x="15" y="20" fill="#285d49" font-size="11" font-weight="700">BIRD DOG · BRAÇO E PERNA OPOSTOS</text></svg>';
 };
 const previousRender=render;
 render=function(){previousRender();refreshEditor()};
 refreshEditor();render();
})();