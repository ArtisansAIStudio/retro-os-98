// ===== Console-era classics: two original games + a Retro Console that runs YOUR own NES game files =====

/* ================= BRICK BREAKER ================= */
function mountBreakout(w){
  w.body.innerHTML=`<div class="arcbar"><span>Mouse or ← → to move · Space / click to launch</span><span id="st"></span></div><canvas class="arc" width="480" height="320" style="cursor:none"></canvas>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w), COL=['#e63946','#ff8a00','#f5c400','#2a9d3a','#1d6fe0','#8338ec'], st=$('#st',w.body);
  let px,ball,bricks,lives,score,state,rewarded;
  const reset=()=>{ px=200; ball={x:240,y:290,vx:0,vy:0,on:true}; bricks=[]; for(let r=0;r<6;r++)for(let c=0;c<10;c++) bricks.push({x:c*48+2,y:36+r*18,w:44,h:14,col:COL[r],hit:false}); lives=3; score=0; state='play'; rewarded=false; };
  reset();
  const serve=()=>{ if(state!=='play'){ reset(); return; } if(ball.on){ ball.on=false; ball.vx=140*(Math.random()<.5?-1:1); ball.vy=-230; } };
  cv.onpointerdown=serve; cv.onpointermove=e=>{ const r=cv.getBoundingClientRect(); px=(e.clientX-r.left)*480/r.width-40; };
  const stop=loop(w,dt=>{
    const k=K.k; if(active!==w) k.clear();
    px+=((k.has('arrowright')||k.has('d')?1:0)-(k.has('arrowleft')||k.has('a')?1:0))*360*dt; px=Math.max(0,Math.min(400,px));
    if(k.has(' ')||k.has('enter')) serve();
    if(state==='play'){
      if(ball.on){ ball.x=px+40; ball.y=288; }
      else {
        ball.x+=ball.vx*dt; ball.y+=ball.vy*dt;
        if(ball.x<5){ ball.x=5; ball.vx=Math.abs(ball.vx); } if(ball.x>475){ ball.x=475; ball.vx=-Math.abs(ball.vx); } if(ball.y<5){ ball.y=5; ball.vy=Math.abs(ball.vy); }
        if(ball.vy>0&&ball.y>=290&&ball.y<=302&&ball.x>px-4&&ball.x<px+84){ ball.vy=-Math.abs(ball.vy); ball.vx=(ball.x-(px+40))*5.5; }
        for(const b of bricks){ if(b.hit) continue; if(ball.x+5>b.x&&ball.x-5<b.x+b.w&&ball.y+5>b.y&&ball.y-5<b.y+b.h){ b.hit=true; score+=10; const fromSide=Math.min(ball.x+5-b.x,b.x+b.w-(ball.x-5))<Math.min(ball.y+5-b.y,b.y+b.h-(ball.y-5)); if(fromSide) ball.vx*=-1; else ball.vy*=-1; const sp=Math.hypot(ball.vx,ball.vy); if(sp<430){ ball.vx*=1.015; ball.vy*=1.015; } break; } }
        if(ball.y>330){ lives--; ball.on=true; if(lives<=0) state='over'; }
        if(bricks.every(b=>b.hit)){ state='win'; if(!rewarded){ rewarded=true; celebrate(); } }
      }
    }
    g.fillStyle='#0a0a1e'; g.fillRect(0,0,480,320);
    bricks.forEach(b=>{ if(!b.hit){ g.fillStyle=b.col; g.fillRect(b.x,b.y,b.w,b.h); g.fillStyle='rgba(255,255,255,.3)'; g.fillRect(b.x,b.y,b.w,3); } });
    g.fillStyle='#ddd'; g.fillRect(px,296,80,10); g.fillStyle='#fff'; g.beginPath(); g.arc(ball.x,ball.y,5,0,7); g.fill();
    st.textContent=`Score ${score}   Lives ${'♥'.repeat(Math.max(0,lives))}`;
    if(state!=='play'){ g.fillStyle='rgba(0,0,0,.6)'; g.fillRect(0,110,480,100); g.textAlign='center'; g.fillStyle=state==='win'?'#8f8':'#f66'; g.font='bold 30px Arial'; g.fillText(state==='win'?'YOU WIN!':'GAME OVER',240,160); g.fillStyle='#fff'; g.font='16px Arial'; g.fillText('Click or press Space to play again',240,190); g.textAlign='left'; }
  });
  return ()=>{ stop(); K.off(); };
}

/* ================= ALIEN INVADERS ================= */
function mountInvaders(w){
  w.body.innerHTML=`<div class="arcbar"><span>← → or A D to move · Space to fire</span><span id="st"></span></div><canvas class="arc" width="480" height="360"></canvas>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w), st=$('#st',w.body);
  let px,shots,bombs,al,dir,lives,score,wave,state,cool,rewarded,tick;
  const spawn=()=>{ al=[]; for(let r=0;r<5;r++)for(let c=0;c<8;c++) al.push({x:50+c*44,y:40+r*32,r}); dir=1; shots=[]; bombs=[]; };
  const reset=()=>{ px=224; lives=3; score=0; wave=1; state='play'; cool=0; rewarded=false; tick=0; spawn(); };
  reset();
  cv.onpointerdown=()=>{ if(state!=='play') reset(); };
  const stop=loop(w,dt=>{
    const k=K.k; if(active!==w) k.clear();
    if(state!=='play'){ if(k.has(' ')||k.has('enter')) reset(); }
    else {
      px+=((k.has('arrowright')||k.has('d')?1:0)-(k.has('arrowleft')||k.has('a')?1:0))*260*dt; px=Math.max(10,Math.min(450,px));
      cool-=dt; if(k.has(' ')&&cool<=0){ shots.push({x:px,y:322}); cool=.38; }
      shots.forEach(s=>s.y-=420*dt); shots=shots.filter(s=>s.y>-10);
      const speed=(30+(40-al.length)*3+wave*8); let edge=false; al.forEach(a=>{ a.x+=dir*speed*dt; if(a.x<10||a.x>450) edge=true; });
      if(edge){ dir*=-1; al.forEach(a=>{ a.y+=14; a.x+=dir*4; }); }
      if(Math.random()<dt*(.7+wave*.25)&&al.length){ const cols={}; al.forEach(a=>{ const c=Math.round(a.x/44); if(!cols[c]||a.y>cols[c].y) cols[c]=a; }); const a=pick(Object.values(cols)); bombs.push({x:a.x,y:a.y+10}); }
      bombs.forEach(b=>b.y+=170*dt); bombs=bombs.filter(b=>b.y<370);
      for(const s of shots){ const i=al.findIndex(a=>Math.abs(a.x-s.x)<16&&Math.abs(a.y-s.y)<13); if(i>=0){ score+=(5-al[i].r)*10; al.splice(i,1); s.y=-99; } }
      for(const b of bombs){ if(b.y>318&&b.y<340&&Math.abs(b.x-px)<16){ b.y=999; lives--; if(lives<=0) state='over'; } }
      if(al.some(a=>a.y>310)) state='over';
      if(!al.length){ wave++; spawn(); if(!rewarded){ rewarded=true; celebrate(); } }
    }
    g.fillStyle='#000'; g.fillRect(0,0,480,360);
    g.fillStyle='#143'; g.fillRect(0,340,480,2);
    g.font='22px serif'; g.textAlign='center'; al.forEach(a=>g.fillText(['👾','👾','👽','👽','🛸'][a.r],a.x,a.y+8));
    g.fillStyle='#fff'; shots.forEach(s=>g.fillRect(s.x-1,s.y,3,10)); g.fillStyle='#f55'; bombs.forEach(b=>g.fillRect(b.x-1,b.y,3,10));
    g.fillStyle='#4f4'; g.beginPath(); g.moveTo(px,314); g.lineTo(px-14,336); g.lineTo(px+14,336); g.fill(); g.fillRect(px-2,308,4,8);
    st.textContent=`Score ${score}   Wave ${wave}   Lives ${'♥'.repeat(Math.max(0,lives))}`;
    if(state!=='play'){ g.fillStyle='rgba(0,0,0,.65)'; g.fillRect(0,130,480,100); g.fillStyle='#f66'; g.font='bold 30px Arial'; g.fillText('GAME OVER',240,180); g.fillStyle='#fff'; g.font='16px Arial'; g.fillText('Click or press Space to try again',240,210); }
    g.textAlign='left';
  });
  return ()=>{ stop(); K.off(); };
}

/* ================= RETRO CONSOLE: runs NES games the player owns (nothing is included) ================= */
function loadJsnes(){ return window.jsnes?Promise.resolve():new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/jsnes/1.1.0/jsnes.min.js'; s.onload=res; s.onerror=()=>rej(new Error('offline')); document.head.appendChild(s); }); }
function mountNES(w){
  w.body.innerHTML=`<div class="arcbar"><span>Arrows · Z = B · X = A · Enter = Start · Shift = Select</span><button id="ins" style="min-width:0;padding:2px 10px">📼 Insert cartridge...</button></div>
    <div style="position:relative;background:#000"><canvas class="arc" width="256" height="240" style="image-rendering:pixelated;aspect-ratio:256/240"></canvas>
    <div id="nm" style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;color:#ccc;padding:24px;font:14px/1.5 Arial"><div><div style="font-size:42px">🎮</div><b style="font-size:17px;color:#fff">Retro Console</b><br>No games are included.<br>Insert a <b>.nes</b> cartridge file that you own,<br>or drag one onto this window.<br><br><small style="color:#999">Runs entirely in your browser. Your files never leave your computer.</small></div></div></div>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), nm=$('#nm',w.body); let nes=null, ctx=null, node=null, acc=0, gen=0;
  const BTN=()=>({x:jsnes.Controller.BUTTON_A,z:jsnes.Controller.BUTTON_B,shift:jsnes.Controller.BUTTON_SELECT,enter:jsnes.Controller.BUTTON_START,arrowup:jsnes.Controller.BUTTON_UP,arrowdown:jsnes.Controller.BUTTON_DOWN,arrowleft:jsnes.Controller.BUTTON_LEFT,arrowright:jsnes.Controller.BUTTON_RIGHT});
  let shelf=null; const say=h=>{ nm.style.display='grid'; nm.firstElementChild.innerHTML=h; if(shelf) nm.firstElementChild.appendChild(shelf); };
  const kd=e=>{ if(!nes||active!==w) return; const b=BTN()[e.key.toLowerCase()]; if(b===undefined) return; e.preventDefault(); nes.buttonDown(1,b); };
  const ku=e=>{ if(!nes) return; const b=BTN()[e.key.toLowerCase()]; if(b!==undefined) nes.buttonUp(1,b); };
  document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
  const halt=()=>{ gen++; nes=null; if(node){ node.disconnect(); node=null; } if(ctx){ ctx.close(); ctx=null; } };
  async function insert(file){
    if(!/\.nes$/i.test(file.name)){ say('<b style="color:#f88">That is not a .nes file.</b><br>This console only reads NES cartridge files.'); return; }
    say('Loading emulator...');
    try{ await loadJsnes(); }catch(e){ say('<b style="color:#f88">The emulator needs an internet connection to load.</b>'); return; }
    halt(); const my=gen;
    const bytes=new Uint8Array(await file.arrayBuffer()); let bin=''; for(let i=0;i<bytes.length;i+=8192) bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+8192));
    const AC=window.AudioContext||window.webkitAudioContext; ctx=new AC(); const M=8191, L=new Float32Array(M+1), R=new Float32Array(M+1); let wr=0, rd=0;
    node=ctx.createScriptProcessor(1024,0,2); node.onaudioprocess=e=>{ const a=e.outputBuffer.getChannelData(0), b=e.outputBuffer.getChannelData(1); for(let i=0;i<a.length;i++){ if(rd<wr){ a[i]=L[rd&M]; b[i]=R[rd&M]; rd++; } else { a[i]=0; b[i]=0; } } if(wr-rd>4096) rd=wr-2048; }; node.connect(ctx.destination);
    const img=g.getImageData(0,0,256,240), b32=new Uint32Array(img.data.buffer);
    const n=new jsnes.NES({onFrame:fb=>{ for(let i=0;i<fb.length;i++) b32[i]=0xFF000000|fb[i]; g.putImageData(img,0,0); },onAudioSample:(l,r)=>{ L[wr&M]=l; R[wr&M]=r; wr++; },sampleRate:ctx.sampleRate});
    try{ n.loadROM(bin); }catch(e){ halt(); say('<b style="color:#f88">This cartridge could not be read.</b><br>It may be corrupt, or use hardware this console does not support.'); return; }
    if(my!==gen) return; nes=n; nm.style.display='none'; w.setTitle?.('Retro Console - '+file.name);
  }
  const pickFile=()=>{ const f=document.createElement('input'); f.type='file'; f.accept='.nes'; f.onchange=()=>{ if(f.files[0]) insert(f.files[0]); }; f.click(); };
  $('#ins',w.body).onclick=pickFile;
  fetch('roms/roms.json').then(r=>r.ok?r.json():[]).then(list=>{
    if(!Array.isArray(list)||!list.length) return;
    shelf=document.createElement('div'); shelf.style.cssText='margin-top:16px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:420px';
    shelf.innerHTML='<div style="width:100%;color:#fff;font-weight:700">Cartridge shelf</div>';
    list.forEach(c=>{ if(!c||!c.name||!/^roms\/[\w .\-]+\.nes$/i.test(c.file||'')) return; const b=document.createElement('button'); b.style.minWidth='0'; b.title=(c.credit||'')+(c.license?' - '+c.license:''); b.textContent='📼 '+c.name;
      b.onclick=async()=>{ try{ const r=await fetch(c.file); if(!r.ok) throw 0; insert(new File([await r.arrayBuffer()],c.file.split('/').pop())); }catch(e){ say('<b style="color:#f88">Could not load that cartridge.</b>'); } }; shelf.appendChild(b); });
    nm.firstElementChild.appendChild(shelf);
  }).catch(()=>{});
  w.body.ondragover=e=>e.preventDefault(); w.body.ondrop=e=>{ e.preventDefault(); const f=e.dataTransfer.files[0]; if(f) insert(f); };
  const stop=loop(w,dt=>{ if(!nes) return; acc=Math.min(acc+dt,.2); while(acc>=1/60){ try{ nes.frame(); }catch(e){ halt(); say('<b style="color:#f88">The game crashed.</b><br>Some cartridges are not supported.'); return; } acc-=1/60; } });
  return ()=>{ stop(); halt(); document.removeEventListener('keydown',kd); document.removeEventListener('keyup',ku); };
}

/* ================= JUNGLE COMMANDO: run-and-gun, 1 or 2 player co-op ================= */
function mountCommando(w){
  w.body.innerHTML=`<div class="arcbar"><span>P1: A D move · W jump · F fire</span><span id="md"><button data-m="1" class="on" style="min-width:0">1 Player</button> <button data-m="2" style="min-width:0">2 Player Co-op</button></span><span>P2: ← → move · ↑ jump · / fire</span></div><canvas class="arc" width="480" height="270"></canvas>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w), LEN=3300, GY=230, GRAV=900;
  const PITS=[[520,570],[1180,1240],[1900,1960],[2400,2470]], PLAT=[[300,170,90],[640,175,110],[900,165,100],[1300,170,120],[1560,160,100],[1760,175,90],[2050,170,110],[2300,165,100],[2600,175,120]];
  let mode=1, P, en, shots, bombs, camX, state, boss, rewarded, tt;
  const mkP=(i,x)=>({i,x,y:GY-26,vx:0,vy:0,face:1,ground:true,lives:3,cool:0,inv:0,alive:true,col:i?'#4aa3ff':'#ff5050'});
  const reset=()=>{ P=[mkP(0,40)]; if(mode===2) P.push(mkP(1,70));
    en=[]; for(let x=420;x<2900;x+=170+rnd(90)){ if(PITS.some(p=>x>p[0]-30&&x<p[1]+30)) continue; en.push({x,y:GY-26,hp:2,t:Math.random()<.3?'t':'s',cd:1+Math.random()*2,vx:0}); }
    boss={x:3080,y:GY-46,hp:45,max:45,cd:1.5,alive:true}; shots=[]; bombs=[]; camX=0; state='play'; rewarded=false; tt=0; };
  reset();
  $('#md',w.body).onclick=e=>{ const m=e.target.dataset.m; if(!m) return; mode=+m; $$('#md button',w.body).forEach(b=>b.classList.toggle('on',b.dataset.m===m)); reset(); };
  const inPit=x=>PITS.some(p=>x>p[0]+6&&x<p[1]-6);
  const keys=i=>{ const k=K.k; return i===0?{l:k.has('a'),r:k.has('d'),j:k.has('w'),f:k.has('f')}:{l:k.has('arrowleft'),r:k.has('arrowright'),j:k.has('arrowup'),f:k.has('/')}; };
  const kill=p=>{ if(p.inv>0||!p.alive) return; p.lives--; if(p.lives<=0){ p.alive=false; } else { p.x=camX+30; p.y=40; p.vy=0; p.inv=2.2; } };
  const stop=loop(w,dt=>{
    if(active!==w) K.k.clear();
    if(state!=='play'){ if(K.k.has('enter')||K.k.has(' ')) reset(); }
    else {
      tt+=dt;
      P.forEach(p=>{ if(!p.alive) return; const c=keys(p.i); p.vx=((c.r?1:0)-(c.l?1:0))*125; if(p.vx) p.face=Math.sign(p.vx);
        if(c.j&&p.ground){ p.vy=-370; p.ground=false; } p.vy+=GRAV*dt; p.x+=p.vx*dt; p.x=Math.max(camX+4,Math.min(LEN+150,p.x)); const oy=p.y; p.y+=p.vy*dt; p.ground=false;
        const feet=p.y+26, ofeet=oy+26;
        if(!inPit(p.x)&&feet>=GY&&ofeet<=GY+4&&p.vy>=0){ p.y=GY-26; p.vy=0; p.ground=true; }
        for(const [px,py,pw] of PLAT){ if(p.vy>=0&&p.x>px-4&&p.x<px+pw+4&&ofeet<=py+2&&feet>=py){ p.y=py-26; p.vy=0; p.ground=true; } }
        if(p.y>300) kill(p);
        p.cool-=dt; p.inv-=dt; if(c.f&&p.cool<=0){ shots.push({x:p.x+p.face*12,y:p.y+9,vx:p.face*380,life:.75}); p.cool=.22; } });
      const alive=P.filter(p=>p.alive); if(!alive.length) state='over';
      else camX=Math.max(camX,Math.min(LEN-200,Math.max(...alive.map(p=>p.x))-220));
      shots.forEach(s=>{ s.x+=s.vx*dt; s.life-=dt; }); shots=shots.filter(s=>s.life>0);
      en.forEach(e=>{ const near=alive.length?alive.reduce((a,b)=>Math.abs(b.x-e.x)<Math.abs(a.x-e.x)?b:a):null; if(!near) return; const d=near.x-e.x;
        if(e.t==='s'&&Math.abs(d)<260){ e.x+=Math.sign(d)*38*dt; } e.cd-=dt; if(Math.abs(d)<240&&e.cd<=0){ bombs.push({x:e.x,y:e.y+8,vx:Math.sign(d)*140}); e.cd=1.8+Math.random()*1.4; }
        alive.forEach(p=>{ if(Math.abs(p.x-e.x)<12&&Math.abs(p.y-e.y)<22) kill(p); }); });
      for(const s of shots){ const e=en.find(e=>Math.abs(e.x-s.x)<12&&Math.abs(e.y+8-s.y)<18); if(e){ e.hp--; s.life=0; if(e.hp<=0) en.splice(en.indexOf(e),1); }
        if(boss.alive&&Math.abs(boss.x-s.x)<46&&Math.abs(boss.y+20-s.y)<28){ boss.hp--; s.life=0; if(boss.hp<=0){ boss.alive=false; state='win'; if(!rewarded){ rewarded=true; celebrate(); } } } }
      if(boss.alive&&camX>LEN-480){ boss.cd-=dt; if(boss.cd<=0){ boss.cd=1.3; [-.35,0,.35].forEach(a=>bombs.push({x:boss.x-40,y:boss.y+18,vx:-170,vy:a*170})); } }
      bombs.forEach(b=>{ b.x+=b.vx*dt; b.y+=(b.vy||0)*dt; }); bombs=bombs.filter(b=>b.x>camX-20&&b.x<camX+520&&b.y<300);
      alive.forEach(p=>bombs.forEach(b=>{ if(Math.abs(b.x-p.x)<9&&Math.abs(b.y-(p.y+12))<15){ b.x=-999; kill(p); } }));
    }
    const sx=-Math.round(camX);
    const sk=g.createLinearGradient(0,0,0,GY); sk.addColorStop(0,'#2b6a4a'); sk.addColorStop(1,'#a8d58c'); g.fillStyle=sk; g.fillRect(0,0,480,270);
    g.fillStyle='#1d4a33'; for(let i=0;i<14;i++){ const x=((i*130-camX*.4)%1820+1820)%1820-60; g.fillRect(x,70+(i%3)*14,16,GY-70-(i%3)*14); g.beginPath(); g.arc(x+8,70+(i%3)*14,34,0,7); g.fill(); }
    g.fillStyle='#4a3520'; g.fillRect(0,GY,480,40); g.fillStyle='#2f7a2a'; g.fillRect(0,GY,480,6);
    PITS.forEach(([a,b])=>{ g.fillStyle='#0d2418'; g.fillRect(a+sx,GY,b-a,40); });
    PLAT.forEach(([x,y,wd])=>{ g.fillStyle='#6b4a2a'; g.fillRect(x+sx,y,wd,8); g.fillStyle='#2f7a2a'; g.fillRect(x+sx,y,wd,3); });
    en.forEach(e=>{ if(e.x+sx<-20||e.x+sx>500) return; g.fillStyle=e.t==='t'?'#555':'#c9a227'; g.fillRect(e.x+sx-8,e.y+(e.t==='t'?8:0),16,e.t==='t'?18:26); g.fillStyle='#222'; g.fillRect(e.x+sx-8,e.y+(e.t==='t'?8:0),16,5); });
    if(boss.alive){ const bx=boss.x+sx; g.fillStyle='#3d4a3d'; g.fillRect(bx-46,boss.y+10,92,36); g.fillStyle='#2a342a'; g.fillRect(bx-26,boss.y-6,52,18); g.fillStyle='#111'; g.fillRect(bx-66,boss.y+16,30,7); g.fillStyle='#000'; for(let i=0;i<4;i++) g.fillRect(bx-42+i*24,boss.y+42,18,10); g.fillStyle='#600'; g.fillRect(bx-46,boss.y-14,92,5); g.fillStyle='#f33'; g.fillRect(bx-46,boss.y-14,92*boss.hp/boss.max,5); }
    P.forEach(p=>{ if(!p.alive||(p.inv>0&&Math.floor(p.inv*10)%2)) return; const x=p.x+sx; g.fillStyle=p.col; g.fillRect(x-7,p.y+6,14,20); g.fillStyle='#f1c27d'; g.fillRect(x-5,p.y-2,10,9); g.fillStyle='#fff'; g.fillRect(x-6,p.y-3,12,3); g.fillStyle='#222'; g.fillRect(p.face>0?x+4:x-16,p.y+11,12,4); });
    g.fillStyle='#ffe14d'; shots.forEach(s=>g.fillRect(s.x+sx-3,s.y-1,7,3)); g.fillStyle='#ff4d4d'; bombs.forEach(b=>g.fillRect(b.x+sx-2,b.y-2,5,5));
    g.fillStyle='#000a'; g.fillRect(4,4,P.length>1?190:100,18); g.fillStyle='#fff'; g.font='bold 12px Arial'; g.fillText(P.map(p=>`P${p.i+1} ${'♥'.repeat(Math.max(0,p.lives))||'x'}`).join('   '),10,17);
    if(state!=='play'){ g.fillStyle='rgba(0,0,0,.6)'; g.fillRect(0,90,480,90); g.textAlign='center'; g.fillStyle=state==='win'?'#8f8':'#f66'; g.font='bold 30px Arial'; g.fillText(state==='win'?'MISSION COMPLETE!':'GAME OVER',240,135); g.fillStyle='#fff'; g.font='15px Arial'; g.fillText('Press Enter to play again',240,160); g.textAlign='left'; }
  });
  return ()=>{ stop(); K.off(); };
}

ARCADE.push(
  {id:'commando',f:'JUNGLE.EXE',n:'Jungle Commando (2-Player Co-op)',e:'💥',wh:[640,480],m:mountCommando},
  {id:'breakout',f:'BRICKS.EXE',n:'Brick Breaker',e:'🧱',wh:[520,440],m:mountBreakout},
  {id:'invaders',f:'ALIENS.EXE',n:'Alien Invaders',e:'👾',wh:[520,480],m:mountInvaders},
  {id:'nes',f:'RETRO.EXE',n:'Retro Console (bring your own games)',e:'🎮',wh:[560,560],m:mountNES});
