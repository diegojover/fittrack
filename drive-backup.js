/* FitTrack 1.5 — explicit Android share, Google Drive OAuth upload (requires user's OAuth client ID). */
(function(){
 const panel=document.querySelector(".backup-panel + .backup-panel");
 if(!panel)return;
 const original=document.getElementById("driveBackupBtn");
 original.textContent="Partilhar cópia (Google Drive)";
 original.insertAdjacentHTML("afterend",'<button id="backupDownloadBtn" type="button" class="secondary-btn">Descarregar ficheiro JSON</button><details class="drive-connect"><summary>Ligação direta ao Google Drive</summary><p class="muted">Para guardar diretamente no Drive sem usar a partilha Android, é necessário configurar um ID de cliente OAuth do Google Cloud para este site. Não introduzas passwords nem chaves privadas.</p><label>ID de cliente OAuth (aplicação Web)<input id="googleClientId" type="text" autocomplete="off" placeholder="…apps.googleusercontent.com"></label><button id="driveConnectBtn" type="button" class="secondary-btn">Ligar conta Google</button><button id="driveUploadBtn" type="button" class="primary-btn" disabled>Guardar diretamente no Drive</button><p id="driveStatus" class="muted" role="status">Conta não ligada.</p></details>');
 const file=()=>new File([JSON.stringify({...state,backupFormat:"fittrack",backupVersion:2,exportedAt:new Date().toISOString()},null,2)],"fittrack-backup-"+iso(new Date())+".json",{type:"application/json"});
 function download(f){const url=URL.createObjectURL(f),a=document.createElement("a");a.href=url;a.download=f.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
 document.getElementById("backupDownloadBtn").onclick=()=>{download(file());toast("Ficheiro JSON descarregado")};
 // Override previous click handler at capture phase to avoid downloading silently when sharing is unsupported.
 original.addEventListener("click",async event=>{
  event.stopImmediatePropagation();event.preventDefault();
  const f=file();
  if(typeof navigator.share!=="function"||!navigator.canShare?.({files:[f]})){
   toast("Este navegador não permite partilhar ficheiros. Usa a ligação direta ao Drive abaixo ou o download.");
   return;
  }
  try{await navigator.share({files:[f],title:"Cópia de segurança FitTrack"});toast("Partilha iniciada. Confirma o ficheiro no Google Drive.");}
  catch(e){if(e.name!=="AbortError")toast("Não foi possível partilhar. Experimenta o Chrome no Android.");}
 },true);
 const clientInput=document.getElementById("googleClientId"),status=document.getElementById("driveStatus"),upload=document.getElementById("driveUploadBtn");
 clientInput.value=localStorage.getItem("fittrack_google_oauth_client_id")||"";
 let token=null,client=null;
 const setStatus=s=>status.textContent=s;
 function loadGoogle(){
  return new Promise((resolve,reject)=>{
   if(window.google?.accounts?.oauth2)return resolve();
   const s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.async=true;
   s.onload=resolve;s.onerror=()=>reject(new Error("Não foi possível carregar a autenticação Google."));document.head.append(s);
  });
 }
 document.getElementById("driveConnectBtn").addEventListener("click",async()=>{
  const id=clientInput.value.trim();
  if(!/^[\w-]+\.apps\.googleusercontent\.com$/.test(id)){setStatus("Insere um ID de cliente OAuth válido.");return}
  localStorage.setItem("fittrack_google_oauth_client_id",id);
  setStatus("A iniciar autenticação Google…");
  try{
   await loadGoogle();
   client=google.accounts.oauth2.initTokenClient({
    client_id:id,
    scope:"https://www.googleapis.com/auth/drive.file",
    callback:response=>{
     if(response.error||!response.access_token){setStatus("A ligação ao Google Drive não foi autorizada.");return}
     token=response.access_token;upload.disabled=false;setStatus("Conta ligada nesta sessão. Podes guardar uma cópia no Drive.");
    },
    error_callback:()=>setStatus("Não foi possível abrir a autenticação. Confirma as origens autorizadas no Google Cloud.")
   });
   client.requestAccessToken({prompt:"consent"});
  }catch(e){setStatus(e.message||"Erro na ligação ao Google.")}
 });
 upload.addEventListener("click",async()=>{
  if(!token){setStatus("Liga primeiro a conta Google.");return}
  upload.disabled=true;setStatus("A enviar cópia para o Google Drive…");
  try{
   const f=file(),boundary="fittrack_"+Date.now();
   const metadata={name:f.name,mimeType:"application/json",description:"Cópia de segurança FitTrack"};
   const body="--"+boundary+"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"+JSON.stringify(metadata)+"\r\n--"+boundary+"\r\nContent-Type: application/json\r\n\r\n"+await f.text()+"\r\n--"+boundary+"--";
   const response=await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",{
    method:"POST",headers:{"Authorization":"Bearer "+token,"Content-Type":"multipart/related; boundary="+boundary},body
   });
   if(!response.ok)throw new Error("Google Drive devolveu o erro "+response.status+".");
   const result=await response.json();
   setStatus("Cópia guardada no Google Drive: "+result.name+". Confirma na tua conta Google.");
   toast("Cópia enviada para o Drive!");
  }catch(e){setStatus("Não foi possível guardar: "+e.message)}
  finally{upload.disabled=!token}
 });
})();