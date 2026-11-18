/* FitTrack 1.6 — blood pressure diary and axial spondyloarthritis mobility routine. Data stays in local state and existing JSON backups. */
(function(){
 state.bpReadings=Array.isArray(state.bpReadings)?state.bpReadings:[];
 state.axialRoutine=state.axialRoutine&&typeof state.axialRoutine==="object"?state.axialRoutine:{};
 state.axialFrequency=state.axialFrequency==="alternate"?"alternate":"daily";
 const asItems=[
  {id:"breathing",name:"Respiração e expansão torácica",dose:"5 respirações lentas",description:"Sentado ou de pé, inspira confortavelmente expandindo as costelas e expira sem prender o ar."},
  {id:"shoulders",name:"Mobilidade dos ombros",dose:"5 movimentos suaves",description:"Move os ombros para trás e para a frente, lentamente, sem forçar o pescoço."},
  {id:"rotation",name:"Rotação suave do tronco",dose:"5 por lado",description:"Sentado numa cadeira estável, roda suavemente o tronco dentro da amplitude confortável, sem movimentos bruscos."},
  {id:"extension",name:"Extensão postural suave",dose:"5 repetições",description:"De pé, alonga o corpo em direção ao teto, mantendo a respiração natural. Não forces a coluna para trás."},
  {id:"hips",name:"Mobilidade da anca",dose:"5 por lado",description:"Com apoio numa cadeira, move suavemente uma perna para trás e regressa, sem inclinar o tronco."},
  {id:"walk",name:"Caminhada confortável",dose:"5–10 minutos",description:"Caminha num ritmo confortável, interrompendo se houver dor ou mal-estar."}
 ];
 const bpHTML='<section class="panel bp-panel"><h3>Tensão arterial</h3><p class="muted">Regista as leituras do tensiómetro. As médias são calculadas a partir das leituras guardadas, não constituem um diagnóstico.</p><form id="bpForm"><div class="bp-fields"><label>Máxima (mmHg)<input name="sys" type="number" min="60" max="260" required placeholder="Ex.: 125"></label><label>Mínima (mmHg)<input name="dia" type="number" min="30" max="160" required placeholder="Ex.: 80"></label><label>Pulsação (bpm)<input name="pulse" type="number" min="30" max="220" placeholder="Opcional"></label><label>Data e hora<input name="when" type="datetime-local" required></label></div><button type="submit" class="primary-btn">Guardar medição</button></form><div class="bp-averages"><div><small>7 dias</small><strong id="bp7">—</strong></div><div><small>30 dias</small><strong id="bp30">—</strong></div></div><div id="bpChart"></div><div id="bpHistory"></div><p class="muted">Para uma avaliação em casa, é habitual fazer duas medições com 1–2 minutos de intervalo, de manhã e à noite, durante 3–7 dias. Confirma o plano de medição com o teu médico. Se tiveres sintomas graves, procura ajuda médica urgente.</p></section>';
 document.querySelector("#progressView .page-intro").insertAdjacentHTML("afterend",bpHTML);
 const asHTML='<section class="panel axial-panel"><h3>Mobilidade para espondilite</h3><p class="muted">Rotina suave de referência, não substitui um plano individualizado de fisioterapia. Interrompe movimentos que agravem a dor ou causem tonturas.</p><label for="axialFrequency">Frequência</label><select id="axialFrequency"><option value="daily">Diariamente</option><option value="alternate">De dois em dois dias</option></select><div id="axialDue"></div><div id="axialChecklist"></div><div id="axialSummary"></div><p class="muted">Vídeos oficiais e instruções:</p><div class="axial-links"><a target="_blank" rel="noopener noreferrer" href="https://www.anea.org.pt/videos/">ANEA — força, flexibilidade, equilíbrio e cardio</a><a target="_blank" rel="noopener noreferrer" href="https://nass.co.uk/managing-my-as/exercise/stretches-for-your-daily-life/">NASS — mobilidade para o dia a dia</a><a target="_blank" rel="noopener noreferrer" href="https://nass.co.uk/managing-my-as/my-as-my-life/exercise/">NASS — aulas guiadas em vídeo</a></div></section>';
 document.querySelector("#homeView .page-intro").insertAdjacentHTML("afterend",asHTML);
 const freq=document.getElementById("axialFrequency");freq.value=state.axialFrequency;
 const dayKey=()=>iso(homeDate);
 const isDue=()=>{if(state.axialFrequency==="daily")return true;const day=dateFrom(dayKey()),anchor=new Date(2026,0,1);return Math.round((day-anchor)/86400000)%2===0};
 function renderAxial(){
  const day=dayKey(),done=state.axialRoutine[day]||[];
  document.getElementById("axialDue").innerHTML=isDue()?'<p class="axial-due">Rotina prevista para este dia</p>':'<p class="muted">Dia de descanso da rotina alternada. Podes fazer mobilidade suave se te sentires confortável.</p>';
  document.getElementById("axialChecklist").innerHTML=asItems.map(x=>'<label class="axial-item"><input type="checkbox" data-axial="'+x.id+'" '+(done.includes(x.id)?"checked":"")+'><span><strong>'+x.name+'</strong><small>'+x.dose+'</small><em>'+x.description+'</em></span></label>').join("");
  document.getElementById("axialSummary").textContent=done.length+" de "+asItems.length+" exercícios concluídos";
 }
 freq.onchange=()=>{state.axialFrequency=freq.value;save();renderAxial()};
 document.getElementById("axialChecklist").addEventListener("change",event=>{
  const id=event.target.dataset.axial;if(!id)return;
  const day=dayKey(),done=state.axialRoutine[day]||[];
  state.axialRoutine[day]=event.target.checked?[...new Set([...done,id])]:done.filter(x=>x!==id);
  save();renderAxial();
 });
 const bpForm=document.getElementById("bpForm");
 function localNow(){const d=new Date(),offset=d.getTimezoneOffset();return new Date(d.getTime()-offset*60000).toISOString().slice(0,16)}
 bpForm.elements.when.value=localNow();
 bpForm.onsubmit=event=>{
  event.preventDefault();const f=bpForm.elements,sys=Number(f.sys.value),dia=Number(f.dia.value),pulse=f.pulse.value?Number(f.pulse.value):null,when=new Date(f.when.value);
  if(!Number.isFinite(when.getTime())||when>new Date()||sys<=dia||sys<60||sys>260||dia<30||dia>160||(pulse!==null&&(pulse<30||pulse>220))){toast("Verifica os valores e a data da medição.");return}
  state.bpReadings.push({id:"bp-"+Date.now()+"-"+Math.random().toString(36).slice(2,6),date:when.toISOString(),sys,dia,pulse});
  save();bpForm.reset();f.when.value=localNow();renderBp();toast("Tensão arterial guardada");
 };
 const average=items=>items.length?Math.round(items.reduce((s,x)=>s+x,0)/items.length):null;
 function renderBp(){
  const rows=[...state.bpReadings].filter(x=>x&&Number.isFinite(x.sys)&&Number.isFinite(x.dia)&&!isNaN(new Date(x.date))).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const now=Date.now();
  for(const [days,id] of [[7,"bp7"],[30,"bp30"]]){
   const subset=rows.filter(x=>{const t=new Date(x.date).getTime();return t<=now&&t>=now-days*86400000});
   const a=average(subset.map(x=>x.sys)),b=average(subset.map(x=>x.dia));
   document.getElementById(id).textContent=a===null?"—":a+"/"+b+" mmHg";
  }
  const chart=document.getElementById("bpChart");
  const recent=rows.slice(-30);
  if(!recent.length)chart.innerHTML='<p class="muted">Regista a primeira medição para veres o gráfico.</p>';
  else{
   const w=340,h=170,p=30,min=Math.min(60,...recent.map(x=>x.dia))-5,max=Math.max(150,...recent.map(x=>x.sys))+5,span=max-min;
   const coords=key=>recent.map((x,i)=>({x:recent.length===1?w/2:p+i*(w-2*p)/(recent.length-1),y:h-p-(x[key]-min)/span*(h-2*p)}));
   const line=(key,color)=>'<polyline fill="none" stroke="'+color+'" stroke-width="3" points="'+coords(key).map(v=>v.x+','+v.y).join(" ")+'"/>'+coords(key).map((v,i)=>'<circle cx="'+v.x+'" cy="'+v.y+'" r="3" fill="'+color+'"><title>'+recent[i].date.slice(0,10)+': '+recent[i][key]+' mmHg</title></circle>').join("");
   chart.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Gráfico das últimas 30 medições de tensão arterial">'+line("sys","#b44f4b")+line("dia","#205a45")+'</svg><div class="bp-legend"><span>● Máxima</span><span>● Mínima</span></div><p class="muted">Últimas '+recent.length+' medições; escala adaptada aos valores.</p>';
  }
  document.getElementById("bpHistory").innerHTML=rows.slice(-10).reverse().map(x=>'<div class="schedule-row"><span>'+new Date(x.date).toLocaleString("pt-PT",{dateStyle:"short",timeStyle:"short"})+'</span><strong>'+x.sys+'/'+x.dia+(x.pulse===null?"":" · "+x.pulse+" bpm")+'</strong><button type="button" data-remove-bp="'+x.id+'" aria-label="Apagar medição">×</button></div>').join("");
 }
 document.getElementById("bpHistory").addEventListener("click",event=>{
  const id=event.target.dataset.removeBp;if(!id||!confirm("Apagar esta medição?"))return;
  state.bpReadings=state.bpReadings.filter(x=>x.id!==id);save();renderBp();
 });
 const oldRender=render;render=function(){oldRender();renderAxial();renderBp()};
 const oldHome=renderHome;renderHome=function(){oldHome();renderAxial()};
 const oldProgress=renderProgress;renderProgress=function(){oldProgress();renderBp()};
 renderAxial();renderBp();
})();