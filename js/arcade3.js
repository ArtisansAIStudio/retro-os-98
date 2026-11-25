// ===== More original arcade classics: maze chase, road-and-river crossing, asteroid blaster =====

/* ================= DOT CHOMPER (maze chase) ================= */
const MAZE=['###################','#........#........#','#.##.###.#.###.##.#','#o...............o#','#.##.#.#####.#.##.#','#....#...#...#....#','####.#### ####.####','#....#...#...#....#','#.##.#.#####.#.##.#','#o...............o#','#.##.###.#.###.##.#','#........#........#','###################'];
function mountChomper(w){
  w.body.innerHTML=`<div class="arcbar"><span>Arrow keys or WASD · eat every dot · power pellets turn the tables</span><span id="st"></span></div><canvas class="arc" width="456" height="312"></canvas>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w), T=24, st=$('#st',w.body), st2=st;
  const DIRS={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]}, OPP={u:'d',d:'u',l:'r',r:'l'};
  let grid,dots,pl,gh,lives,score,state,fright,rewarded,want;
  const free=(x,y)=>MAZE[y]&&MAZE[y][x]!==undefined&&grid[y][x]!=='#';
  const reset=()=>{ grid=MAZE.map(r=>[...r]); dots=0; grid.forEach(r=>r.forEach(c=>{ if(c==='.'||c==='o') dots++; })); lives=3; score=0; state='play'; fright=0; rewarded=false; spawn(); };
  const spawn=()=>{ pl={x:9,y:9,dir:'l',px:9,py:9,prog:0,moving:false}; want='l';
    gh=[{x:9,y:3,dir:'l',col:'#ff4d4d',k:0},{x:1,y:1,dir:'r',col:'#ff9fd2',k:1},{x:17,y:11,dir:'l',col:'#4dd2ff',k:2}].map(e=>({...e,px:e.x,py:e.y,prog:0,home:[e.x,e.y],eaten:0})); };
  reset(); w.ch={get pl(){return pl;},get gh(){return gh;},get fright(){return fright;},set fright(v){fright=v;}};
  const step=(e,spd,dt,choose)=>{ // tile-to-tile movement
    if(!e.moving){ const d=choose(e); if(d&&free(e.x+DIRS[d][0],e.y+DIRS[d][1])){ e.dir=d; e.moving=true; e.prog=0; e.nx=e.x+DIRS[d][0]; e.ny=e.y+DIRS[d][1]; } else return; }
    e.prog+=spd*dt; if(e.prog>=1){ e.x=e.nx; e.y=e.ny; e.prog=0; e.moving=false; e.px=e.x; e.py=e.y; const d=choose(e); if(d&&free(e.x+DIRS[d][0],e.y+DIRS[d][1])){ e.dir=d; e.moving=true; e.nx=e.x+DIRS[d][0]; e.ny=e.y+DIRS[d][1]; } }
    if(e.moving){ e.px=e.x+(e.nx-e.x)*e.prog; e.py=e.y+(e.ny-e.y)*e.prog; } };
  const stop=loop(w,dt=>{
    const k=K.k; if(active!==w) k.clear();
    if(k.has('arrowup')||k.has('w')) want='u'; else if(k.has('arrowdown')||k.has('s')) want='d'; else if(k.has('arrowleft')||k.has('a')) want='l'; else if(k.has('arrowright')||k.has('d')) want='r';
    if(state!=='play'){ if(k.has('enter')||k.has(' ')) reset(); }
    else {
      fright=Math.max(0,fright-dt);
      step(pl,4.6,dt,e=>free(e.x+DIRS[want][0],e.y+DIRS[want][1])?want:(free(e.x+DIRS[e.dir][0],e.y+DIRS[e.dir][1])?e.dir:null));
      if(!pl.moving||pl.prog===0){ const c=grid[pl.y][pl.x]; if(c==='.'){ grid[pl.y][pl.x]=' '; dots--; score+=10; } else if(c==='o'){ grid[pl.y][pl.x]=' '; dots--; score+=50; fright=6.5; } }
      gh.forEach(e=>{ if(e.eaten>0){ e.eaten-=dt; return; }
        step(e,fright>0?2.6:3.9,dt,q=>{ const opts=Object.keys(DIRS).filter(d=>free(q.x+DIRS[d][0],q.y+DIRS[d][1])&&(d!==OPP[q.dir]||Object.keys(DIRS).filter(z=>free(q.x+DIRS[z][0],q.y+DIRS[z][1])).length===1)); if(!opts.length) return null;
          if(fright>0){ if(Math.random()<.12) return pick(opts); const far=d=>Math.hypot(q.x+DIRS[d][0]-pl.x,q.y+DIRS[d][1]-pl.y); return opts.sort((m,n)=>far(n)-far(m))[0]; }   // scared: run away from the player
          if(q.k===2&&Math.random()<.45) return pick(opts);
          const tx=pl.x+(q.k===1?DIRS[pl.dir][0]*3:0), ty=pl.y+(q.k===1?DIRS[pl.dir][1]*3:0);
          return opts.sort((a,b)=>Math.hypot(q.x+DIRS[a][0]-tx,q.y+DIRS[a][1]-ty)-Math.hypot(q.x+DIRS[b][0]-tx,q.y+DIRS[b][1]-ty))[0]; });
        if(Math.hypot(e.px-pl.px,e.py-pl.py)<.6){ if(fright>0){ score+=200; e.eaten=3; e.x=e.px=e.home[0]; e.y=e.py=e.home[1]; e.moving=false; } else { lives--; if(lives<=0) state='over'; else spawn(); } } });
      if(dots<=0){ state='win'; if(!rewarded){ rewarded=true; celebrate(); } }
    }
    g.fillStyle='#000'; g.fillRect(0,0,456,312);
    grid.forEach((r,y)=>r.forEach((c,x)=>{ if(c==='#'){ g.fillStyle='#1b2ad8'; g.fillRect(x*T+1,y*T+1,T-2,T-2); g.fillStyle='#000'; g.fillRect(x*T+5,y*T+5,T-10,T-10); } else if(c==='.'){ g.fillStyle='#ffd7a8'; g.fillRect(x*T+10,y*T+10,4,4); } else if(c==='o'){ g.fillStyle='#fff'; g.beginPath(); g.arc(x*T+12,y*T+12,Math.floor(performance.now()/250)%2?7:5,0,7); g.fill(); } }));
    const mouth=.25+.25*Math.abs(Math.sin(performance.now()/90)), ang={r:0,d:Math.PI/2,l:Math.PI,u:-Math.PI/2}[pl.dir];
    g.fillStyle='#ffe000'; g.beginPath(); g.moveTo(pl.px*T+12,pl.py*T+12); g.arc(pl.px*T+12,pl.py*T+12,10,ang+mouth,ang-mouth+Math.PI*2); g.fill();
    gh.forEach(e=>{ if(e.eaten>0) return; const x=e.px*T+12, y=e.py*T+12; g.fillStyle=fright>0?(fright<2&&Math.floor(performance.now()/150)%2?'#fff':'#2a2adf'):e.col; g.beginPath(); g.arc(x,y-1,10,Math.PI,0); g.lineTo(x+10,y+10); g.lineTo(x+5,y+6); g.lineTo(x,y+10); g.lineTo(x-5,y+6); g.lineTo(x-10,y+10); g.fill(); g.fillStyle='#fff'; g.fillRect(x-6,y-5,5,6); g.fillRect(x+1,y-5,5,6); g.fillStyle='#00f'; g.fillRect(x-4,y-3,3,3); g.fillRect(x+3,y-3,3,3); });
    st.textContent=`Score ${score}   Lives ${'♥'.repeat(Math.max(0,lives))}`;
    if(state!=='play'){ g.fillStyle='rgba(0,0,0,.65)'; g.fillRect(0,110,456,90); g.textAlign='center'; g.fillStyle=state==='win'?'#8f8':'#f66'; g.font='bold 28px Arial'; g.fillText(state==='win'?'BOARD CLEARED!':'GAME OVER',228,152); g.fillStyle='#fff'; g.font='15px Arial'; g.fillText('Press Enter to play again',228,178); g.textAlign='left'; }
  });
  return ()=>{ stop(); K.off(); };
}

/* ================= ROAD HOPPER (crossing game) ================= */
function mountHopper(w){
  w.body.innerHTML=`<div class="arcbar"><span>Arrow keys or WASD · cross the road, ride the logs</span><span id="st"></span></div><canvas class="arc" width="480" height="360"></canvas>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w), st=$('#st',w.body), C=40;
  // rows (0 = goal ... 8 = start). roads: 5,6,7  rivers: 1,2,3  safe: 4,8
  const LANES={7:{v:70,n:3,w:56,t:'car'},6:{v:-95,n:3,w:56,t:'car'},5:{v:60,n:2,w:96,t:'truck'},3:{v:-55,n:3,w:96,t:'log'},2:{v:75,n:3,w:128,t:'log'},1:{v:-45,n:3,w:96,t:'log'}};
  let f,objs,lives,goals,state,rewarded,held,msg;
  const reset=()=>{ lives=3; goals=[0,0,0,0,0]; state='play'; rewarded=false; held={}; msg=''; spawn(); objs=[]; Object.entries(LANES).forEach(([r,L])=>{ const gap=480/L.n; for(let i=0;i<L.n;i++) objs.push({r:+r,x:i*gap+Math.random()*30,L}); }); };
  const spawn=()=>{ f={x:220,y:8*C,r:8}; };
  reset();
  const die=why=>{ lives--; msg=why; if(lives<=0) state='over'; else spawn(); };
  const hop=(dx,dy)=>{ if(state!=='play') return; f.x=Math.max(0,Math.min(440,f.x+dx*C)); f.r=Math.max(0,Math.min(8,f.r+dy)); f.y=f.r*C; if(f.r===0){ const slot=Math.round(f.x/96); const sx=slot*96+20; if(slot>=0&&slot<5&&!goals[slot]&&Math.abs(f.x-sx)<44){ goals[slot]=1; score_(); spawn(); if(goals.every(Boolean)){ state='win'; if(!rewarded){ rewarded=true; celebrate(); } } } else die('Splash! Missed the lily pad.'); } };
  const score_=()=>{ msg='Made it!'; };
  const stop=loop(w,dt=>{
    const k=K.k; if(active!==w) k.clear();
    [['arrowup','w',0,-1],['arrowdown','s',0,1],['arrowleft','a',-1,0],['arrowright','d',1,0]].forEach(([a,b,dx,dy])=>{ const on=k.has(a)||k.has(b), id=a; if(on&&!held[id]){ held[id]=1; hop(dx,dy); } else if(!on) held[id]=0; });
    if((k.has('enter')||k.has(' '))&&state!=='play') reset();
    if(state==='play'){
      objs.forEach(o=>{ o.x+=o.L.v*dt; if(o.L.v>0&&o.x>480) o.x=-o.L.w; if(o.L.v<0&&o.x<-o.L.w) o.x=480; });
      const lane=LANES[f.r];
      if(lane){ const here=objs.filter(o=>o.r===f.r&&f.x+30>o.x&&f.x+10<o.x+o.L.w);
        if(lane.t==='log'){ const log=here[0]; if(!log) die('Glub glub. You drowned.'); else { f.x+=lane.v*dt; if(f.x<-10||f.x>450) die('Swept away!'); } }
        else if(here.length) die('Splat! Watch the traffic.'); }
    }
    g.fillStyle='#1d6fe0'; g.fillRect(0,C,480,3*C); g.fillStyle='#444'; g.fillRect(0,5*C,480,3*C); g.fillStyle='#2f9e3f'; g.fillRect(0,0,480,C); g.fillRect(0,4*C,480,C); g.fillRect(0,8*C,480,C);
    for(let i=0;i<5;i++){ g.fillStyle=goals[i]?'#7cff7c':'#0b3d8a'; g.fillRect(i*96+20,4,56,C-8); }
    g.fillStyle='#fff6'; for(let r=5;r<8;r++) for(let x=0;x<480;x+=60) g.fillRect(x,r*C+C-2,30,2);
    objs.forEach(o=>{ const y=o.r*C; if(o.L.t==='log'){ g.fillStyle='#8a5a2a'; g.fillRect(o.x,y+6,o.L.w,C-12); g.fillStyle='#6b4420'; for(let x=o.x+10;x<o.x+o.L.w;x+=24) g.fillRect(x,y+10,3,C-20); }
      else { g.fillStyle=o.L.t==='truck'?'#e0e0e0':(o.r===7?'#e63946':'#f5c400'); g.fillRect(o.x,y+8,o.L.w,C-16); g.fillStyle='#222'; g.fillRect(o.x+(o.L.v>0?o.L.w-14:4),y+11,10,C-22); } });
    if(state!=='over'){ g.fillStyle='#4dff4d'; g.fillRect(f.x+8,f.y+8,24,24); g.fillStyle='#fff'; g.fillRect(f.x+11,f.y+10,6,6); g.fillRect(f.x+23,f.y+10,6,6); g.fillStyle='#000'; g.fillRect(f.x+13,f.y+12,3,3); g.fillRect(f.x+25,f.y+12,3,3); }
    st.textContent=`${msg}   Pads ${goals.filter(Boolean).length}/5   Lives ${'♥'.repeat(Math.max(0,lives))}`;
    if(state!=='play'){ g.fillStyle='rgba(0,0,0,.65)'; g.fillRect(0,130,480,90); g.textAlign='center'; g.fillStyle=state==='win'?'#8f8':'#f66'; g.font='bold 28px Arial'; g.fillText(state==='win'?'ALL HOME!':'GAME OVER',240,172); g.fillStyle='#fff'; g.font='15px Arial'; g.fillText('Press Enter to play again',240,198); g.textAlign='left'; }
  });
  return ()=>{ stop(); K.off(); };
}

/* ================= ROCK BLASTER (asteroids-style) ================= */
function mountRocks(w){
  w.body.innerHTML=`<div class="arcbar"><span>← → rotate · ↑ thrust · Space fire</span><span id="st"></span></div><canvas class="arc" width="480" height="360"></canvas>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w), st=$('#st',w.body);
  let s,rocks,shots,lives,score,wave,state,cool,rewarded;
  const mkRock=(x,y,sz)=>({x,y,sz,vx:(Math.random()-.5)*60,vy:(Math.random()-.5)*60,a:0,va:(Math.random()-.5)*1.5,pts:Array.from({length:10},(_,i)=>{ const a=i/10*Math.PI*2; return [Math.cos(a),Math.sin(a),.75+Math.random()*.4]; })});
  const waveUp=()=>{ rocks=[]; for(let i=0;i<3+wave;i++){ const edge=Math.random()<.5; rocks.push(mkRock(edge?0:Math.random()*480,edge?Math.random()*360:0,3)); } };
  const respawn=()=>{ s={x:240,y:180,vx:0,vy:0,a:-Math.PI/2,inv:2.5}; };
  const reset=()=>{ lives=3; score=0; wave=1; state='play'; cool=0; rewarded=false; shots=[]; respawn(); waveUp(); };
  reset();
  const wrap=o=>{ o.x=(o.x+480)%480; o.y=(o.y+360)%360; };
  const stop=loop(w,dt=>{
    const k=K.k; if(active!==w) k.clear();
    if(state!=='play'){ if(k.has('enter')||k.has(' ')) reset(); }
    else {
      s.a+=((k.has('arrowright')||k.has('d')?1:0)-(k.has('arrowleft')||k.has('a')?1:0))*4*dt;
      if(k.has('arrowup')||k.has('w')){ s.vx+=Math.cos(s.a)*220*dt; s.vy+=Math.sin(s.a)*220*dt; } s.vx*=1-.4*dt; s.vy*=1-.4*dt; s.x+=s.vx*dt; s.y+=s.vy*dt; wrap(s); s.inv-=dt;
      cool-=dt; if(k.has(' ')&&cool<=0){ shots.push({x:s.x+Math.cos(s.a)*12,y:s.y+Math.sin(s.a)*12,vx:Math.cos(s.a)*340+s.vx,vy:Math.sin(s.a)*340+s.vy,life:1.1}); cool=.25; }
      shots.forEach(b=>{ b.x+=b.vx*dt; b.y+=b.vy*dt; b.life-=dt; wrap(b); }); shots=shots.filter(b=>b.life>0);
      rocks.forEach(r=>{ r.x+=r.vx*dt; r.y+=r.vy*dt; r.a+=r.va*dt; wrap(r); });
      for(const b of shots){ const i=rocks.findIndex(r=>Math.hypot(r.x-b.x,r.y-b.y)<r.sz*9); if(i>=0){ const r=rocks[i]; b.life=0; score+=[0,100,50,20][r.sz]; rocks.splice(i,1); if(r.sz>1) for(let n=0;n<2;n++){ const c=mkRock(r.x,r.y,r.sz-1); c.vx*=1.6; c.vy*=1.6; rocks.push(c); } } }
      if(s.inv<=0&&rocks.some(r=>Math.hypot(r.x-s.x,r.y-s.y)<r.sz*9+6)){ lives--; if(lives<=0) state='over'; else respawn(); }
      if(!rocks.length){ if(!rewarded){ rewarded=true; celebrate(); } wave++; waveUp(); }
    }
    g.fillStyle='#000'; g.fillRect(0,0,480,360); g.strokeStyle='#fff'; g.lineWidth=1.5;
    rocks.forEach(r=>{ g.beginPath(); r.pts.forEach(([c,sn,m],i)=>{ const x=r.x+(Math.cos(r.a)*c-Math.sin(r.a)*sn)*r.sz*9*m, y=r.y+(Math.sin(r.a)*c+Math.cos(r.a)*sn)*r.sz*9*m; i?g.lineTo(x,y):g.moveTo(x,y); }); g.closePath(); g.stroke(); });
    if(state==='play'&&(s.inv<=0||Math.floor(s.inv*8)%2)){ g.beginPath(); g.moveTo(s.x+Math.cos(s.a)*12,s.y+Math.sin(s.a)*12); g.lineTo(s.x+Math.cos(s.a+2.5)*10,s.y+Math.sin(s.a+2.5)*10); g.lineTo(s.x+Math.cos(s.a-2.5)*10,s.y+Math.sin(s.a-2.5)*10); g.closePath(); g.stroke();
      if((K.k.has('arrowup')||K.k.has('w'))&&Math.random()<.7){ g.beginPath(); g.moveTo(s.x+Math.cos(s.a+3)*7,s.y+Math.sin(s.a+3)*7); g.lineTo(s.x-Math.cos(s.a)*(10+Math.random()*7),s.y-Math.sin(s.a)*(10+Math.random()*7)); g.lineTo(s.x+Math.cos(s.a-3)*7,s.y+Math.sin(s.a-3)*7); g.stroke(); } }
    g.fillStyle='#fff'; shots.forEach(b=>g.fillRect(b.x-1.5,b.y-1.5,3,3));
    st.textContent=`Score ${score}   Wave ${wave}   Lives ${'♥'.repeat(Math.max(0,lives))}`;
    if(state!=='play'){ g.fillStyle='rgba(0,0,0,.7)'; g.fillRect(0,140,480,80); g.textAlign='center'; g.fillStyle='#f66'; g.font='bold 28px Arial'; g.fillText('GAME OVER',240,182); g.fillStyle='#fff'; g.font='15px Arial'; g.fillText('Press Enter to play again',240,206); g.textAlign='left'; }
  });
  return ()=>{ stop(); K.off(); };
}

ARCADE.push(
  {id:'chomper',f:'CHOMP.EXE',n:'Dot Chomper',e:'🟡',wh:[500,420],m:mountChomper},
  {id:'hopper',f:'HOPPER.EXE',n:'Road Hopper',e:'🐸',wh:[520,470],m:mountHopper},
  {id:'rocks',f:'ROCKS.EXE',n:'Rock Blaster',e:'☄️',wh:[520,470],m:mountRocks});
