// ===== Console-era classics: original games =====

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
        if(ball.y>330){ lives--; ball.on=true; Death.play(w,{kind:lives<=0?'boom':'pop',x:Math.max(10,Math.min(470,ball.x)),y:316,col:'#ffd23f',text:lives<=0?'GAME OVER':''}); if(lives<=0) state='over'; }
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
      for(const b of bombs){ if(b.y>318&&b.y<340&&Math.abs(b.x-px)<16){ b.y=999; lives--; Death.play(w,{kind:'boom',x:px,y:326,col:'#4cff4c',text:lives<=0?'GAME OVER':''}); if(lives<=0) state='over'; } }
      if(al.some(a=>a.y>310)&&state==='play'){ state='over'; Death.play(w,{kind:'flash',text:'INVADED!',tcol:'#ff6b6b'}); }
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

/* ================= JUNGLE COMMANDO: Contra-style run-and-gun, 1 or 2 player co-op ================= */
function mountCommando(w){
  w.body.innerHTML=`<div class="arcbar"><span>P1: A D move · W aim up · S duck · G / Space jump · F fire</span><span id="md"><button data-m="1" class="on" style="min-width:0">1 Player</button> <button data-m="2" style="min-width:0">2 Player Co-op</button></span><span>P2: ← → · ↑ aim · ↓ duck · . jump · / fire</span></div><canvas class="arc" width="480" height="270"></canvas>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w), LEN=3600, CAMMAX=LEN-550, GY=230, GRAV=900;
  if(coarse) touchPad(w,K,[['a','◀'],['d','▶'],['w','▲'],['s','▼'],['g','⤒ Jump'],['f','🔫 Fire']]);
  const PITS=[[560,620],[1240,1310],[2000,2070],[2600,2680],[3000,3060]], PLAT=[[300,170,90],[640,165,110],[900,150,100],[1300,160,120],[1560,150,100],[1780,170,90],[2100,160,110],[2340,150,100],[2700,170,120],[3100,165,100]];
  const WC={R:'#ffffff',M:'#ffd23f',S:'#ff4d4d',L:'#4dd2ff'};
  let mode=1,P,en,shots,bombs,items,flyers,caps,fx,camX,state,boss,rewarded,tt,spawnT,score;
  const rnd=n=>Math.random()*n;
  const mkP=(i,x)=>({i,x,y:GY-26,vx:0,vy:0,face:1,ground:true,onPlat:false,lives:3,cool:0,inv:0,alive:true,col:i?'#4aa3ff':'#ff5050',wp:'R',prone:false,drop:0,ax:1,ay:0,run:0,flash:0});
  const reset=()=>{ P=[mkP(0,40)]; if(mode===2) P.push(mkP(1,70)); en=[];
    for(let x=430;x<LEN-500;x+=170+rnd(110)){ if(PITS.some(p=>x>p[0]-30&&x<p[1]+30)) continue; en.push(Math.random()<.62?{t:'s',x,y:GY-26,hp:2,cd:1+rnd(2)}:{t:'t',x,y:GY-18,hp:5,cd:1+rnd(1.5)}); }
    PLAT.forEach(([px,py,pw])=>{ if(Math.random()<.55&&px>400&&px<LEN-500) en.push({t:'n',x:px+pw/2,y:py-26,hp:2,cd:1.5+rnd(2)}); });
    boss={x:LEN-220,y:GY-120,alive:true,cd:1.6,parts:[{ox:-34,oy:-6,hp:10,r:15,k:'c'},{ox:34,oy:-6,hp:10,r:15,k:'c'},{ox:0,oy:44,hp:45,max:45,r:17,k:'core'}]};
    shots=[]; bombs=[]; items=[]; flyers=[]; fx=[]; camX=0; state='play'; rewarded=false; tt=0; spawnT=3; score=0;
    caps=[[520,'S'],[1150,'M'],[1750,'L'],[2350,'S'],[2950,'M']].map(([x,wp])=>({x,wp,done:false})); };
  reset(); w.cm={get P(){return P;},get en(){return en;},get items(){return items;},get state(){return state;},get camX(){return camX;},get boss(){return boss;},get score(){return score;},get shots(){return shots;}};
  $('#md',w.body).onclick=e=>{ const m=e.target.dataset.m; if(!m) return; mode=+m; $$('#md button',w.body).forEach(b=>b.classList.toggle('on',b.dataset.m===m)); reset(); };
  const inPit=x=>PITS.some(p=>x>p[0]+6&&x<p[1]-6);
  const safeX=x=>{ while(inPit(x)||inPit(x+14)||inPit(x-14)) x+=18; return x; };
  const keys=i=>{ const k=K.k; return i===0?{l:k.has('a'),r:k.has('d'),u:k.has('w'),d:k.has('s'),j:k.has('g')||k.has(' '),f:k.has('f')}:{l:k.has('arrowleft'),r:k.has('arrowright'),u:k.has('arrowup'),d:k.has('arrowdown'),j:k.has('.')||k.has(','),f:k.has('/')}; };
  const boom=(x,y,n,col)=>{ for(let i=0;i<n;i++) fx.push({x,y,vx:(Math.random()-.5)*200,vy:-Math.random()*150,t:.4+Math.random()*.2,col:col||(Math.random()<.5?'#ffb02e':'#fff27a')}); };
  const aimAt=(sx,sy,t,spd)=>{ const dx=t.x-sx, dy=t.y+(t.prone?20:10)-sy, L=Math.hypot(dx,dy)||1; return {vx:dx/L*spd,vy:dy/L*spd}; };
  const kill=p=>{ if(p.inv>0||!p.alive) return; p.lives--; p.wp='R'; Death.play(w,{kind:p.lives<=0?'boom':'crash',x:p.x-camX,y:p.y,col:'#ff8a00'}); if(p.lives<=0){ p.alive=false; } else { p.x=safeX(camX+30); p.y=40; p.vy=0; p.inv=2.5; } };
  const fire=p=>{ const wp=p.wp, sp=wp==='L'?640:wp==='M'?430:390, L=Math.hypot(p.ax,p.ay)||1, dx=p.ax/L, dy=p.ay/L, ox=p.x+dx*13, oy=p.y+(p.prone?20:11)+dy*9;
    const mk=a=>{ const c=Math.cos(a), s=Math.sin(a); shots.push({x:ox,y:oy,vx:(dx*c-dy*s)*sp,vy:(dx*s+dy*c)*sp,life:wp==='L'?.8:.7,dmg:wp==='L'?3:1,w:wp}); };
    if(wp==='S'){ [-.36,-.18,0,.18,.36].forEach(mk); p.cool=.3; } else if(wp==='M'){ mk((Math.random()-.5)*.1); p.cool=.085; } else if(wp==='L'){ mk(0); p.cool=.3; } else { mk(0); p.cool=.2; }
    p.flash=.06; };
  const stop=loop(w,dt=>{
    if(active!==w) K.k.clear();
    if(state!=='play'){ if(K.k.has('enter')||K.k.has(' ')) reset(); }
    else {
      tt+=dt;
      P.forEach(p=>{ if(!p.alive) return; const k=keys(p.i), ax=(k.r?1:0)-(k.l?1:0);
        p.prone=p.ground&&k.d&&!ax&&!k.u; p.vx=p.prone?0:ax*125; if(ax) p.face=ax;
        p.ay=k.u?-1:((k.d&&!p.prone&&(ax||!p.ground))?1:0); p.ax=ax; if(!p.ax&&!p.ay) p.ax=p.face; if(!ax&&p.ay) p.ax=0;
        if(k.j&&p.ground){ if(p.prone&&p.onPlat){ p.drop=.3; p.ground=false; p.y+=4; } else if(!p.prone){ p.vy=-365; p.ground=false; } }
        p.drop-=dt; p.vy+=GRAV*dt; p.x+=p.vx*dt; p.x=Math.max(camX+4,Math.min(boss.alive?boss.x-80:LEN+150,p.x)); const oy=p.y; p.y+=p.vy*dt; p.ground=false; p.onPlat=false;
        const feet=p.y+26, ofeet=oy+26;
        if(!inPit(p.x)&&feet>=GY&&ofeet<=GY+4&&p.vy>=0){ p.y=GY-26; p.vy=0; p.ground=true; }
        if(p.drop<=0) for(const [px,py,pw] of PLAT){ if(p.vy>=0&&p.x>px-4&&p.x<px+pw+4&&ofeet<=py+2&&feet>=py){ p.y=py-26; p.vy=0; p.ground=true; p.onPlat=true; } }
        if(p.y>300){ if(p.inv>0){ p.x=safeX(camX+40); p.y=40; p.vy=0; } else kill(p); }
        p.run+=Math.abs(p.vx)*dt*.09; p.cool-=dt; p.inv-=dt; p.flash-=dt;
        if(k.f&&p.cool<=0) fire(p); });
      const alive=P.filter(p=>p.alive); if(!alive.length) state='over';
      else camX=Math.max(camX,Math.min(CAMMAX,Math.max(...alive.map(p=>p.x))-220));
      // running soldiers keep coming from the sides, like the first stage
      spawnT-=dt; if(spawnT<=0&&camX<CAMMAX-220){ spawnT=2+rnd(2.2); const fromR=Math.random()<.8, x=fromR?camX+510:camX-20; if(!inPit(x)) en.push({t:'r',x,y:GY-26,hp:1,cd:0,run:rnd(6)}); }
      caps.forEach(c=>{ if(!c.done&&camX+500>=c.x){ c.done=true; flyers.push({x:camX+500,y0:60+rnd(30),wp:c.wp,hp:1,ph:rnd(6)}); } });
      flyers.forEach(f=>{ f.x-=55*dt; f.y=f.y0+Math.sin(tt*2.6+f.ph)*20; });
      flyers=flyers.filter(f=>f.x>camX-40&&f.hp>0);
      items.forEach(it=>{ it.vy+=GRAV*dt; it.y+=it.vy*dt; if(!inPit(it.x)&&it.y>=GY-8){ it.y=GY-8; it.vy=0; } for(const [px,py,pw] of PLAT){ if(it.vy>=0&&it.x>px&&it.x<px+pw&&it.y>=py-8&&it.y-it.vy*dt<=py-8){ it.y=py-8; it.vy=0; } } });
      items=items.filter(it=>{ if(it.y>300) return false; const p=alive.find(p=>Math.abs(p.x-it.x)<14&&Math.abs(p.y+13-it.y)<20); if(p){ p.wp=it.wp; score+=200; boom(it.x,it.y,8,WC[it.wp]); return false; } return true; });
      shots.forEach(s=>{ s.x+=s.vx*dt; s.y+=s.vy*dt; s.life-=dt; }); shots=shots.filter(s=>s.life>0&&s.y>-10&&s.y<280);
      en.forEach(e=>{ const near=alive.length?alive.reduce((a,b)=>Math.abs(b.x-e.x)<Math.abs(a.x-e.x)?b:a):null; if(!near) return; const d=near.x-e.x; e.cd-=dt;
        if(e.t==='r'){ e.x+=Math.sign(d)*88*dt; e.run+=dt*9; if(inPit(e.x)) e.hp=0; }
        else if(Math.abs(d)<(e.t==='n'?330:290)&&e.cd<=0&&e.x>camX-10&&e.x<camX+490){ const v=aimAt(e.x,e.y+8,near,e.t==='t'?150:e.t==='n'?115:125); bombs.push({x:e.x,y:e.y+8,...v}); e.cd=e.t==='t'?1.5+rnd(.6):e.t==='n'?2.2+rnd(1):1.9+rnd(1.3); }
        alive.forEach(p=>{ if(Math.abs(p.x-e.x)<11&&Math.abs((p.y+(p.prone?20:13))-(e.y+13))<(p.prone?10:22)) kill(p); }); });
      for(const s of shots){ if(s.life<=0) continue;
        const f=flyers.find(f=>Math.abs(f.x-s.x)<14&&Math.abs(f.y-s.y)<10); if(f){ f.hp=0; s.life=0; items.push({x:f.x,y:f.y,vy:-120,wp:f.wp}); boom(f.x,f.y,10,WC[f.wp]); score+=100; continue; }
        const e=en.find(e=>Math.abs(e.x-s.x)<(e.t==='t'?12:10)&&Math.abs(e.y+(e.t==='t'?9:13)-s.y)<(e.t==='t'?10:16)); if(e){ e.hp-=s.dmg; if(s.w!=='L') s.life=0; if(e.hp<=0){ boom(e.x,e.y+10,e.t==='t'?16:9); score+={r:100,s:200,n:300,t:500}[e.t]; } else boom(s.x,s.y,2,'#fff'); continue; }
        if(boss.alive&&camX>CAMMAX-150){ const part=boss.parts.find(q=>q.hp>0&&Math.abs(boss.x+q.ox-s.x)<q.r&&Math.abs(boss.y+q.oy-s.y)<q.r); if(part){ s.life=0; if(part.k==='core'&&boss.parts.some(q=>q.k==='c'&&q.hp>0)){ boom(s.x,s.y,2,'#aaa'); } else { part.hp-=s.dmg; boom(s.x,s.y,3); if(part.hp<=0){ boom(boss.x+part.ox,boss.y+part.oy,22); score+=part.k==='core'?5000:800; if(part.k==='core'){ boss.alive=false; state='win'; Death.play(w,{kind:'boom',x:boss.x-camX,y:boss.y+44,col:'#ff4d4d'}); if(!rewarded){ rewarded=true; celebrate(); } } } } } } }
      en=en.filter(e=>e.hp>0&&e.x>camX-80);
      if(boss.alive&&camX>CAMMAX-150){ boss.cd-=dt; if(boss.cd<=0){ const near=alive.length?alive.reduce((a,b)=>Math.abs(b.x-boss.x)<Math.abs(a.x-boss.x)?b:a):null; const cann=boss.parts.filter(q=>q.k==='c'&&q.hp>0);
        if(near){ if(cann.length){ const c=cann[Math.floor(Math.random()*cann.length)]; bombs.push({x:boss.x+c.ox,y:boss.y+c.oy,...aimAt(boss.x+c.ox,boss.y+c.oy,near,150)}); boss.cd=.9; }
          else { const core=boss.parts[2], v=aimAt(boss.x,boss.y+core.oy,near,140), a=Math.atan2(v.vy,v.vx); [-.3,0,.3].forEach(d=>bombs.push({x:boss.x,y:boss.y+core.oy,vx:Math.cos(a+d)*150,vy:Math.sin(a+d)*150})); boss.cd=1.2; } } } }
      bombs.forEach(b=>{ b.x+=b.vx*dt; b.y+=b.vy*dt; }); bombs=bombs.filter(b=>b.x>camX-20&&b.x<camX+520&&b.y<300&&b.y>-20);
      alive.forEach(p=>bombs.forEach(b=>{ const top=p.prone?p.y+14:p.y+2; if(Math.abs(b.x-p.x)<8&&b.y>top&&b.y<p.y+26){ b.x=-999; kill(p); } }));
      fx.forEach(f=>{ f.x+=f.vx*dt; f.y+=f.vy*dt; f.vy+=420*dt; f.t-=dt; }); fx=fx.filter(f=>f.t>0);
    }
    // ---- draw
    const sx=-Math.round(camX), T=performance.now()/1000;
    const sk=g.createLinearGradient(0,0,0,GY); sk.addColorStop(0,'#27a3d8'); sk.addColorStop(.6,'#8fe0e8'); sk.addColorStop(1,'#d9f4c0'); g.fillStyle=sk; g.fillRect(0,0,480,270);
    g.fillStyle='#4f8f93'; for(let i=0;i<7;i++){ const x=((i*190-camX*.12)%1330+1330)%1330-120; g.beginPath(); g.moveTo(x,GY-30); g.lineTo(x+95,GY-120-(i%3)*20); g.lineTo(x+190,GY-30); g.fill(); }
    g.fillStyle='#2d7a3f'; for(let i=0;i<16;i++){ const x=((i*96-camX*.3)%1536+1536)%1536-80, h=60+(i%4)*14; g.fillRect(x+7,GY-h,5,h); [[-22,-6],[14,-8],[-4,-16]].forEach(([dx,dy],j)=>{ g.beginPath(); g.ellipse(x+10+dx,GY-h+dy,22,7,j?.4:-.4,0,7); g.fill(); }); }
    g.fillStyle='#1b5a2c'; for(let i=0;i<12;i++){ const x=((i*130-camX*.6)%1560+1560)%1560-70, h=70+(i%3)*18; g.fillRect(x+9,GY-h,8,h); g.beginPath(); g.arc(x+13,GY-h,30,0,7); g.fill(); }
    g.fillStyle='#6d4a2a'; g.fillRect(0,GY,480,40); g.fillStyle='#8a6038'; for(let i=0;i<10;i++){ const x=((i*56-camX)%560+560)%560-40; g.fillRect(x,GY+14,30,6); g.fillRect(x+18,GY+28,26,6); } g.fillStyle='#3d9a35'; g.fillRect(0,GY,480,7); g.fillStyle='#57c14a'; g.fillRect(0,GY,480,3);
    PITS.forEach(([a,b])=>{ g.fillStyle='#0b1f2c'; g.fillRect(a+sx,GY,b-a,40); g.fillStyle='#2b6f96'; for(let x=a+sx;x<b+sx;x+=8) g.fillRect(x,GY+8+Math.sin(T*3+x)*1.5,5,3); });
    PLAT.forEach(([x,y,wd])=>{ g.fillStyle='#7a5430'; g.fillRect(x+sx,y,wd,7); g.fillStyle='#4a3018'; for(let i=0;i<wd;i+=10) g.fillRect(x+sx+i,y+7,2,5); g.fillStyle='#3d9a35'; g.fillRect(x+sx,y,wd,3); g.fillStyle='#57c14a'; g.fillRect(x+sx,y,wd,1); });
    items.forEach(it=>{ const x=it.x+sx; g.fillStyle='#222'; g.fillRect(x-8,it.y-8,16,16); g.fillStyle=WC[it.wp]; g.fillRect(x-6,it.y-6,12,12); g.fillStyle='#000'; g.font='bold 10px "Courier New"'; g.textAlign='center'; g.fillText(it.wp,x,it.y+4); g.textAlign='left'; });
    flyers.forEach(f=>{ const x=f.x+sx; g.fillStyle='#c0c0c0'; g.beginPath(); g.ellipse(x,f.y,15,8,0,0,7); g.fill(); g.fillStyle='#e63946'; g.fillRect(x-4,f.y-4,8,8); g.fillStyle='#fff'; g.fillRect(x-14,f.y-1,4,2); g.fillRect(x+10,f.y-1,4,2); });
    const man=(x,y,col,face,ax,ay,run,prone,air,fl,dead)=>{ // pixel soldier
      if(air){ g.save(); g.translate(x,y+13); g.rotate(T*14*face); g.fillStyle='#e8e8f0'; g.beginPath(); g.arc(0,0,8,0,7); g.fill(); g.fillStyle=col; g.beginPath(); g.arc(0,0,8,0,Math.PI); g.fill(); g.fillStyle='#222'; g.fillRect(-1,-8,2,16); g.restore(); return; }
      if(prone){ g.fillStyle=col; g.fillRect(x-12,y+18,24,8); g.fillStyle='#f1c27d'; g.fillRect(x+face*8-4,y+14,9,8); g.fillStyle='#d33'; g.fillRect(x+face*8-4,y+13,9,3); g.fillStyle='#222'; g.fillRect(face>0?x+10:x-24,y+20,14,3); return; }
      const sw=Math.floor(run)%2;
      g.fillStyle='#2b3a8f'; g.fillRect(x-5,y+14,4,12-(sw?2:0)); g.fillRect(x+1,y+14,4,12-(sw?0:2)); g.fillStyle='#111'; g.fillRect(x-6,y+24-(sw?2:0),6,3); g.fillRect(x+1,y+24-(sw?0:2),6,3);
      g.fillStyle='#f1c27d'; g.fillRect(x-6,y+4,12,11); g.fillStyle=col; g.fillRect(x-6,y+13,12,3); g.fillStyle='#f1c27d'; g.fillRect(x-4,y-3,9,8); g.fillStyle='#d33'; g.fillRect(x-5,y-3,11,3); g.fillRect(face>0?x-8:x+5,y-2,3,2);
      const gx=x+ax*6, gy=y+9+ay*4, L=Math.hypot(ax,ay)||1; g.strokeStyle='#222'; g.lineWidth=3; g.beginPath(); g.moveTo(gx,gy); g.lineTo(gx+ax/L*12,gy+ay/L*12); g.stroke(); if(fl>0){ g.fillStyle='#fff27a'; g.fillRect(gx+ax/L*14-3,gy+ay/L*14-3,6,6); } };
    en.forEach(e=>{ const x=e.x+sx; if(x<-20||x>500) return;
      if(e.t==='t'){ g.fillStyle='#5a6a5a'; g.fillRect(x-10,e.y+8,20,10); g.fillStyle='#3f4f3f'; g.beginPath(); g.arc(x,e.y+9,9,Math.PI,0); g.fill(); const nr=alive0(); if(nr){ const v=aimAt(x-sx,e.y+8,nr,1); g.strokeStyle='#222'; g.lineWidth=4; g.beginPath(); g.moveTo(x,e.y+7); g.lineTo(x+v.vx*13,e.y+7+v.vy*13); g.stroke(); } }
      else { const d=(P.find(p=>p.alive)||{x:e.x}).x-e.x, f=d>=0?1:-1, sw=Math.floor(e.run||0)%2, col=e.t==='r'?'#8a8f99':e.t==='n'?'#7a4a2a':'#b9852e';
        g.fillStyle='#444'; g.fillRect(x-5,e.y+15,4,11-(sw?2:0)); g.fillRect(x+1,e.y+15,4,11-(sw?0:2)); g.fillStyle=col; g.fillRect(x-6,e.y+5,12,11); g.fillStyle='#f1c27d'; g.fillRect(x-4,e.y-2,9,8); g.fillStyle=e.t==='r'?'#5a6068':'#3a3a3a'; g.fillRect(x-5,e.y-3,11,4); g.fillStyle='#222'; g.fillRect(f>0?x+3:x-13,e.y+9,10,3); } });
    function alive0(){ return P.find(p=>p.alive); }
    if(boss.alive){ const bx=boss.x+sx, by=boss.y; g.fillStyle='#4a5560'; g.fillRect(bx-60,by-20,120,150); g.fillStyle='#38424b'; for(let i=0;i<6;i++) g.fillRect(bx-60,by-20+i*25,120,3); g.fillStyle='#5d6a76'; g.fillRect(bx-70,by-26,140,8); g.fillStyle='#222'; g.fillRect(bx-14,by+60,28,70);
      boss.parts.forEach(q=>{ if(q.hp<=0){ g.fillStyle='#111'; g.fillRect(bx+q.ox-q.r,by+q.oy-q.r,q.r*2,q.r*2); return; } if(q.k==='c'){ g.fillStyle='#2a2f35'; g.fillRect(bx+q.ox-q.r,by+q.oy-q.r,q.r*2,q.r*2); g.fillStyle='#777'; g.fillRect(bx+q.ox-q.r-14,by+q.oy-3,18,6); g.fillStyle='#e63946'; g.fillRect(bx+q.ox-3,by+q.oy-3,6,6); } else { const open=!boss.parts.some(z=>z.k==='c'&&z.hp>0); g.fillStyle=open?(Math.floor(T*6)%2?'#ff6b6b':'#e63946'):'#552'; g.beginPath(); g.arc(bx,by+q.oy,q.r,0,7); g.fill(); g.fillStyle='#fff'; g.fillRect(bx-3,by+q.oy-3,6,6); g.fillStyle='#600'; g.fillRect(bx-26,by-34,52,5); g.fillStyle='#f33'; g.fillRect(bx-26,by-34,52*Math.max(0,q.hp)/q.max,5); } }); }
    P.forEach(p=>{ if(!p.alive||(p.inv>0&&Math.floor(p.inv*12)%2)) return; man(p.x+sx,p.y,p.col,p.face,p.ax,p.ay,p.run,p.prone,!p.ground,p.flash); });
    shots.forEach(s=>{ const x=s.x+sx; if(s.w==='L'){ g.strokeStyle='#4dd2ff'; g.lineWidth=3; g.beginPath(); g.moveTo(x,s.y); g.lineTo(x-s.vx/640*16,s.y-s.vy/640*16); g.stroke(); g.strokeStyle='#fff'; g.lineWidth=1; g.stroke(); } else if(s.w==='S'){ g.fillStyle='#ff4d4d'; g.beginPath(); g.arc(x,s.y,3.2,0,7); g.fill(); g.fillStyle='#fff'; g.fillRect(x-1,s.y-1,2,2); } else { g.fillStyle=s.w==='M'?'#ffd23f':'#fff'; g.fillRect(x-2,s.y-2,4,4); } });
    g.fillStyle='#ff9bd0'; bombs.forEach(b=>{ g.beginPath(); g.arc(b.x+sx,b.y,3,0,7); g.fill(); g.fillStyle='#fff'; g.fillRect(b.x+sx-1,b.y-1,2,2); g.fillStyle='#ff9bd0'; });
    fx.forEach(f=>{ g.globalAlpha=Math.min(1,f.t*3); g.fillStyle=f.col; g.fillRect(f.x+sx-1.5,f.y-1.5,3,3); g.globalAlpha=1; });
    // HUD: medals for lives, weapon letter, score
    g.font='bold 10px "Courier New",monospace'; P.forEach((p,i)=>{ const hx=6+i*118; g.fillStyle='#000b'; g.fillRect(hx,4,112,22); g.fillStyle=p.col; g.fillText('P'+(p.i+1),hx+4,15); for(let l=0;l<Math.max(0,p.lives);l++){ g.beginPath(); g.arc(hx+30+l*11,11,4,0,7); g.fill(); } g.fillStyle=WC[p.wp]; g.fillRect(hx+82,7,16,14); g.fillStyle='#000'; g.fillText(p.wp,hx+86,18); });
    g.fillStyle='#000b'; g.fillRect(400,4,76,16); g.fillStyle='#fff'; g.textAlign='right'; g.fillText(String(score).padStart(7,'0'),470,15); g.textAlign='left';
    if(state!=='play'){ g.fillStyle='rgba(0,0,0,.6)'; g.fillRect(0,90,480,90); g.textAlign='center'; g.fillStyle=state==='win'?'#8f8':'#f66'; g.font='bold 30px Arial'; g.fillText(state==='win'?'MISSION COMPLETE!':'GAME OVER',240,135); g.fillStyle='#fff'; g.font='15px Arial'; g.fillText(`Score ${score}   ·   Press Enter to play again`,240,160); g.textAlign='left'; }
  });
  return ()=>{ stop(); K.off(); };
}

ARCADE.push(
  {id:'commando',f:'JUNGLE.EXE',n:'Jungle Commando (2-Player Co-op)',e:'💥',wh:[640,480],m:mountCommando},
  {id:'breakout',f:'BRICKS.EXE',n:'Brick Breaker',e:'🧱',wh:[520,440],m:mountBreakout},
  {id:'invaders',f:'ALIENS.EXE',n:'Alien Invaders',e:'👾',wh:[520,480],m:mountInvaders});
