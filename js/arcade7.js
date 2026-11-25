/* ===== Game Cabinet: play old arcade and console games from files the player owns =====
   Nothing is included or hosted. The player drops in a game file; it is kept in THEIR browser (IndexedDB) so they
   can pick it from a shelf next time. Emulation is done by EmulatorJS, loaded from its CDN only when a game starts.
   Switched off by default: set emulator:true in js/config.js to show it (see ADDING-GAMES.md). */
const CAB_SYS={nes:['nes','NES'],sfc:['snes','Super NES'],smc:['snes','Super NES'],gb:['gb','Game Boy'],gbc:['gb','Game Boy Color'],gba:['gba','Game Boy Advance'],md:['segaMD','Mega Drive'],gen:['segaMD','Mega Drive'],smd:['segaMD','Mega Drive'],sms:['segaMS','Master System'],gg:['segaGG','Game Gear'],pce:['pce','PC Engine'],n64:['n64','Nintendo 64'],z64:['n64','Nintendo 64'],v64:['n64','Nintendo 64'],a26:['atari2600','Atari 2600'],zip:['arcade','Arcade']};
const cabDB=()=>new Promise((res,rej)=>{ const r=indexedDB.open('b98cab',1); r.onupgradeneeded=()=>r.result.createObjectStore('g',{keyPath:'id',autoIncrement:true}); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); });
const cabTx=async(mode,fn)=>{ const db=await cabDB(); return new Promise((res,rej)=>{ const t=db.transaction('g',mode), s=t.objectStore('g'), r=fn(s); t.oncomplete=()=>res(r&&r.result); t.onerror=()=>rej(t.error); }); };
function mountCabinet(w){
  const EXT=Object.keys(CAB_SYS).map(e=>'.'+e).join(',');
  let url=null, frame=null, dead=false;
  const home=async()=>{
    if(url){ URL.revokeObjectURL(url); url=null; } w.setTitle&&w.setTitle('Game Cabinet'); frame=null;
    w.body.innerHTML=`<div style="padding:12px;overflow:auto;height:100%;box-sizing:border-box;background:#1b2160;color:#fff;font-family:var(--pix);font-size:18px">
      <div id="dz" style="border:3px dashed #8fe3ff;padding:18px;text-align:center;border-radius:6px"><div style="font-size:44px">🕹️</div><b style="font-size:22px">Drop a game file here</b><br>or <button id="br" style="min-width:0;padding:3px 14px">Browse files...</button><br><small style="color:#8fe3ff">NES · SNES · Game Boy · GBA · Mega Drive · Master System · N64 · Atari · Arcade (.zip)</small></div>
      <div style="margin:10px 0">Arcade .zip files use: <select id="ac"><option value="arcade">Arcade (FinalBurn Neo)</option><option value="mame2003">Arcade (MAME 2003)</option></select> <small style="color:#8fe3ff">Pick the one your ROM set was made for.</small></div>
      <div id="sh"></div>
      <p style="color:#aab;font-size:15px;line-height:1.3;margin-top:14px">Only use game files you own or have the right to use. This site includes no games. Your files stay on your computer and are never uploaded.</p></div>`;
    const dz=$('#dz',w.body), sh=$('#sh',w.body);
    const pick=()=>{ const f=document.createElement('input'); f.type='file'; f.multiple=true; f.accept=EXT; f.onchange=()=>addFiles([...f.files]); f.click(); };
    $('#br',w.body).onclick=pick;
    w.body.ondragover=e=>{ e.preventDefault(); dz.style.background='#2a3290'; }; w.body.ondragleave=()=>{ dz.style.background=''; };
    w.body.ondrop=e=>{ e.preventDefault(); dz.style.background=''; addFiles([...e.dataTransfer.files]); };
    let list=[]; try{ list=await cabTx('readonly',s=>s.getAll()); }catch(e){ list=[]; }
    if(dead) return;
    sh.innerHTML=list.length?`<div style="margin-bottom:6px"><b>Your games</b> <small style="color:#8fe3ff">(saved on this device only)</small></div>`:'';
    list.sort((a,b)=>b.added-a.added).forEach(g=>{ const row=document.createElement('div'); row.style.cssText='display:flex;gap:6px;align-items:center;margin:4px 0';
      row.innerHTML=`<button style="flex:1;text-align:left;min-width:0;font-size:18px">▶ ${esc(g.title)} <small style="color:#555">· ${esc(g.sysName)}</small></button><button title="Remove from this device" style="min-width:0;padding:2px 8px">✕</button>`;
      row.children[0].onclick=()=>play(g); row.children[1].onclick=async()=>{ await cabTx('readwrite',s=>s.delete(g.id)); home(); }; sh.appendChild(row); });
  };
  async function addFiles(files){
    const ok=files.filter(f=>CAB_SYS[(f.name.split('.').pop()||'').toLowerCase()]); if(!ok.length){ alertBox('That file type is not supported.\n\nSupported: '+Object.keys(CAB_SYS).join(', '),'warn','Game Cabinet'); return; }
    let last=null; const ac=($('#ac',w.body)||{}).value||'arcade';
    for(const f of ok){ const ext=f.name.split('.').pop().toLowerCase(), [core,sysName]=CAB_SYS[ext]; const rec={title:f.name.replace(/\.[^.]+$/,'').replace(/[_]+/g,' '),file:f.name,core:core==='arcade'?ac:core,sysName:core==='arcade'?(ac==='mame2003'?'Arcade (MAME)':'Arcade (FBNeo)'):sysName,blob:f,added:Date.now()};
      try{ await cabTx('readwrite',s=>s.add(rec)); }catch(e){ /* storage full or private mode: still play it this time */ } last=rec; }
    if(ok.length===1&&last) play(last); else home();
  }
  function play(g){
    if(url) URL.revokeObjectURL(url); url=URL.createObjectURL(g.blob)+'#'+encodeURIComponent(g.file); w.setTitle&&w.setTitle('Game Cabinet - '+g.title);
    w.body.innerHTML=`<div style="display:flex;flex-direction:column;height:100%"><div class="arcbar" style="flex:none"><button id="bk" style="min-width:0;padding:2px 10px">◀ My games</button><span>${esc(g.title)} · ${esc(g.sysName)}</span></div></div>`;
    const wrap=w.body.firstElementChild; frame=document.createElement('iframe'); frame.style.cssText='flex:1;border:0;width:100%;background:#000'; frame.allow='autoplay; gamepad; fullscreen'; frame.setAttribute('allowfullscreen','');
    const cfg=`<!doctype html><meta charset=utf-8><style>html,body,#game{margin:0;height:100%;width:100%;background:#000;overflow:hidden}</style><div id="game"></div><script>EJS_player='#game';EJS_core=${JSON.stringify(g.core)};EJS_gameUrl=${JSON.stringify(url)};EJS_gameName=${JSON.stringify(g.title)};EJS_pathtodata='https://cdn.emulatorjs.org/stable/data/';EJS_startOnLoaded=true;EJS_color='#1d6fe0';<\/script><script src="https://cdn.emulatorjs.org/stable/data/loader.js"><\/script>`;
    frame.srcdoc=cfg; wrap.appendChild(frame); $('#bk',w.body).onclick=home; frame.focus();
  }
  home();
  return ()=>{ dead=true; if(url) URL.revokeObjectURL(url); if(frame) frame.src='about:blank'; };
}
if(CFG.emulator) ARCADE.push({id:'cabinet',f:'CABINET.EXE',n:'Game Cabinet (bring your own games)',e:'🕹️',wh:[760,620],m:mountCabinet});
