/* FitTrack 1.2: update checks and Android/Google Drive backup sharing. */
(function(){
 const version="1.2";
 const panel=document.querySelector("#settingsView .page-intro");
 panel.insertAdjacentHTML("afterend",'<section class="panel backup-panel"><h3>Atualizações da aplicação</h3><p class="muted" id="updateStatus">A verificar a versão…</p><button class="secondary-btn" id="checkUpdateBtn" type="button">Procurar atualizações</button><button class="primary-btn" id="applyUpdateBtn" type="button" hidden>Atualizar agora</button></section><section class="panel backup-panel"><h3>Cópia de segurança no Google Drive</h3><p class="muted">Guarda uma cópia dos teus treinos e registos de peso no Drive. Não é uma sincronização automática.</p><button class="primary-btn" id="driveBackupBtn" type="button">Guardar cópia no Drive</button><p class="muted" id="backupHelp">Se o Drive não aparecer na partilha, descarrega o ficheiro e envia-o pela aplicação Google Drive.</p></section>');
 const status=document.getElementById("updateStatus"),apply=document.getElementById("applyUpdateBtn"),check=document.getElementById("checkUpdateBtn");
 let pending=null;
 const setPending=worker=>{pending=worker;status.textContent="Nova versão disponível. Os teus dados serão mantidos.";apply.hidden=false};
 function watch(reg){
  if(reg.waiting)setPending(reg.waiting);
  reg.addEventListener("updatefound",()=>{
   const installing=reg.installing;
   if(!installing)return;
   installing.addEventListener("statechange",()=>{
    if(installing.state==="installed"&&navigator.serviceWorker.controller)setPending(installing);
   });
  });
 }
 async function checkUpdates(){
  if(!("serviceWorker" in navigator)){status.textContent="Atualizações automáticas indisponíveis neste navegador.";return}
  status.textContent="A procurar atualizações…";
  try{
   const reg=await navigator.serviceWorker.ready;
   watch(reg);
   await reg.update();
   if(reg.waiting)setPending(reg.waiting);
   else if(!pending)status.textContent="Verificação concluída. Se existir uma nova versão, será apresentada aqui.";
  }catch{status.textContent="Não foi possível verificar. Confirma a ligação à Internet."}
 }
 check.addEventListener("click",checkUpdates);
 apply.addEventListener("click",()=>{
  if(pending){pending.postMessage({type:"SKIP_WAITING"});status.textContent="A atualizar…";setTimeout(()=>location.reload(),1800)}
  else location.reload();
 });
 if("serviceWorker" in navigator){
  let controlled=Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
   if(controlled){location.reload()}else controlled=true;
  });
  window.addEventListener("load",()=>{navigator.serviceWorker.ready.then(watch).catch(()=>{});checkUpdates()});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)checkUpdates()});
 }
 function exportBackup(){
  const snapshot={...state,backupFormat:"fittrack",backupVersion:1,exportedAt:new Date().toISOString()};
  return new File([JSON.stringify(snapshot,null,2)],"fittrack-backup-"+new Date().toISOString().slice(0,10)+".json",{type:"application/json"});
 }
 function download(file){
  const url=URL.createObjectURL(file),a=document.createElement("a");a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
 }
 document.getElementById("driveBackupBtn").addEventListener("click",async()=>{
  const file=exportBackup();
  if(navigator.share&&navigator.canShare?.({files:[file]})){
   try{await navigator.share({files:[file],title:"Cópia de segurança FitTrack",text:"Guardar este ficheiro no Google Drive."});toast("Partilha concluída. Confirma que o ficheiro aparece no Drive.");return}
   catch(e){if(e.name==="AbortError")return}
  }
  download(file);
  toast("Cópia descarregada. Envia o ficheiro para o Google Drive.");
 });
 const versionLabel=document.querySelector(".version");
 if(versionLabel)versionLabel.textContent="FitTrack · versão "+version+" · dados locais com cópia opcional";
})();