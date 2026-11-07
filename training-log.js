/* FitTrack 1.4 — series tracking, loads, and custom exercises. */
(function(){
 const normalize=()=>{
  state.customExercises=Array.isArray(state.customExercises)?state.customExercises:[];
  state.seriesLog=state.seriesLog&&typeof state.seriesLog==="object"?state.seriesLog:{};
  state.customExercises.forEach(ex=>{if(ex&&typeof ex.id==="string"&&!EXERCISES.some(x=>x.id===ex.id))EXERCISES.push(ex)});
 };
 normalize();
 let contextDate=null;
 const currentDate=()=>contextDate||((document.querySelector("#calendarView.active")&&selectedDate)?selectedDate:iso(homeDate));
 const setsFor=id=>Math.max(1,Math.min(10,Number(state.exerciseTargets?.[id]?.sets||EXERCISES.find(x=>x.id===id)?.sets||2)));
 const getEntries=(day,id)=>state.seriesLog?.[day]?.[id]||[];
 const count=(day,id)=>getEntries(day,id).filter(x=>x?.done).length;
 const fmt=v=>Number(v).toLocaleString("pt-PT",{maximumFractionDigits:2});
 function seriesMarkup(id,day){
  const ex=EXERCISES.find(e=>e.id===id);if(!ex)return"";
  const n=setsFor(id),entries=getEntries(day,id);
  const previous=Object.keys(state.seriesLog).filter(d=>d<day&&state.seriesLog[d]?.[id]?.some(s=>s.done)).sort().at(-1);
  const last=previous?state.seriesLog[previous][id].find(s=>s.done&&s.kg!=null):null;
  const hint=last?fmt(last.kg):"";
  return '<section class="set-tracker"><h3>Registar séries</h3><p class="muted">Marca cada série realizada. O peso é opcional e corresponde ao peso de <strong>cada halter</strong>, não à soma.</p><div class="set-list">'+Array.from({length:n},(_,i)=>{
   const row=entries[i]||{},checked=!!row.done;
   return '<div class="set-row"><label class="set-check"><input type="checkbox" data-series-done="'+i+'" '+(checked?"checked":"")+'><span>Série '+(i+1)+'</span></label><label class="set-weight">kg/halter<input type="number" inputmode="decimal" min="0" max="150" step="0.5" placeholder="'+hint+'" data-series-kg="'+i+'" value="'+(row.kg===null||row.kg===undefined?"":esc(row.kg))+'"></label></div>';
  }).join("")+'</div><div class="set-progress"><strong id="setProgressCount">'+count(day,id)+' de '+n+' séries feitas</strong><span>Objetivo: '+esc(state.exerciseTargets?.[id]?.reps||ex.reps)+'</span></div><p class="muted">Os registos são guardados ao marcar a série ou alterar o peso.</p></section>';
 }
 const oldOpen=openExercise;
 openExercise=function(id){
  contextDate=currentDate();
  oldOpen(id);
  const container=document.getElementById("dialogContent");
  const button=container.querySelector("[data-dialog-done]");
  if(button)button.dataset.targetDate=contextDate;
  const reference=container.querySelector(".tip")||button;
  if(reference)reference.insertAdjacentHTML("afterend",seriesMarkup(id,contextDate));
  const end=container.querySelector("[data-dialog-done]");
  if(end){
   end.textContent="✓ Concluir exercício";
   end.disabled=count(contextDate,id)<setsFor(id);
   end.title="Marca todas as séries para concluir";
  }
  container.dataset.activeExercise=id;
 };
 function syncExerciseCompletion(day,id){
  const total=setsFor(id),completed=count(day,id);
  const log=getLog(dateFrom(day));
  if(completed>=total&&!log.done.includes(id))log.done.push(id);
  if(completed<total)log.done=log.done.filter(x=>x!==id);
  state.logs[day]=log;
 }
 document.addEventListener("change",event=>{
  const checkbox=event.target.closest("[data-series-done]"),weight=event.target.closest("[data-series-kg]");
  if(!checkbox&&!weight)return;
  const id=document.getElementById("dialogContent").dataset.activeExercise,day=contextDate;
  if(!id||!day)return;
  const i=Number((checkbox||weight).dataset[checkbox?"seriesDone":"seriesKg"]);
  state.seriesLog[day]??={};
  const rows=state.seriesLog[day][id]||[];
  while(rows.length<setsFor(id))rows.push({done:false,kg:null});
  if(checkbox)rows[i].done=checkbox.checked;
  if(weight){
   const raw=weight.value.trim();
   if(raw!==""&&(!Number.isFinite(Number(raw))||Number(raw)<0||Number(raw)>150)){toast("Peso inválido (0–150 kg)");weight.value="";return}
   rows[i].kg=raw===""?null:Number(raw);
  }
  state.seriesLog[day][id]=rows;
  syncExerciseCompletion(day,id);
  save();
  const done=count(day,id),total=setsFor(id);
  const label=document.getElementById("setProgressCount");
  if(label)label.textContent=done+" de "+total+" séries feitas";
  const button=document.querySelector("#dialogContent [data-dialog-done]");
  if(button)button.disabled=done<total;
  render();
  if(done===total)toast("Todas as séries concluídas!");
 });
 // Existing delegated handler closes the dialog on completion; keep it available once all sets are checked.
 document.addEventListener("click",event=>{
  const b=event.target.closest("[data-detail]");
  if(b){
   contextDate=b.closest("#selectedDayPanel")?selectedDate:homeDate?iso(homeDate):iso(new Date());
  }
 },true);
 const close=document.getElementById("closeDialog");
 close.addEventListener("click",()=>{contextDate=null});
 const customPanel=document.querySelector(".plan-editor");
 customPanel.insertAdjacentHTML("afterend",'<section class="panel custom-exercise-panel"><h3>Criar exercício</h3><p class="muted">Cria um exercício teu e adiciona-o depois a qualquer treino. Sem fotografia automática.</p><form id="newExerciseForm"><label>Nome<input name="name" maxlength="70" required placeholder="Ex.: Caminhada com halteres"></label><label>Categoria<select name="category"><option>Pernas</option><option>Costas</option><option>Core</option><option>Peito</option><option>Outros</option></select></label><div class="custom-fields"><label>Séries<input name="sets" type="number" min="1" max="10" value="2" required></label><label>Repetições<input name="reps" maxlength="40" value="10 repetições" required></label></div><label>Equipamento<input name="gear" maxlength="80" placeholder="Ex.: halteres leves"></label><label>Como executar<textarea name="steps" rows="3" maxlength="800" placeholder="Uma instrução por linha" required></textarea></label><button type="submit" class="primary-btn">Criar exercício</button></form></section>');
 document.getElementById("newExerciseForm").addEventListener("submit",event=>{
  event.preventDefault();
  const data=new FormData(event.currentTarget),name=String(data.get("name")||"").trim(),steps=String(data.get("steps")||"").split(/\n+/).map(x=>x.trim()).filter(Boolean),sets=Number(data.get("sets")),reps=String(data.get("reps")||"").trim();
  if(name.length<3||!steps.length||!Number.isInteger(sets)||sets<1||sets>10||!reps){toast("Verifica os campos do exercício");return}
  const ex={id:"custom-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),name,category:String(data.get("category")),sets,reps,gear:String(data.get("gear")||"Sem equipamento"),desc:"Exercício personalizado",steps,tip:"Executa o movimento de forma controlada e interrompe se causar dor.",art:"custom"};
  state.customExercises.push(ex);EXERCISES.push(ex);save();event.currentTarget.reset();render();toast("Exercício criado! Adiciona-o ao treino em cima.");
 });
 const oldArt=art;
 art=function(type){
  if(type!=="custom")return oldArt(type);
  return '<div class="custom-art"><span aria-hidden="true">＋</span><small>Exercício personalizado</small></div>';
 };
 // After importing a backup, rebuild custom exercises in the in-memory catalogue.
 document.getElementById("importInput").addEventListener("change",()=>setTimeout(()=>{normalize();render()},100),true);
 const progress=document.getElementById("progressView");
 const chart=progress.querySelector(".chart-panel");
 chart.insertAdjacentHTML("afterend",'<section class="panel strength-panel"><h3>Evolução da força</h3><p class="muted">Peso por halter nas séries concluídas. O gráfico não inclui séries sem peso registado.</p><label for="strengthExercise">Exercício</label><select id="strengthExercise"></select><div id="strengthChart"></div><div id="strengthHistory"></div></section>');
 function renderStrength(){
  const select=document.getElementById("strengthExercise"),old=select.value;
  select.innerHTML=EXERCISES.map(ex=>'<option value="'+esc(ex.id)+'">'+esc(ex.name)+'</option>').join("");
  if(EXERCISES.some(ex=>ex.id===old))select.value=old;
  const id=select.value;
  const points=Object.entries(state.seriesLog||{}).flatMap(([day,entries])=>(entries?.[id]||[]).filter(s=>s?.done&&Number.isFinite(s.kg)&&s.kg!==null).map(s=>({day,kg:Number(s.kg)}))).sort((a,b)=>a.day.localeCompare(b.day));
  const byDay=[...new Map(points.map(p=>[p.day,{day:p.day,kg:Math.max(...points.filter(x=>x.day===p.day).map(x=>x.kg))}])).values()];
  const el=document.getElementById("strengthChart"),history=document.getElementById("strengthHistory");
  if(!byDay.length){el.innerHTML='<p class="muted">Ainda não tens séries concluídas com peso registado neste exercício.</p>';history.innerHTML="";return}
  const w=320,h=160,p=28,values=byDay.map(x=>x.kg),min=Math.min(...values),max=Math.max(...values),span=Math.max(1,max-min),coordinates=byDay.map((x,i)=>({x:byDay.length===1?w/2:p+(w-2*p)*i/(byDay.length-1),y:h-p-(x.kg-min)/span*(h-2*p)}));
  el.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Evolução do peso em quilogramas"><polyline points="'+coordinates.map(x=>x.x+','+x.y).join(' ')+'" fill="none" stroke="#205a45" stroke-width="3"/>'+coordinates.map((x,i)=>'<circle cx="'+x.x+'" cy="'+x.y+'" r="4" fill="#205a45"><title>'+esc(byDay[i].day)+': '+fmt(byDay[i].kg)+' kg</title></circle>').join('')+'</svg><div class="chart-dates"><span>'+esc(byDay[0].day)+'</span><span>'+esc(byDay.at(-1).day)+'</span></div>';
  history.innerHTML='<p class="muted">'+byDay.length+' dia(s) com peso registado · Primeiro: '+fmt(byDay[0].kg)+' kg · Último: '+fmt(byDay.at(-1).kg)+' kg</p>';
 }
 const select=document.getElementById("strengthExercise");
 select.addEventListener("change",renderStrength);
 const oldProgress=renderProgress;
 renderProgress=function(){oldProgress();renderStrength()};
 const oldRender=render;
 render=function(){oldRender();renderStrength()};
 render();
})();