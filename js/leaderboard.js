// ===== Leaderboards, Hall of Fame, daily challenge, share cards =====
const fmtMs=ms=>{ const m=Math.floor(ms/60000), s=(ms%60000)/1000; return `${m}:${s.toFixed(2).padStart(5,'0')}`; };
const GAME_META={
  snake:{n:'Snake',e:'🐍',low:false,fmt:s=>s+' pts'},
  drop:{n:'Block Drop',e:'🟦',low:false,fmt:s=>s.toLocaleString()+' pts'},
  turbo:{n:'Turbo Rush (3 laps vs CPU)',e:'🏎️',low:true,fmt:fmtMs},
  maze3d:{n:'Maze Hunter 3D (clear time)',e:'🔫',low:true,fmt:s=>s+'s'},
  'mines-b':{n:'Minesweeper - Beginner',e:'💣',low:true,fmt:s=>s+'s'},
  'mines-i':{n:'Minesweeper - Intermediate',e:'💣',low:true,fmt:s=>s+'s'},
  'mines-e':{n:'Minesweeper - Expert',e:'💣',low:true,fmt:s=>s+'s'},
  cricket:{n:'Book Cricket',e:'🏏',low:false,fmt:s=>s+' runs'}};
const GAME_APP={snake:'snake',drop:'drop',turbo:'turbo',maze3d:'maze3d','mines-b':'mines','mines-i':'mines','mines-e':'mines',cricket:'book-cricket'};
const DAILY_GAMES=['snake','drop','mines-i'];
const COUNTRIES=[['AR','Argentina'],['AU','Australia'],['BD','Bangladesh'],['BR','Brazil'],['CA','Canada'],['CL','Chile'],['CN','China'],['CO','Colombia'],['EG','Egypt'],['FR','France'],['DE','Germany'],['GH','Ghana'],['HK','Hong Kong'],['IN','India'],['ID','Indonesia'],['IE','Ireland'],['IL','Israel'],['IT','Italy'],['JP','Japan'],['KE','Kenya'],['KR','South Korea'],['MY','Malaysia'],['MX','Mexico'],['NP','Nepal'],['NL','Netherlands'],['NZ','New Zealand'],['NG','Nigeria'],['PK','Pakistan'],['PE','Peru'],['PH','Philippines'],['PL','Poland'],['PT','Portugal'],['RU','Russia'],['SA','Saudi Arabia'],['SG','Singapore'],['ZA','South Africa'],['ES','Spain'],['LK','Sri Lanka'],['SE','Sweden'],['CH','Switzerland'],['TH','Thailand'],['TR','Turkey'],['UA','Ukraine'],['AE','United Arab Emirates'],['GB','United Kingdom'],['US','United States'],['VN','Vietnam']];
const flag=cc=>/^[A-Z]{2}$/.test(cc||'')?String.fromCodePoint(...[...cc].map(c=>127397+c.charCodeAt(0))):'🌍';
const today=()=>new Date().toISOString().slice(0,10);
const ago=t=>{ const s=(Date.now()-new Date(t).getTime())/1000; return s<60?'just now':s<3600?Math.floor(s/60)+'m ago':s<86400?Math.floor(s/3600)+'h ago':Math.floor(s/86400)+'d ago'; };
const {mulberry32,seedFrom}=SIM;
const REMOTE=()=>!!(CFG.supabaseUrl&&CFG.anonKey);
const profile={ get(){ try{ return JSON.parse(store.get('prof98')||'null'); }catch(e){ return null; } }, set(p){ store.set('prof98',JSON.stringify(p)); } };
function guessCountry(){ try{ const m=((navigator.languages&&navigator.languages[0])||navigator.language||'').match(/-([A-Za-z]{2})$/); if(m&&COUNTRIES.some(c=>c[0]===m[1].toUpperCase())) return m[1].toUpperCase(); }catch(e){} return 'US'; }
const countryOpts=sel=>COUNTRIES.map(([c,n])=>`<option value="${c}"${c===sel?' selected':''}>${flag(c)} ${n}</option>`).join('');

/* daily challenge: everyone in the world gets the same seed for today */
const DAILY={game:null};
function takeDaily(game){
  const d=DAILY.game===game; if(d) DAILY.game=null;
  const dseed=seedFrom(today()+game);
  return {daily:d,dseed,mk:seed=>d?mulberry32(dseed):(seed==null?Math.random:mulberry32(seed))};
}
function openDaily(game){
  const app=GAME_APP[game]; if(!app) return;
  const ex=wins.find(x=>x.id===app); if(ex) ex.close();
  if(game.startsWith('mines-')) store.set('mine-lv',game.slice(6));
  DAILY.game=game; openApp(app);
}

// legacy anon keys are JWTs (send as Bearer too); new sb_publishable_ keys go in the apikey header only
const keyHeaders=()=>CFG.anonKey.startsWith('eyJ')?{apikey:CFG.anonKey,Authorization:'Bearer '+CFG.anonKey}:{apikey:CFG.anonKey};
/* verified runs: the server signs a token when a game starts and checks it when a score arrives */
async function fnCall(name,body){
  const r=await fetch(CFG.supabaseUrl.replace(/\/$/,'')+'/functions/v1/'+name,{method:'POST',headers:{...keyHeaders(),'Content-Type':'application/json'},body:JSON.stringify(body)});
  let j={}; try{ j=await r.json(); }catch(e){}
  if(!r.ok){ const e=new Error(j.error||('HTTP '+r.status)); e.status=r.status; throw e; }
  return j;
}
const Run={ begin(game){ const r={game,token:null,seed:(Math.random()*4294967296)>>>0};
  r.ready=REMOTE()?fnCall('start-run',{game}).then(j=>{ r.token=j.token; r.seed=j.seed>>>0; }).catch(()=>{}):Promise.resolve(); return r; } };

/* backend: Supabase REST when configured, browser storage otherwise */
async function sb(path,opts={}){
  const r=await fetch(CFG.supabaseUrl.replace(/\/$/,'')+'/rest/v1/'+path,{...opts,headers:{...keyHeaders(),'Content-Type':'application/json',...(opts.headers||{})}});
  if(!r.ok) throw new Error('HTTP '+r.status); return r;
}
const dedupe=rows=>{ const seen=new Set(); return rows.filter(r=>{ const k=r.name+'|'+r.country; if(seen.has(k)) return false; seen.add(k); return true; }); };
const LB={
  local(){ try{ return JSON.parse(store.get('lb98')||'[]'); }catch(e){ return []; } },
  async submit(e,run,log){
    let score=e.score;
    if(REMOTE()){
      if(run) await run.ready;
      if(!run||!run.token) throw Object.assign(new Error('could not start a verified run'),{status:0});
      score=(await fnCall('submit-score',{token:run.token,game:e.game,name:e.name,country:e.country,score:e.score,daily:e.daily||null,log})).score;
    }
    const L=this.local(); L.push({game:e.game,name:e.name,country:e.country,score,daily:e.daily||null,at:new Date().toISOString()}); store.set('lb98',JSON.stringify(L.slice(-300)));
    return score;
  },
  async top(game,{scope='world',country,limit=20}={}){
    const low=GAME_META[game].low;
    if(REMOTE()){
      let q=`scores?select=name,country,score,created_at&game=eq.${game}&order=score.${low?'asc':'desc'},created_at.asc&limit=80`;
      if(scope==='country') q+=`&country=eq.${country}`; if(scope==='daily') q+=`&daily=eq.${today()}`;
      return dedupe((await (await sb(q)).json()).map(r=>({...r,at:r.created_at}))).slice(0,limit);
    }
    const rows=this.local().filter(r=>r.game===game&&(scope!=='daily'||r.daily===today())&&(scope!=='country'||r.country===country)).sort((a,b)=>low?a.score-b.score:b.score-a.score);
    return dedupe(rows).slice(0,limit);
  },
  async rank(game,score,daily){
    const low=GAME_META[game].low;
    if(REMOTE()){
      const r=await sb(`scores?select=id&game=eq.${game}&score=${low?'lt':'gt'}.${score}${daily?`&daily=eq.${today()}`:''}`,{headers:{Prefer:'count=exact',Range:'0-0'}});
      const n=parseInt((r.headers.get('content-range')||'').split('/')[1],10); return isNaN(n)?null:n+1;
    }
    return this.local().filter(r=>r.game===game&&(!daily||r.daily===today())&&(low?r.score<score:r.score>score)).length+1;
  },
  async feed(){
    if(REMOTE()) return (await (await sb('scores?select=name,country,game,score,created_at&order=created_at.desc&limit=25')).json()).map(r=>({...r,at:r.created_at}));
    return this.local().slice(-25).reverse();
  }
};

/* after a game ends: ask for initials, submit, offer to share */
async function postScore(game,score,opt={}){
  const m=GAME_META[game], done=()=>{ if(opt.reward) celebrate(); };
  if(!m||!(score>0)){ done(); return; }
  await sleep(900);
  const pf=profile.get()||{name:'',country:guessCountry()};
  const r=await dialog({title:'New Score!',buttons:['Submit','No thanks'],cancel:'No thanks',width:390,
    body:`<b>${m.e} ${m.n}</b><br>Your score: <b>${m.fmt(score)}</b>${opt.daily?'<br>📅 Daily Challenge':''}<br><br>Initials (arcade tag):<br><input type="text" id="lbn" maxlength="12" value="${esc(pf.name)}" placeholder="e.g. ROH" autocomplete="off"><br><br>Country:<br><select id="lbc">${countryOpts(pf.country)}</select><br><br><small>${REMOTE()?'Your score goes on the worldwide leaderboard.':'The worldwide board is not connected yet, so this score is saved on this computer only.'}</small>`});
  if(r.btn!=='Submit'){ done(); return; }
  const name=($('#lbn',r.el).value.trim().toUpperCase().replace(/[^A-Z0-9 _.-]/g,'')||'ANON').slice(0,12), country=$('#lbc',r.el).value;
  profile.set({name,country});
  let rank=null, final=score;
  try{ final=await LB.submit({game,name,country,score,daily:opt.daily?today():null},opt.run,opt.log); rank=await LB.rank(game,final,opt.daily).catch(()=>null); }
  catch(e){ await alertBox(e.status>=400&&e.status<500?`Score rejected by the referee: ${e.message}.\n\nOnly real, verified runs make the leaderboard.`:'Could not reach the worldwide leaderboard right now.\n\nTry again in a moment.','warn','Leaderboard'); done(); return; }
  await shareDialog({game,score:final,name,country,rank,daily:opt.daily});
  done();
}
const shareURL=(game,daily)=>location.origin==='null'||location.protocol==='file:'?location.href.split('#')[0]:location.origin+location.pathname+'#'+(daily?'daily:'+game:GAME_APP[game]);
async function shareDialog({game,score,name,country,rank,daily}){
  const m=GAME_META[game], fm=m.fmt(score), url=shareURL(game,daily), text=`I scored ${fm} in ${m.n}${daily?' (Daily Challenge)':''} on Basement 98, running in my browser. Beat me:`;
  const btns=[navigator.share?'Share':'Copy link','Save image','Hall of Fame','Close'];
  const r=await dialog({title:'Score submitted',icon:'info',width:400,buttons:btns,cancel:'Close',
    body:`${flag(country)} <b>${esc(name)}</b>, ${m.e} ${m.n}: <b>${fm}</b>${rank?`<br><br>🏆 You are <b>#${rank}</b> ${daily?'today':'in the world'}${REMOTE()?'':' (on this computer)'}.`:''}<br><br>Dare your friends to beat it.`});
  if(r.btn==='Share') navigator.share({title:'Basement 98 in your browser',text,url}).catch(()=>{});
  else if(r.btn==='Copy link'){ try{ await navigator.clipboard.writeText(text+' '+url); alertBox('Link copied. Paste it anywhere.','info','Share'); }catch(e){ prompt('Copy this link:',text+' '+url); } }
  else if(r.btn==='Save image') shareImage({game,score,name,country,rank,daily,url});
  else if(r.btn==='Hall of Fame') openApp('halloffame',{game});
}
function shareImage({game,score,name,country,rank,daily,url}){
  const m=GAME_META[game], c=document.createElement('canvas'); c.width=1200; c.height=630; const g=c.getContext('2d');
  g.fillStyle='#008080'; g.fillRect(0,0,1200,630);
  const bev=(x,y,w,h)=>{ g.fillStyle='#c0c0c0'; g.fillRect(x,y,w,h); g.fillStyle='#fff'; g.fillRect(x,y,w,3); g.fillRect(x,y,3,h); g.fillStyle='#404040'; g.fillRect(x,y+h-3,w,3); g.fillRect(x+w-3,y,3,h); };
  bev(90,70,1020,490); const tb=g.createLinearGradient(100,0,1100,0); tb.addColorStop(0,'#000080'); tb.addColorStop(1,'#1084d0'); g.fillStyle=tb; g.fillRect(100,80,1000,44);
  g.fillStyle='#fff'; g.font='bold 26px Tahoma,Arial'; g.fillText(`${m.e}  ${m.n}${daily?' - Daily Challenge':''}`,114,111);
  g.fillStyle='#fff'; g.fillRect(100,134,1000,416);
  g.textAlign='center'; g.fillStyle='#000080'; g.font='140px VT323,monospace'; g.fillText(m.fmt(score),600,320);
  g.fillStyle='#000'; g.font='bold 40px Tahoma,Arial'; g.fillText(`${flag(country)} ${name}${rank?`  ·  #${rank} ${daily?'today':'worldwide'}`:''}`,600,395);
  g.fillStyle='#b00000'; g.font='bold 34px Tahoma,Arial'; g.fillText('Can you beat it?',600,468);
  g.fillStyle='#444'; g.font='26px Tahoma,Arial'; g.fillText('Basement 98, running in your browser. No install.',600,510); g.font='22px Tahoma,Arial'; g.fillText(url.replace(/^https?:\/\//,''),600,540);
  const a=document.createElement('a'); a.download=`basement-98-${game}-score.png`; a.href=c.toDataURL('image/png'); a.click();
}
/* first visit: everyone picks an arcade tag and country before playing (no account needed) */
async function askName(){
  if((profile.get()||{}).name) return;
  const pf0={name:'',country:guessCountry()};
  for(;;){
    const r=await dialog({title:'Welcome to Basement 98',icon:'info',buttons:['Start playing'],width:380,
      body:`<b>Who's playing?</b><br>Pick a name for the leaderboard. No sign-up needed.<br><br>Your name (arcade tag):<br><input type="text" id="wn" maxlength="12" placeholder="e.g. ROHAN" autocomplete="off" style="width:100%"><br><br>Country:<br><select id="wc">${countryOpts(pf0.country)}</select><br><br><small>Saved on this device. It is only shown publicly if you post a score.</small>`});
    const name=($('#wn',r.el).value.trim().toUpperCase().replace(/[^A-Z0-9 _.-]/g,'')).slice(0,12);
    if(name){ profile.set({name,country:$('#wc',r.el).value}); return; }
    await alertBox('Please type a name to continue. Letters and numbers only, up to 12 characters.','warn','Basement 98');
  }
}
async function editProfile(){
  const pf=profile.get()||{name:'',country:guessCountry()};
  const r=await dialog({title:'My Profile',buttons:['OK','Cancel'],cancel:'Cancel',width:360,body:`Initials (arcade tag):<br><input type="text" id="pn" maxlength="12" value="${esc(pf.name)}" autocomplete="off"><br><br>Country:<br><select id="pc">${countryOpts(pf.country)}</select>`});
  if(r.btn!=='OK') return; const name=($('#pn',r.el).value.trim().toUpperCase().replace(/[^A-Z0-9 _.-]/g,'')||'ANON').slice(0,12); profile.set({name,country:$('#pc',r.el).value});
}

/* Hall of Fame window */
APPS.halloffame={icon:'🏆',wh:[580,500],single:true,col:true,status:true,title:'Hall of Fame',
  menu:w=>[{label:'File',items:[['My Profile...',editProfile],['Refresh',()=>w.hof&&w.hof.render()],'-',['Close',()=>w.close()]]},
    {label:'Help',items:[['About the leaderboard',()=>alertBox(REMOTE()?'Scores are shared worldwide. One best score per player tag and country is shown.\n\nThe Daily Challenge gives everyone on Earth the same seeded game, reset at midnight UTC.':'This copy is running in local mode: scores are kept on this computer only.\n\nThe site owner can switch on the worldwide board (see SETUP-LEADERBOARD.md).','info','Hall of Fame')]]}],
  mount(w,a){
    const g0=a.game&&GAME_META[a.game]?a.game:'snake';
    w.body.innerHTML=`<div class="tabs"><span data-t="b" class="on">Leaderboard</span><span data-t="l">Live feed</span></div>
      <div class="tabbody" style="min-height:0;flex:1;display:flex;flex-direction:column;gap:6px;overflow:hidden;margin-bottom:6px">
      <div id="bp" style="display:flex;flex-direction:column;gap:6px;min-height:0;flex:1">
        <div style="display:flex;gap:6px"><select id="gm">${Object.entries(GAME_META).map(([k,v])=>`<option value="${k}">${v.e} ${v.n}</option>`).join('')}</select><select id="sc" style="width:150px"></select></div>
        <div class="helpbox" id="tbl" style="margin:0;padding:4px"></div>
        <div style="display:flex;gap:6px;align-items:center"><button id="pl" style="min-width:100px">▶ Play this game</button><button id="dl" style="min-width:100px">📅 Daily challenge</button><span style="margin-left:auto;font-size:11px" id="me"></span></div></div>
      <div id="lp" class="helpbox" style="margin:0;display:none"></div></div>`;
    const gm=$('#gm',w.body), sc=$('#sc',w.body), tbl=$('#tbl',w.body), lp=$('#lp',w.body), bp=$('#bp',w.body); gm.value=g0;
    const pf=()=>profile.get()||{name:'',country:guessCountry()}; let tab='b', timer=null;
    w.setStatus(REMOTE()?'🌐 Worldwide leaderboard online':'💾 Local mode: scores stay on this computer'); w.setStatus('Daily resets 00:00 UTC',1);
    const opts=()=>{ const cur=sc.value; sc.innerHTML=`<option value="world">🌍 World</option><option value="country">${flag(pf().country)} My country</option>${DAILY_GAMES.includes(gm.value)?'<option value="daily">📅 Today\'s daily</option>':''}`; if([...sc.options].some(o=>o.value===cur)) sc.value=cur; $('#dl',w.body).disabled=!DAILY_GAMES.includes(gm.value); };
    async function render(){
      if(tab==='l') return live();
      const game=gm.value, m=GAME_META[game]; tbl.textContent='Loading...';
      try{
        const rows=await LB.top(game,{scope:sc.value,country:pf().country});
        if(!rows.length){ tbl.innerHTML='<div class="center" style="padding:24px">No scores here yet.<br>Be the first!</div>'; return; }
        const me=pf();
        tbl.innerHTML=`<table class="lbt"><tr><th>#</th><th>Player</th><th>Country</th><th>${m.low?'Time':'Score'}</th><th>When</th></tr>${rows.map((r,i)=>`<tr class="${r.name===me.name&&r.country===me.country?'me':''}"><td>${i+1}${i===0?' 🥇':i===1?' 🥈':i===2?' 🥉':''}</td><td>${esc(r.name)}</td><td>${flag(r.country)} ${esc(r.country)}</td><td><b>${m.fmt(r.score)}</b></td><td>${ago(r.at)}</td></tr>`).join('')}</table>`;
      }catch(e){ tbl.innerHTML='<div class="center bad" style="padding:24px">Could not reach the leaderboard.<br>Check your connection and press Refresh.</div>'; }
    }
    async function live(){
      lp.textContent='Loading...';
      try{ const rows=await LB.feed(); lp.innerHTML=rows.length?rows.map(r=>`<div style="padding:3px 0;border-bottom:1px dotted #aaa">${flag(r.country)} <b>${esc(r.name)}</b> scored <b>${GAME_META[r.game]?GAME_META[r.game].fmt(r.score):r.score}</b> in ${GAME_META[r.game]?GAME_META[r.game].e+' '+GAME_META[r.game].n:esc(r.game)} <span style="color:#666">· ${ago(r.at)}</span></div>`).join(''):'<div class="center" style="padding:24px">Nothing yet. Go play something!</div>'; }
      catch(e){ lp.innerHTML='<div class="center bad" style="padding:24px">Could not reach the leaderboard.</div>'; }
    }
    const setTab=t=>{ tab=t; $$('.tabs span',w.body).forEach(s=>s.classList.toggle('on',s.dataset.t===t)); bp.style.display=t==='b'?'flex':'none'; lp.style.display=t==='l'?'block':'none'; clearInterval(timer); if(t==='l') timer=setInterval(live,20000); render(); };
    $$('.tabs span',w.body).forEach(s=>s.onclick=()=>setTab(s.dataset.t));
    gm.onchange=()=>{ opts(); render(); }; sc.onchange=render;
    $('#pl',w.body).onclick=()=>{ const game=gm.value; if(game.startsWith('mines-')) store.set('mine-lv',game.slice(6)); const ex=wins.find(x=>x.id===GAME_APP[game]); if(ex) ex.close(); openApp(GAME_APP[game]); };
    $('#dl',w.body).onclick=()=>openDaily(gm.value);
    const meEl=$('#me',w.body), paintMe=()=>{ meEl.textContent=pf().name?`Playing as ${flag(pf().country)} ${pf().name} (change)`:'Set your arcade tag'; };
    meEl.style.cssText='cursor:pointer;text-decoration:underline'; meEl.title='Choose the name and country shown on the leaderboard'; meEl.onclick=async()=>{ await editProfile(); paintMe(); render(); }; paintMe();
    w.hof={render}; opts(); render();
    return ()=>clearInterval(timer);
  }};
