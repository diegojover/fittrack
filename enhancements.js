/* FitTrack v1.1 — improvements; keeps the original localStorage key and workout history. */
document.addEventListener("click",event=>{
 const button=event.target.closest("[data-dialog-done]");
 if(!button)return;
 event.stopImmediatePropagation();
 const day=dateFrom(button.dataset.targetDate||iso(new Date()));
 setDone(day,button.dataset.dialogDone,true);
 document.getElementById("exerciseDialog").close();
 toast("Exercício concluído");
},true);
const originalArt=art;
const originalRenderHome=renderHome;
const originalRenderProgress=renderProgress;
const originalRenderSelectedDay=renderSelectedDay;
let homeDate=new Date();
const todayKey=()=>iso(new Date());
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const dateLabel=d=>d.toLocaleDateString("pt-PT",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
function upgradeArt(type){
  const variants={
    squat:{head:[110,41],body:"M110 59 L111 105 L88 134 L72 176 M111 105 L143 131 L165 174",arms:"M109 72 L84 93 L96 104 M111 72 L136 94 L124 104",weight:"M96 101h28m-28 -7v14m28-14v14"},
    row:{head:[69,52],body:"M76 71 L127 101 L145 128 L148 174 M127 101 L95 134 L88 174",arms:"M94 83 L110 117 L119 147 M116 94 L150 112 L164 141",weight:"M107 145h24m-24 -8v16m24-16v16"},
    bridge:{head:[50,126],body:"M64 128 L96 109 L145 92 L175 121 M96 109 L100 153 L93 178 M175 121 L186 163 L201 178",arms:"M78 125 L112 158 L126 177",weight:""},
    press:{head:[56,135],body:"M73 136 L118 135 L165 151 L181 174 M119 135 L144 174",arms:"M88 129 L88 86 L82 55 M140 132 L148 86 L153 55",weight:"M68 55h28m-28 -8v16m28-16v16 M139 55h28m-28 -8v16m28-16v16"},
    deadbug:{head:[50,135],body:"M68 135 L113 132 L147 114 L165 76 M113 132 L153 146 L183 169",arms:"M89 127 L103 85 L116 60 M100 131 L72 101 L63 67",weight:""},
    hinge:{head:[83,52],body:"M92 72 L133 108 L143 141 L137 181 M133 108 L161 139 L169 181",arms:"M107 85 L127 127 L116 148 M118 91 L148 120 L146 146",weight:""},
    calf:{head:[113,40],body:"M113 59 L113 108 L99 153 L97 183 M113 108 L133 152 L147 183",arms:"M112 74 L92 115 L78 127 M114 74 L138 114 L152 125",weight:""},
    "bird-dog":{head:[59,93],body:"M76 96 L127 91 L151 116 L184 112 M127 91 L127 149 L136 178",arms:"M91 96 L82 143 L80 178 M109 94 L112 145 L107 178",weight:""}
  };
  const v=variants[type]||variants.squat;
  return '<svg viewBox="0 0 240 210" role="img" aria-label="Desenho explicativo da postura do exercício" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g-'+type+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eef7ee"/><stop offset="1" stop-color="#d8eadf"/></linearGradient></defs><rect width="240" height="210" rx="22" fill="url(#g-'+type+')"/><circle cx="190" cy="44" r="37" fill="#cce4d5" opacity=".6"/><path d="M24 185H215" stroke="#aacbbb" stroke-width="2" stroke-dasharray="5 6"/><g fill="none" stroke="#285d49" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="'+v.body+'"/><path d="'+v.arms+'"/></g><circle cx="'+v.head[0]+'" cy="'+v.head[1]+'" r="17" fill="#e7b38c" stroke="#285d49" stroke-width="4"/><path d="'+v.weight+'" fill="none" stroke="#506b61" stroke-width="7" stroke-linecap="round"/><path d="M199 163l11 11-11 11" stroke="#5f9e7b" stroke-width="4" fill="none" stroke-linecap="round"/><text x="16" y="23" font-size="10" font-weight="700" fill="#507966">POSTURA • ESQUEMA</text></svg>';
}
art=upgradeArt;
function homeCard(ex,d){
 const done=getLog(d).done.includes(ex.id);
 return '<article class="exercise-card workout-card '+(done?'is-finished':'')+'"><div class="exercise-art">'+art(ex.art)+'</div><div class="exercise-info"><h3>'+esc(ex.name)+'</h3><p>'+esc(ex.desc)+'</p><div class="exercise-meta"><span class="mini-tag">'+ex.sets+' séries</span><span class="mini-tag">'+esc(ex.reps)+'</span></div><button class="start-exercise" data-detail="'+ex.id+'">Ver instruções e fazer →</button></div><div class="card-actions"><button class="round-check '+(done?'done':'')+'" data-toggle="'+ex.id+'" data-date="'+iso(d)+'" aria-label="'+(done?'Desmarcar':'Marcar')+' '+esc(ex.name)+'">'+(done?'✓':'')+'</button></div></article>';
}
renderHome=function(){
 const d=homeDate,ids=planIds(d),log=getLog(d),done=ids.filter(id=>log.done.includes(id)).length;
 document.getElementById("todayLabel").textContent=dateLabel(d).toUpperCase();
 document.getElementById("greeting").textContent=ids.length?(done===ids.length?"Treino concluído!":"Vamos treinar?"):"Dia de recuperação";
 document.getElementById("todaySub").textContent=ids.length?"Abre cada exercício para ver a execução e marca-o quando terminares.":"Sem treino de força planeado. Podes caminhar ou descansar.";
 document.getElementById("progressText").textContent=done+" de "+ids.length+" concluídos";
 document.getElementById("progressPercent").textContent=(ids.length?Math.round(done/ids.length*100):0)+"%";
 document.getElementById("progressBar").style.width=(ids.length?done/ids.length*100:0)+"%";
 document.getElementById("sessionTitle").textContent=ids.length?"Treino "+planFor(d)+" — corpo inteiro":"Recuperação";
 document.getElementById("sessionTag").textContent=ids.length?"Força · 25–30 min":"Descanso";
 document.getElementById("todayWorkout").innerHTML=ids.length?ids.map(id=>homeCard(EXERCISES.find(e=>e.id===id),d)).join(""):'<div class="panel"><h3>Dia sem treino de força</h3><p class="muted">Caminhada leve, mobilidade suave ou descanso.</p></div>';
 renderWeek();
 document.getElementById("dayNavLabel").textContent=iso(d)===todayKey()?"Hoje":dateLabel(d);
};
renderSelectedDay=function(){
 originalRenderSelectedDay();
 const d=dateFrom(selectedDate),ids=planIds(d),el=document.getElementById("selectedDayPanel");
 if(!ids.length)return;
 el.innerHTML='<h3>'+esc(dateLabel(d))+'</h3><p>Abre o exercício para consultar as instruções e marca quando estiver feito.</p>'+ids.map(id=>{const ex=EXERCISES.find(x=>x.id===id);return '<div class="schedule-row calendar-action"><button class="text-btn" data-detail="'+id+'">'+esc(ex.name)+' →</button><button class="round-check '+(getLog(d).done.includes(id)?'done':'')+'" data-toggle="'+id+'" data-date="'+iso(d)+'" aria-label="Marcar exercício">'+(getLog(d).done.includes(id)?'✓':'')+'</button></div>'}).join("");
};
const homeHeading=document.querySelector("#homeView .section-heading");
homeHeading.insertAdjacentHTML("beforebegin",'<div class="day-nav"><button class="icon-btn" id="homePrev" aria-label="Dia anterior">‹</button><strong id="dayNavLabel">Hoje</strong><button class="icon-btn" id="homeNext" aria-label="Dia seguinte">›</button><button class="today-pill" id="homeToday">Hoje</button></div>');
document.getElementById("homePrev").onclick=()=>{homeDate=addDays(homeDate,-1);renderHome()};
document.getElementById("homeNext").onclick=()=>{homeDate=addDays(homeDate,1);renderHome()};
document.getElementById("homeToday").onclick=()=>{homeDate=new Date();renderHome()};
document.getElementById("todayBtn").onclick=()=>{homeDate=new Date();selectedDate=todayKey();monthCursor=new Date();showView("homeView");render()};
const oldOpenExercise=openExercise;
openExercise=function(id){
 oldOpenExercise(id);
 const btn=document.querySelector("[data-dialog-done]");
 if(btn){btn.dataset.targetDate=iso(homeDate);btn.textContent="Concluir exercício neste dia";}
};
document.addEventListener("click",e=>{
 const btn=e.target.closest("[data-dialog-done]");
 if(!btn)return;
 // Existing handler executes first, so correct the selected day if viewing the past.
 const target=btn.dataset.targetDate;
 if(target && target!==todayKey()){
  const ex=btn.dataset.dialogDone,now=new Date(),old=getLog(now);
  old.done=old.done.filter(x=>x!==ex);
  state.logs[todayKey()]=old;
  const chosen=dateFrom(target);
  setDone(chosen,ex,true);
  save();render();
 }
});
const progressView=document.getElementById("progressView");
const stats=progressView.querySelector(".stats-grid");
stats.insertAdjacentHTML("afterend",'<div class="panel profile-panel"><h3>Os teus dados</h3><div class="profile-grid"><label>Altura (cm)<input id="heightInput" type="number" min="100" max="230" step="0.1" placeholder="162"></label><label>Objetivo (kg)<input id="goalInput" type="number" min="20" max="300" step="0.1" placeholder="Opcional"></label></div><div class="profile-stats"><div><small>Último peso</small><strong id="latestWeight">—</strong></div><div><small>IMC atual</small><strong id="bmiValue">—</strong></div><div><small>Variação registada</small><strong id="weightChange">—</strong></div></div><p class="muted">O IMC é um indicador geral e não distingue massa muscular de gordura corporal.</p></div><div class="panel chart-panel"><div class="chart-head"><h3>Evolução do peso</h3><span id="chartPeriod"></span></div><div id="weightChart" class="weight-chart"></div><p class="muted">O gráfico usa os registos reais introduzidos. Sem estimativas.</p></div>');
const profile=state.profile||{height:162,goal:null};
state.profile=profile;
document.getElementById("heightInput").value=profile.height||"";
document.getElementById("goalInput").value=profile.goal||"";
for(const [id,key] of [["heightInput","height"],["goalInput","goal"]]){
 document.getElementById(id).addEventListener("change",e=>{
  const v=Number(e.target.value);
  state.profile[key]=v>0?v:null;
  save();renderProgress();
 });
}
const originalWeightRender=renderProgress;
renderProgress=function(){
 originalWeightRender();
 const weights=state.weights.filter(w=>Number.isFinite(Number(w.value))&&w.value>0).map(w=>({date:new Date(w.date),value:Number(w.value)})).filter(w=>!isNaN(w.date.getTime())).sort((a,b)=>a.date-b.date);
 const latest=weights.at(-1),first=weights[0],h=Number(state.profile?.height);
 document.getElementById("latestWeight").textContent=latest?latest.value.toLocaleString("pt-PT")+" kg":"—";
 document.getElementById("bmiValue").textContent=latest&&h>=100&&h<=230?(latest.value/Math.pow(h/100,2)).toLocaleString("pt-PT",{maximumFractionDigits:1}):"—";
 document.getElementById("weightChange").textContent=weights.length>=2?(latest.value-first.value>0?"+":"")+(latest.value-first.value).toLocaleString("pt-PT",{maximumFractionDigits:1})+" kg":"—";
 const el=document.getElementById("weightChart");
 if(!weights.length){el.innerHTML='<div class="chart-empty">Regista o teu primeiro peso para começares a ver a evolução.</div>';return}
 const w=640,ht=240,pad=40,min=Math.min(...weights.map(x=>x.value))-1,max=Math.max(...weights.map(x=>x.value))+1;
 const xs=weights.map((_,i)=>weights.length===1?w/2:pad+i*(w-2*pad)/(weights.length-1));
 const ys=weights.map(x=>ht-pad-(x.value-min)/(max-min)*(ht-2*pad));
 const pts=xs.map((x,i)=>x.toFixed(1)+","+ys[i].toFixed(1)).join(" ");
 const lines=Array.from({length:4},(_,i)=>{const y=pad+i*(ht-2*pad)/3,v=max-i*(max-min)/3;return '<line x1="'+pad+'" y1="'+y+'" x2="'+(w-pad)+'" y2="'+y+'" stroke="#e1ebe4"/><text x="4" y="'+(y+4)+'" font-size="12" fill="#72877b">'+v.toFixed(1)+'</text>'}).join("");
 const circles=xs.map((x,i)=>'<circle cx="'+x+'" cy="'+ys[i]+'" r="5" fill="#205a45"><title>'+weights[i].date.toLocaleDateString("pt-PT")+': '+weights[i].value+' kg</title></circle>').join("");
 el.innerHTML='<svg viewBox="0 0 '+w+' '+ht+'" role="img" aria-label="Gráfico da evolução do peso"><title>Evolução do peso corporal em quilogramas</title>'+lines+'<polyline points="'+pts+'" fill="none" stroke="#205a45" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+circles+'</svg><div class="chart-dates"><span>'+first.date.toLocaleDateString("pt-PT")+'</span><span>'+latest.date.toLocaleDateString("pt-PT")+'</span></div>';
 document.getElementById("chartPeriod").textContent=weights.length+" registo(s)";
};
const oldRender=render;
render=function(){oldRender();renderHome();renderProgress()};
save();
render();
