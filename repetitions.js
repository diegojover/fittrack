/* FitTrack 1.5 — actual repetitions per set, optional target editing. */
(function(){
 const dialog=document.getElementById("dialogContent");
 const oldOpen=openExercise;
 const getDay=()=>dialog.querySelector("[data-dialog-done]")?.dataset.targetDate||iso(homeDate);
 const defaultReps=id=>{const ex=EXERCISES.find(x=>x.id===id),label=String(state.exerciseTargets?.[id]?.reps||ex?.reps||"");const n=parseInt(label,10);return Number.isFinite(n)?n:10};
 function refreshCounts(id,day){
  const rows=state.seriesLog?.[day]?.[id]||[],total=Math.max(1,Math.min(10,Number(state.exerciseTargets?.[id]?.sets||EXERCISES.find(x=>x.id===id)?.sets||2)));
  const completed=rows.slice(0,total).filter(s=>s?.done).length;
  const progress=dialog.querySelector("#setProgressCount");if(progress)progress.textContent=completed+" de "+total+" séries feitas";
  const done=dialog.querySelector("[data-dialog-done]");if(done)done.disabled=completed<total;
 }
 openExercise=function(id){
  oldOpen(id);
  const day=getDay(),rows=state.seriesLog?.[day]?.[id]||[];
  const list=dialog.querySelector(".set-list");
  if(!list)return;
  list.querySelectorAll(".set-row").forEach((row,i)=>{
   const label=document.createElement("label");
   label.className="set-reps";
   label.textContent="Repetições";
   const input=document.createElement("input");
   input.type="number";input.inputMode="numeric";input.min="0";input.max="300";input.step="1";
   input.dataset.seriesReps=String(i);
   input.placeholder=String(defaultReps(id));
   input.value=Number.isInteger(rows[i]?.reps)?String(rows[i].reps):"";
   label.append(input);
   const weight=row.querySelector(".set-weight");
   row.insertBefore(label,weight);
  });
  const p=dialog.querySelector(".set-tracker > p.muted");
  if(p)p.textContent="Marca cada série e regista as repetições realizadas. O peso por halter é opcional. Os campos vazios não contam como repetições registadas.";
  refreshCounts(id,day);
 };
 document.addEventListener("change",event=>{
  const input=event.target.closest("[data-series-reps]");
  if(!input)return;
  const id=dialog.dataset.activeExercise,day=getDay(),index=Number(input.dataset.seriesReps);
  if(!id||!day||!Number.isInteger(index)||index<0||index>9)return;
  const raw=input.value.trim(),value=raw===""?null:Number(raw);
  if(value!==null&&(!Number.isInteger(value)||value<0||value>300)){
   toast("Introduz entre 0 e 300 repetições.");input.focus();return;
  }
  state.seriesLog??={};state.seriesLog[day]??={};
  const rows=state.seriesLog[day][id]??=[];
  while(rows.length<=index)rows.push({done:false,kg:null});
  rows[index].reps=value;
  save();toast("Repetições guardadas");
 },true);
 const progress=document.querySelector(".strength-panel");
 if(progress){
  progress.insertAdjacentHTML("beforeend",'<section class="reps-history"><h4>Repetições registadas</h4><div id="repsHistory"></div></section>');
  const renderHistory=()=>{
   const id=document.getElementById("strengthExercise")?.value,el=document.getElementById("repsHistory");if(!id||!el)return;
   const days=Object.entries(state.seriesLog||{}).map(([date,exercises])=>{
    const rows=(exercises?.[id]||[]).filter(s=>s?.done&&Number.isInteger(s.reps));
    return {date,reps:rows.reduce((sum,s)=>sum+s.reps,0),sets:rows.length};
   }).filter(x=>x.sets>0).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
   el.innerHTML=days.length?days.map(x=>'<div class="schedule-row"><span>'+esc(x.date)+'</span><strong>'+x.reps+' repetições · '+x.sets+' séries</strong></div>').join(""):'<p class="muted">As repetições realizadas aparecem aqui quando forem registadas e as séries marcadas como feitas.</p>';
  };
  document.getElementById("strengthExercise")?.addEventListener("change",renderHistory);
  const oldProgress=renderProgress;
  renderProgress=function(){oldProgress();renderHistory()};
  renderHistory();
 }
})();