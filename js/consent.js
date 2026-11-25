// ===== Cookie / ad consent banner and the Privacy & Cookies window =====
// Rule for any future ad code: only load it inside `if(Consent.allows('ads')){ ... }`
// and call Consent.onChange(cb) to react when the visitor changes their mind.
const SITE_KEYS=['candies','eggs98','fs98','wp98','wpmode98','wpimg98','ss98','iconpos98','menuorder98','prof98','lb98','welcome','mine-lv','snake-hi','consent98','music98'];
const Consent={
  key:'consent98', cbs:[],
  get(){ try{ return JSON.parse(store.get(this.key)||'null'); }catch(e){ return null; } },
  set(level){ store.set(this.key,JSON.stringify({level,at:new Date().toISOString(),v:1})); this.cbs.forEach(cb=>{ try{ cb(this.get()); }catch(e){} }); $$('.consent-status').forEach(e=>e.textContent=this.label()); },
  allows(kind){ const c=this.get(); return !!c&&c.level==='all'&&kind==='ads'; },
  onChange(cb){ this.cbs.push(cb); },
  label(){ const c=this.get(); return !c?'Not chosen yet':c.level==='all'?'Ads and optional cookies: ALLOWED':'Essential only: no ads, no ad cookies'; },
  maybeShow(){ if(!this.get()) this.banner(); },
  banner(){
    if($('#cookiebar')) return;
    const b=mk('div','win active',`<div class="tbar"><span class="tt">🍪 Privacy &amp; Cookies</span></div><div class="wbody" style="padding:10px 12px">
      <p style="margin:0 0 8px;line-height:1.45">This site saves your progress and settings in <b>your browser</b>. It would also like to show <b>ads</b> (which may use cookies) to stay free.</p>
      <p style="margin:0 0 10px;line-height:1.45">You choose. <b>Essential only</b> means no ads and no ad cookies.</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap"><button id="cb-all" class="def" style="min-width:0">Accept all</button><button id="cb-ess" style="min-width:0">Essential only</button><button id="cb-pol" style="min-width:0">Privacy policy</button></div></div>`);
    b.id='cookiebar'; b.style.cssText='position:fixed;right:8px;bottom:38px;width:min(360px,calc(100vw - 16px));z-index:8500';
    document.body.appendChild(b);
    const done=l=>{ this.set(l); b.remove(); };
    $('#cb-all',b).onclick=()=>done('all'); $('#cb-ess',b).onclick=()=>done('essential'); $('#cb-pol',b).onclick=()=>window.open('/nostalgia/privacy','_blank','noopener');
  }
};
async function clearMyData(){
  const r=await dialog({title:'Clear my data',icon:'q',buttons:['Clear everything','Cancel'],cancel:'Cancel',width:380,body:'This erases everything this site stored on <b>this device</b>: sweets, secrets, saved files, settings, local scores, your arcade tag and your cookie choice.<br><br>Scores you already posted to the public leaderboard are not affected (ask us to remove those).'});
  if(r.btn!=='Clear everything') return;
  SITE_KEYS.forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} });
  await alertBox('Done. The page will reload.','info','Clear my data'); location.reload();
}
APPS.privacy={icon:'🔒',fit:true,single:true,title:'Privacy & Cookies',mount(w){
  w.body.innerHTML=`<div style="width:420px;padding:12px;line-height:1.5">
    <p style="margin:0 0 8px"><b>Your choice:</b><br><span class="consent-status">${Consent.label()}</span></p>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px"><button id="pv-all" style="min-width:0">Accept all</button><button id="pv-ess" style="min-width:0">Essential only</button></div>
    <p style="margin:0 0 10px;font-size:12px">Basement 98 keeps your progress in your own browser. If you post a score, your arcade tag, country and score are public. Ads only load if you accept them.</p>
    <div style="display:flex;gap:6px;flex-wrap:wrap"><button id="pv-pol" style="min-width:0">Read the full policy</button><button id="pv-clr" style="min-width:0">Clear my data on this device</button></div>
    <div class="dbtn" style="justify-content:flex-end;padding:10px 0 0"><button id="pv-ok" class="def">Close</button></div></div>`;
  $('#pv-all',w.body).onclick=()=>{ Consent.set('all'); const b=$('#cookiebar'); if(b) b.remove(); };
  $('#pv-ess',w.body).onclick=()=>{ Consent.set('essential'); const b=$('#cookiebar'); if(b) b.remove(); };
  $('#pv-pol',w.body).onclick=()=>window.open('/nostalgia/privacy','_blank','noopener');
  $('#pv-clr',w.body).onclick=clearMyData; $('#pv-ok',w.body).onclick=()=>w.close();
}};
