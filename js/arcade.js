// ===== Pre-installed 90s-style hits: original lookalikes, written from scratch =====
function keyset(w){
  const k=new Set();
  const dn=e=>{ if(active!==w||e.target.tagName==='INPUT') return; if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase())) e.preventDefault(); k.add(e.key.toLowerCase()); };
  const up=e=>k.delete(e.key.toLowerCase()), bl=()=>k.clear();
  document.addEventListener('keydown',dn); document.addEventListener('keyup',up); addEventListener('blur',bl);
  return {k,off:()=>{ document.removeEventListener('keydown',dn); document.removeEventListener('keyup',up); removeEventListener('blur',bl); }};
}
function touchPad(w,K,btns){
  const bar=mk('div','',btns.map(([k,t])=>`<button data-k="${k}" style="min-width:60px;min-height:44px;font-size:16px">${t}</button>`).join(''));
  bar.style.cssText='display:flex;gap:8px;justify-content:center;padding:6px;flex-wrap:wrap;touch-action:none'; w.body.appendChild(bar);
  const held=new Set(); const rel=()=>{ held.forEach(k=>K.k.delete(k)); held.clear(); };
  bar.onpointerdown=e=>{ const b=e.target.closest('button[data-k]'); if(!b) return; e.preventDefault(); K.k.add(b.dataset.k); held.add(b.dataset.k); };
  bar.onpointerup=bar.onpointercancel=bar.onpointerleave=rel; bar.oncontextmenu=e=>e.preventDefault();
}
function loop(w,fn){
  let raf,last=performance.now(),on=true;
  const f=t=>{ if(!on) return; const dt=Math.min(.05,(t-last)/1000); last=t; fn(dt); if(typeof Retro!=='undefined') Retro.post(w); raf=requestAnimationFrame(f); };
  raf=requestAnimationFrame(f); return ()=>{ on=false; cancelAnimationFrame(raf); };
}

/* ================= TURBO RUSH: split-screen racer ================= */
const SEG=[[0,260],[1.4,160],[0,120],[-1.8,160],[0,200],[2.2,110],[-1.2,140],[0,160],[1,160],[-2,130],[0,160]];
const TL=SEG.reduce((a,s)=>a+s[1],0);
const curveAt=p=>{ p=((p%TL)+TL)%TL; for(const [c,l] of SEG){ if(p<l) return c; p-=l; } return 0; };
function mountTurbo(w){
  w.body.innerHTML=`<div class="arcbar"><span>P1: W A S D</span><span id="md"><button data-m="2" class="on" style="min-width:0">2 Players</button> <button data-m="1" style="min-width:0">1 Player vs CPU</button></span><span>P2: ← → ↑ ↓</span></div><canvas class="arc" width="640" height="480"></canvas>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w); if(coarse){ touchPad(w,K,[['a','◀'],['d','▶'],['w','⛽ Gas'],['s','🛑 Brake']]); $('#md button[data-m="1"]',w.body).click(); }
  let mode=2, cars, state, count, winner, rewarded, el=0, run=null;
  const MAXS=110;
  const reset=()=>{ cars=[{pos:0,x:-.35,speed:0,head:0,sv:0,col:'#e63946',n:'P1'},{pos:0,x:.35,speed:0,head:0,sv:0,col:'#1d6fe0',n:mode===2?'P2':'CPU'}]; state='count'; count=3.2; winner=null; rewarded=false; el=0; run=Run.begin('turbo'); };
  reset();
  $('#md',w.body).onclick=e=>{ const m=e.target.dataset.m; if(!m) return; mode=+m; $$('#md button',w.body).forEach(b=>b.classList.toggle('on',b.dataset.m===m)); reset(); };
  const inp=(i)=>{ const k=K.k;
    if(i===0) return mode===1?{up:k.has('w')||k.has('arrowup'),down:k.has('s')||k.has('arrowdown'),left:k.has('a')||k.has('arrowleft'),right:k.has('d')||k.has('arrowright')}:{up:k.has('w'),down:k.has('s'),left:k.has('a'),right:k.has('d')};
    if(mode===2) return {up:k.has('arrowup'),down:k.has('arrowdown'),left:k.has('arrowleft'),right:k.has('arrowright')};
    const c=cars[1], tgt=-curveAt(c.pos+22)*.22+Math.sin(c.pos*.01)*.15; return {up:c.speed<MAXS*.86,down:false,left:c.x>tgt+.06,right:c.x<tgt-.06}; };
  const step=(c,I,dt)=>{
    if(I.up) c.speed+=62*dt; else c.speed-=28*dt; if(I.down) c.speed-=120*dt;
    const lim=Math.abs(c.x)>1.05?MAXS*.4:MAXS; if(c.speed>lim) c.speed-=90*dt; c.speed=Math.max(0,c.speed);
    const sp=c.speed/MAXS, st=(I.right?1:0)-(I.left?1:0);
    c.x+=st*dt*1.8*(.2+.8*sp); c.x-=curveAt(c.pos+10)*dt*.6*sp; c.x=Math.max(-1.6,Math.min(1.6,c.x));
    c.pos+=c.speed*dt; c.sv=st; c.head+=curveAt(c.pos)*c.speed*dt*.0004;
  };
  const car=(x,y,wd,col)=>{ const h=wd*.5; g.fillStyle='#111'; g.fillRect(x-wd*.55,y-h*.45,wd*.2,h*.45); g.fillRect(x+wd*.35,y-h*.45,wd*.2,h*.45);
    g.fillStyle=col; g.fillRect(x-wd/2,y-h,wd,h*.75); g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(x-wd*.34,y-h*1.28,wd*.68,h*.4); g.fillStyle=col; g.fillRect(x-wd*.38,y-h*1.3,wd*.76,h*.14);
    g.fillStyle='#ff3030'; g.fillRect(x-wd*.46,y-h*.8,wd*.16,h*.18); g.fillRect(x+wd*.3,y-h*.8,wd*.16,h*.18); };
  const view=(ox,oy,W,H,me,ot)=>{
    g.save(); g.beginPath(); g.rect(ox,oy,W,H); g.clip();
    const hor=oy+H*.42, lines=Math.floor(oy+H-hor);
    const sky=g.createLinearGradient(0,oy,0,hor); sky.addColorStop(0,'#3a7bd5'); sky.addColorStop(1,'#cfeaff'); g.fillStyle=sky; g.fillRect(ox,oy,W,hor-oy+1);
    g.fillStyle='#fff3a0'; g.beginPath(); g.arc(ox+W*.78,hor-H*.15,H*.05,0,7); g.fill();
    g.fillStyle='#2d6a4f'; g.beginPath(); g.moveTo(ox,hor); const off=me.head*500;
    for(let xx=0;xx<=W;xx+=8) g.lineTo(ox+xx,hor-H*.05-H*.04*Math.sin((xx+off)*.018)-H*.025*Math.sin((xx+off)*.05)); g.lineTo(ox+W,hor); g.fill();
    const xs=new Array(lines); let x=0,dx=0;
    for(let i=lines-1;i>=0;i--){ const t=(i+1)/lines, d=Math.min(400,24*(1/t-1)); dx+=curveAt(me.pos+d)*.02*(W/640); x+=dx; xs[i]=x; }
    for(let i=0;i<lines;i++){
      const t=(i+1)/lines, d=Math.min(2000,24*(1/t-1)), y=hor+i, rh=W*(.03+.42*t), cx=ox+W/2+xs[i]-me.x*rh, band=Math.floor((me.pos+d)/10)%2;
      g.fillStyle=band?'#2f9e3f':'#37b04a'; g.fillRect(ox,y,W,1);
      g.fillStyle=band?'#e63946':'#fff'; g.fillRect(cx-rh*1.14,y,rh*2.28,1);
      g.fillStyle=band?'#6b6b6b':'#747474'; g.fillRect(cx-rh,y,rh*2,1);
      if(band){ g.fillStyle='#fff'; g.fillRect(cx-Math.max(1,rh*.02),y,Math.max(2,rh*.04),1); }
    }
    const dz=ot.pos-me.pos;
    if(dz>-3&&dz<260){ const t=Math.min(1.2,1/(1+Math.max(0,dz)/24)), i=Math.max(0,Math.min(lines-1,Math.floor(t*lines)-1)), rh=W*(.03+.42*t), sx=ox+W/2+xs[i]+(ot.x-me.x)*rh, wd=Math.max(4,rh*.5); car(sx,hor+t*lines,wd,ot.col); }
    car(ox+W/2+me.sv*5,oy+H-6+(Math.abs(me.x)>1.05?Math.sin(performance.now()*.05)*2:0),W*.2,me.col);
    g.fillStyle='#000a'; g.fillRect(ox+4,oy+4,150,48);
    g.font='bold 15px Arial'; g.fillStyle='#fff'; g.fillText(`${me.n}  ${Math.round(me.speed*2.2)} km/h`,ox+10,oy+22);
    const lap=Math.min(3,Math.floor(me.pos/TL)+1); g.fillText(`LAP ${lap}/3   ${me.pos>=ot.pos?'1ST':'2ND'}`,ox+10,oy+42);
    g.restore();
  };
  const stop=loop(w,dt=>{
    if(state==='count'){ count-=dt; if(count<=0) state='race'; }
    if(state==='race'){
      el+=dt; cars.forEach((c,i)=>step(c,inp(i),dt));
      const [a,b]=cars; if(Math.abs(a.pos-b.pos)<5&&Math.abs(a.x-b.x)<.3){ const r=a.pos<b.pos?a:b, f=r===a?b:a; r.speed*=.93; f.speed=Math.min(MAXS,f.speed*1.01); const s=a.x<b.x?-1:1; a.x+=s*dt*.8; b.x-=s*dt*.8; }
      const win=cars.find(c=>c.pos>=TL*3); if(win){ state='done'; winner=win; if(!rewarded){ rewarded=true; if(mode===1&&win===cars[0]) postScore('turbo',Math.round(el*1000),{reward:true,run}); else if(mode===2) celebrate(); } }
    } else if(state==='done'){ cars.forEach(c=>{ c.speed=Math.max(0,c.speed-40*dt); c.pos+=c.speed*dt; }); if(K.k.has('enter')||K.k.has(' ')) reset(); }
    g.fillStyle='#000'; g.fillRect(0,0,640,480);
    if(mode===2){ view(0,0,640,238,cars[0],cars[1]); view(0,242,640,238,cars[1],cars[0]); }
    else view(0,0,640,480,cars[0],cars[1]);
    g.textAlign='center'; g.font='bold 64px Arial'; g.lineWidth=6; g.strokeStyle='#000'; g.fillStyle='#ffd400';
    const msg=state==='count'?(count>.2?String(Math.ceil(count-.2)):'GO!'):state==='done'?`${winner.n} WINS!`:'';
    if(state==='count'||state==='done'){ g.strokeText(msg,320,mode===2?250:260); g.fillText(msg,320,mode===2?250:260); }
    if(state==='done'){ g.font='bold 20px Arial'; g.fillStyle='#fff'; g.fillText('Press Enter to race again',320,mode===2?285:300); }
    g.textAlign='left';
  });
  return ()=>{ stop(); K.off(); };
}

/* ================= MAZE HUNTER 3D: raycaster shooter ================= */
const MZ=['################','#P.......#....E#','#.#####.##.###.#','#.#...#....#...#','#.#.E.#.####.###','#.#...#.#......#','#.##.##.#.####.#','#....#..#....#.#','####.#.#####.#.#','#E...#.......#.#','#.#########.##.#','#.#.......#....#','#.#.#####.#.##.#','#...#...E.#.#E.#','#.###.###.#.#..#','################'];
function mountMaze(w){
  w.body.innerHTML=`<div class="arcbar"><span>W/S move · A/D turn · Q/E strafe · Space or click: fire</span><span id="hint">Eliminate every guard</span></div><canvas class="arc" width="320" height="200" style="image-rendering:pixelated;cursor:crosshair"></canvas>
  <div style="display:flex;gap:6px;justify-content:center;padding:4px;flex-wrap:wrap" id="tp">${[['a','◀'],['w','▲'],['s','▼'],['d','▶'],[' ','🔫']].map(([k,t])=>`<button data-k="${k}" style="min-width:48px">${t}</button>`).join('')}</div>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w), W=320, VH=160, zb=new Array(W);
  const spr=document.createElement('canvas'); spr.width=32; spr.height=48; { const s=spr.getContext('2d'); s.fillStyle='#2b3a55'; s.fillRect(10,2,12,7); s.fillStyle='#e0b080'; s.fillRect(11,9,10,8); s.fillStyle='#000'; s.fillRect(13,12,2,2); s.fillRect(18,12,2,2); s.fillStyle='#7a5a2e'; s.fillRect(7,17,18,16); s.fillStyle='#e0b080'; s.fillRect(4,18,4,12); s.fillRect(24,18,4,12); s.fillStyle='#222'; s.fillRect(26,22,6,3); s.fillStyle='#3a3a50'; s.fillRect(9,33,6,13); s.fillRect(17,33,6,13); s.fillStyle='#111'; s.fillRect(8,46,8,2); s.fillRect(16,46,8,2); }
  let p,en,hp,ammo,state,fireT,flash,hurtT,dirA,rewarded,tt=0,run=null;
  const cell=(x,y)=>MZ[Math.floor(y)]?.[Math.floor(x)]??'#';
  const free=(x,y)=>cell(x,y)!=='#';
  const reset=()=>{ en=[]; MZ.forEach((r,y)=>[...r].forEach((c,x)=>{ if(c==='P') p={x:x+.5,y:y+.5}; if(c==='E') en.push({x:x+.5,y:y+.5,hp:50,alive:true,cd:1+Math.random(),alert:false}); })); dirA=0; hp=100; ammo=40; tt=0; run=Run.begin('maze3d'); state='play'; fireT=0; flash=0; hurtT=0; rewarded=false; };
  reset();
  const los=(a,b)=>{ const d=Math.hypot(b.x-a.x,b.y-a.y), n=Math.ceil(d/.1); for(let i=1;i<n;i++){ if(!free(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n)) return false; } return true; };
  const tp=$('#tp',w.body); tp.onpointerdown=e=>{ const k=e.target.dataset.k; if(k) K.k.add(k); }; tp.onpointerup=tp.onpointerleave=tp.onpointercancel=()=>{ ['a','w','s','d',' '].forEach(k=>{ if(tp.querySelector(`[data-k="${k}"]:active`)===null) K.k.delete(k); }); };
  cv.onpointerdown=()=>{ if(state!=='play') reset(); else fire(); };
  function fire(){
    if(state!=='play'||fireT>0||ammo<=0) return; ammo--; fireT=.28; flash=.08;
    const dx=Math.cos(dirA), dy=Math.sin(dirA); let best=null,bd=zb[W>>1];
    en.forEach(e=>{ if(!e.alive) return; const sx=e.x-p.x, sy=e.y-p.y, fwd=sx*dx+sy*dy, side=Math.abs(-sx*dy+sy*dx); if(fwd>0&&side<.38&&fwd<bd){ best=e; bd=fwd; } });
    if(best){ best.hp-=25; best.alert=true; if(best.hp<=0){ best.alive=false; ammo+=8; } }
  }
  const stop=loop(w,dt=>{
    const k=K.k; if(active!==w) k.clear();
    if(state==='play'){
      tt+=dt; const ts=2.4*dt, ms=3*dt; if(k.has('a')||k.has('arrowleft')) dirA-=ts; if(k.has('d')||k.has('arrowright')) dirA+=ts;
      let mx=0,my=0; const dx=Math.cos(dirA), dy=Math.sin(dirA);
      if(k.has('w')||k.has('arrowup')){ mx+=dx; my+=dy; } if(k.has('s')||k.has('arrowdown')){ mx-=dx; my-=dy; } if(k.has('e')){ mx-=dy; my+=dx; } if(k.has('q')){ mx+=dy; my-=dx; }
      const nx=p.x+mx*ms, ny=p.y+my*ms; if(free(nx+Math.sign(mx)*.2,p.y)) p.x=nx; if(free(p.x,ny+Math.sign(my)*.2)) p.y=ny;
      if(k.has(' ')) fire();
      fireT-=dt; flash-=dt; hurtT-=dt;
      en.forEach(e=>{ if(!e.alive) return; const d=Math.hypot(p.x-e.x,p.y-e.y), see=d<9&&los(e,p); if(see) e.alert=true; e.cd-=dt;
        if(e.alert&&d>1){ const sx=(p.x-e.x)/d*1.1*dt, sy=(p.y-e.y)/d*1.1*dt; if(free(e.x+sx*3,e.y)) e.x+=sx; if(free(e.x,e.y+sy*3)) e.y+=sy; }
        if(see&&d<7&&e.cd<=0){ e.cd=.9+Math.random()*.7; if(Math.random()<.5){ hp-=5+rnd(7); hurtT=.25; } } });
      if(hp<=0){ hp=0; state='dead'; }
      else if(en.every(e=>!e.alive)){ state='win'; if(!rewarded){ rewarded=true; postScore('maze3d',Math.max(15,Math.round(tt)),{reward:true,run}); } }
    } else if(k.has('r')) reset();
    // render
    g.fillStyle='#383838'; g.fillRect(0,0,W,VH/2); g.fillStyle='#707070'; g.fillRect(0,VH/2,W,VH/2);
    const dx=Math.cos(dirA), dy=Math.sin(dirA), px=-dy*.66, py=dx*.66;
    for(let x=0;x<W;x++){
      const cam=2*x/W-1, rx=dx+px*cam, ry=dy+py*cam; let mx=Math.floor(p.x), my=Math.floor(p.y);
      const ddx=Math.abs(1/rx), ddy=Math.abs(1/ry); let sx,sy,sdx,sdy;
      if(rx<0){ sx=-1; sdx=(p.x-mx)*ddx; } else { sx=1; sdx=(mx+1-p.x)*ddx; } if(ry<0){ sy=-1; sdy=(p.y-my)*ddy; } else { sy=1; sdy=(my+1-p.y)*ddy; }
      let side=0,guard=0; while(guard++<40){ if(sdx<sdy){ sdx+=ddx; mx+=sx; side=0; } else { sdy+=ddy; my+=sy; side=1; } if(MZ[my]?.[mx]==='#'||MZ[my]?.[mx]===undefined) break; }
      const pd=Math.max(.05,side===0?sdx-ddx:sdy-ddy); zb[x]=pd;
      const wx=(side===0?p.y+pd*ry:p.x+pd*rx)%1, lh=Math.min(VH*3,Math.floor(VH/pd)), v=(mx*7+my*13)%3;
      const base=v===0?[107,123,181]:v===1?[168,80,60]:[91,138,91], sh=(side?.7:1)/(1+pd*.1)*((wx*4)%1<.06?.78:1);
      g.fillStyle=`rgb(${base[0]*sh|0},${base[1]*sh|0},${base[2]*sh|0})`; g.fillRect(x,(VH-lh)/2,1,lh);
    }
    const inv=1/(px*dy-dx*py);
    [...en].sort((a,b)=>Math.hypot(b.x-p.x,b.y-p.y)-Math.hypot(a.x-p.x,a.y-p.y)).forEach(e=>{
      const sx=e.x-p.x, sy=e.y-p.y, tx=inv*(dy*sx-dx*sy), ty=inv*(-py*sx+px*sy); if(ty<=.15) return;
      const scr=Math.floor(W/2*(1+tx/ty)), sh=Math.abs(Math.floor(VH/ty)), sw=sh*.66, top=(VH-sh)/2+(e.alive?0:sh*.7), hh=e.alive?sh:sh*.3;
      for(let s=Math.max(0,Math.floor(scr-sw/2));s<Math.min(W,scr+sw/2);s++){ if(ty>=zb[s]) continue; g.drawImage(spr,Math.floor((s-(scr-sw/2))*32/sw),0,1,48,s,top,1,hh); }
    });
    if(hurtT>0){ g.fillStyle=`rgba(200,0,0,${hurtT*1.4})`; g.fillRect(0,0,W,VH); }
    g.fillStyle='#555'; g.beginPath(); g.moveTo(150,VH); g.lineTo(158,VH-30); g.lineTo(166,VH-30); g.lineTo(174,VH); g.fill(); g.fillStyle='#222'; g.fillRect(155,VH-34-(fireT>0?3:0),14,6);
    if(flash>0){ g.fillStyle='#ffd400'; g.beginPath(); g.arc(162,VH-38,9,0,7); g.fill(); }
    g.fillStyle='#fff'; g.fillRect(W/2-1,VH/2-5,2,10); g.fillRect(W/2-5,VH/2-1,10,2);
    g.fillStyle='#0000a8'; g.fillRect(0,VH,W,40); g.fillStyle='#fff'; g.font='bold 11px monospace';
    g.fillText('HEALTH '+hp+'%',8,VH+16); g.fillText('AMMO '+ammo,8,VH+32); g.fillText('GUARDS '+en.filter(e=>!e.alive).length+'/'+en.length,W-95,VH+16);
    g.font='26px serif'; g.fillText(hp>75?'😀':hp>40?'😐':hp>0?'😖':'💀',W/2-14,VH+30);
    if(state!=='play'){ g.fillStyle='rgba(0,0,0,.55)'; g.fillRect(0,50,W,60); g.fillStyle=state==='win'?'#8f8':'#f66'; g.font='bold 22px monospace'; g.textAlign='center'; g.fillText(state==='win'?'FLOOR CLEAR!':'YOU DIED',W/2,85); g.font='11px monospace'; g.fillStyle='#fff'; g.fillText('Press R or click to restart',W/2,102); g.textAlign='left'; }
  });
  return ()=>{ stop(); K.off(); };
}

/* ================= BLOCKCRAFT CLASSIC: voxel sandbox (three.js) ================= */
function loadThree(){ return window.THREE?Promise.resolve():new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'; s.onload=res; s.onerror=()=>rej(new Error('offline')); document.head.appendChild(s); }); }
function mountBlock(w){
  w.body.innerHTML=`<div class="bc" style="position:relative;height:100%;min-height:200px;background:#7ec0ee;overflow:hidden"><div class="bcm" style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;color:#fff;font:700 15px Arial;text-shadow:1px 1px #000;z-index:3;padding:20px;pointer-events:none">Loading 3D engine...</div></div>`;
  let dead=false, cleanup=()=>{};
  if(coarse){ $('.bcm',w.body).innerHTML='Blockcraft Classic needs a keyboard and mouse.<br><small style="font-weight:400">Open this page on a computer to play.</small>'; return ()=>{}; }
  loadThree().then(()=>{ if(!dead) cleanup=startBlock(w); }).catch(()=>{ $('.bcm',w.body).textContent='Blockcraft needs an internet connection to load its 3D engine (three.js).'; });
  return ()=>{ dead=true; cleanup(); };
}
function startBlock(w){
  const T=THREE, N=24, host=$('.bc',w.body), msg=$('.bcm',host);
  msg.innerHTML='Click to play<br><small style="font-weight:400">WASD move · Space jump · Mouse look<br>Left click: break · Right click: place · 1-6: pick block</small>';
  const rr=(a,b)=>a+Math.random()*(b-a);
  function tex(base,fn){ const c=document.createElement('canvas'); c.width=c.height=16; const x=c.getContext('2d'); for(let i=0;i<16;i++)for(let j=0;j<16;j++){ const v=rr(-18,18), b=base.map(q=>Math.max(0,Math.min(255,q+v))); x.fillStyle=`rgb(${b[0]},${b[1]},${b[2]})`; x.fillRect(i,j,1,1); } if(fn) fn(x); const t=new T.CanvasTexture(c); t.magFilter=T.NearestFilter; t.minFilter=T.NearestFilter; t.userData={url:c.toDataURL()}; return t; }
  const grassTop=tex([96,160,64]), dirt=tex([134,96,67]), stone=tex([125,125,125]), planks=tex([170,130,80],x=>{ x.fillStyle='#0004'; for(let j=3;j<16;j+=4) x.fillRect(0,j,16,1); }),
    grassSide=tex([134,96,67],x=>{ x.fillStyle='#60a040'; x.fillRect(0,0,16,4); }), leaf=tex([60,130,50]), logSide=tex([100,75,45],x=>{ x.fillStyle='#0003'; for(let i=2;i<16;i+=4) x.fillRect(i,0,1,16); }), logTop=tex([160,125,80],x=>{ x.strokeStyle='#0004'; x.strokeRect(3.5,3.5,9,9); });
  const mat=t=>new T.MeshLambertMaterial({map:t}), M={};
  M[1]=[mat(grassSide),mat(grassSide),mat(grassTop),mat(dirt),mat(grassSide),mat(grassSide)]; M[2]=Array(6).fill(mat(dirt)); M[3]=Array(6).fill(mat(stone)); M[4]=[mat(logSide),mat(logSide),mat(logTop),mat(logTop),mat(logSide),mat(logSide)]; M[5]=Array(6).fill(mat(planks)); M[6]=Array(6).fill(mat(leaf));
  const HOT=[1,2,3,5,4,6], ICON={1:grassTop,2:dirt,3:stone,4:logSide,5:planks,6:leaf};
  const renderer=new T.WebGLRenderer({antialias:false}); host.appendChild(renderer.domElement); renderer.domElement.style.cssText='width:100%;height:100%;display:block';
  const scene=new T.Scene(); scene.background=new T.Color(0x87ceeb); scene.fog=new T.Fog(0x87ceeb,18,48);
  scene.add(new T.AmbientLight(0xffffff,.62)); const sun=new T.DirectionalLight(0xffffff,.55); sun.position.set(.4,1,.7); scene.add(sun);
  const cam=new T.PerspectiveCamera(70,1,.1,100); cam.rotation.order='YXZ';
  const geo=new T.BoxGeometry(1,1,1), blocks=new Map(), meshes=new Map(), key=(x,y,z)=>x+','+y+','+z;
  const solid=(x,y,z)=>y<0||x<0||z<0||x>=N||z>=N||blocks.has(key(x,y,z));
  const exposed=(x,y,z)=>!(solid(x+1,y,z)&&solid(x-1,y,z)&&solid(x,y+1,z)&&solid(x,y-1,z)&&solid(x,y,z+1)&&solid(x,y,z-1));
  function refresh(x,y,z){ const k=key(x,y,z), t=blocks.get(k), m=meshes.get(k), need=t&&exposed(x,y,z);
    if(need&&!m){ const me=new T.Mesh(geo,M[t]); me.position.set(x+.5,y+.5,z+.5); scene.add(me); meshes.set(k,me); } else if(!need&&m){ scene.remove(m); meshes.delete(k); } }
  const around=(x,y,z)=>{ [[0,0,0],[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].forEach(d=>refresh(x+d[0],y+d[1],z+d[2])); };
  const H=(x,z)=>Math.max(1,Math.round(3+2*Math.sin(x*.35)+1.6*Math.cos(z*.28)));
  for(let x=0;x<N;x++)for(let z=0;z<N;z++){ const h=H(x,z); for(let y=0;y<=h;y++) blocks.set(key(x,y,z),y===h?1:y>=h-2?2:3); }
  for(let i=0;i<7;i++){ const tx=3+rnd(N-6), tz=3+rnd(N-6), h=H(tx,tz); for(let y=1;y<=4;y++) blocks.set(key(tx,h+y,tz),4); for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)for(let dy=3;dy<=5;dy++){ if(Math.abs(dx)+Math.abs(dz)+(dy>4?1:0)<4&&!blocks.has(key(tx+dx,h+dy,tz+dz))) blocks.set(key(tx+dx,h+dy,tz+dz),6); } }
  for(const k of blocks.keys()){ const [x,y,z]=k.split(',').map(Number); refresh(x,y,z); }
  const hl=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1.01,1.01,1.01)),new T.LineBasicMaterial({color:0x000000})); hl.visible=false; scene.add(hl);
  const hot=mk('div','',''); hot.style.cssText='position:absolute;left:50%;bottom:8px;transform:translateX(-50%);display:flex;gap:4px;z-index:2;pointer-events:none';
  hot.innerHTML=HOT.map((t,i)=>`<div style="width:36px;height:36px;border:3px solid #555;background:url(${ICON[t].userData.url}) center/cover;image-rendering:pixelated" data-i="${i}"></div>`).join('');
  const cross=mk('div','','+'); cross.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:#fff;font:700 22px Arial;text-shadow:0 0 2px #000;z-index:2;pointer-events:none'; host.append(hot,cross);
  let sel=0; const selHot=()=>$$('[data-i]',hot).forEach((d,i)=>d.style.borderColor=i===sel?'#fff':'#555'); selHot();
  const P={x:N/2+.5,y:H(N/2,N/2)+3,z:N/2+.5,vx:0,vy:0,vz:0,yaw:0,pitch:0,ground:false}, K=keyset(w); let placed=0, rewarded=false;
  const hit=(x,y,z)=>{ for(let a=Math.floor(x-.3);a<=Math.floor(x+.3);a++)for(let b=Math.floor(y);b<=Math.floor(y+1.7);b++)for(let c=Math.floor(z-.3);c<=Math.floor(z+.3);c++) if(solid(a,b,c)) return true; return false; };
  let target=null;
  function ray(){
    const d=new T.Vector3(); cam.getWorldDirection(d); let pv=null;
    for(let t=0;t<6;t+=.04){ const x=Math.floor(cam.position.x+d.x*t), y=Math.floor(cam.position.y+d.y*t), z=Math.floor(cam.position.z+d.z*t);
      if(blocks.has(key(x,y,z))){ return {hit:[x,y,z],prev:pv}; } pv=[x,y,z]; }
    return null;
  }
  const canvas=renderer.domElement, locked=()=>document.pointerLockElement===canvas;
  canvas.onclick=()=>{ if(!locked()) canvas.requestPointerLock&&canvas.requestPointerLock(); };
  const onLock=()=>{ msg.style.display=locked()?'none':'grid'; }; document.addEventListener('pointerlockchange',onLock);
  const onMove=e=>{ if(!locked()) return; P.yaw-=e.movementX*.0025; P.pitch=Math.max(-1.5,Math.min(1.5,P.pitch-e.movementY*.0025)); }; document.addEventListener('mousemove',onMove);
  canvas.oncontextmenu=e=>e.preventDefault();
  canvas.onmousedown=e=>{
    if(!locked()||!target) return;
    if(e.button===0){ const [x,y,z]=target.hit; if(y>0){ blocks.delete(key(x,y,z)); around(x,y,z); } }
    else if(e.button===2&&target.prev){ const [x,y,z]=target.prev; if(x>=0&&z>=0&&x<N&&z<N&&y>=0&&y<40){ blocks.set(key(x,y,z),HOT[sel]); if(hit(P.x,P.y,P.z)){ blocks.delete(key(x,y,z)); } else { around(x,y,z); if(++placed>=15&&!rewarded){ rewarded=true; celebrate(); } } } }
  };
  const onKey=e=>{ if(active!==w) return; const n=+e.key; if(n>=1&&n<=6){ sel=n-1; selHot(); } }; document.addEventListener('keydown',onKey);
  const size=()=>{ const r=host.getBoundingClientRect(); if(!r.width) return; renderer.setSize(r.width,r.height,false); cam.aspect=r.width/r.height; cam.updateProjectionMatrix(); };
  const ro=new ResizeObserver(size); ro.observe(host); size();
  const stop=loop(w,dt=>{
    const k=K.k; if(active!==w) k.clear();
    const f=(k.has('w')?1:0)-(k.has('s')?1:0), s=(k.has('d')?1:0)-(k.has('a')?1:0), sp=4.3;
    P.vx=(-Math.sin(P.yaw)*f+Math.cos(P.yaw)*s)*sp; P.vz=(-Math.cos(P.yaw)*f-Math.sin(P.yaw)*s)*sp; P.vy-=24*dt; if(k.has(' ')&&P.ground){ P.vy=8.2; P.ground=false; }
    let nx=P.x+P.vx*dt; if(!hit(nx,P.y,P.z)) P.x=nx; let nz=P.z+P.vz*dt; if(!hit(P.x,P.y,nz)) P.z=nz;
    const ny=P.y+P.vy*dt; if(!hit(P.x,ny,P.z)){ P.y=ny; P.ground=false; } else { if(P.vy<0) P.ground=true; P.vy=0; }
    if(P.y<-10){ P.x=N/2+.5; P.y=H(N/2,N/2)+3; P.z=N/2+.5; }
    cam.position.set(P.x,P.y+1.6,P.z); cam.rotation.set(P.pitch,P.yaw,0);
    target=ray(); hl.visible=!!target; if(target) hl.position.set(target.hit[0]+.5,target.hit[1]+.5,target.hit[2]+.5);
    renderer.render(scene,cam);
  });
  return ()=>{ stop(); K.off(); document.removeEventListener('pointerlockchange',onLock); document.removeEventListener('mousemove',onMove); document.removeEventListener('keydown',onKey); if(locked()) document.exitPointerLock(); ro.disconnect(); renderer.dispose(); };
}

/* ================= BLOCK DROP: falling blocks ================= */
function mountDrop(w){
  const {daily,mk}=takeDaily('drop'); let rng=mk(), run=null;
  w.body.innerHTML=`<div class="arcbar"><span>← → move · ↑ rotate · ↓ soft drop · Space drop</span><span>Enter: restart</span></div><canvas class="arc" width="360" height="480" style="max-height:calc(100% - 70px);width:auto;margin:0 auto"></canvas><div style="display:flex;gap:6px;justify-content:center;padding:4px;flex-wrap:wrap" id="tp">${[['arrowleft','◀'],['arrowup','⟳'],['arrowdown','▼'],['arrowright','▶'],[' ','⏬']].map(([k,t])=>`<button data-k="${k}" style="min-width:48px">${t}</button>`).join('')}</div>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w);
  const SH=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]], COL=['#00c8d8','#e8d000','#a040d0','#2060e0','#f08000','#30c030','#e03030'];
  const CS=24; let b,cur,nxt,score,lines,over,acc,rewarded,held={};
  const piece=()=>{ const i=Math.floor(rng()*7); return {m:SH[i].map(r=>[...r]),c:i+1,x:3,y:0}; };
  const rot=m=>m[0].map((_,i)=>m.map(r=>r[i]).reverse());
  const ok=(m,x,y)=>m.every((r,j)=>r.every((v,i)=>!v||(x+i>=0&&x+i<10&&y+j<20&&(y+j<0||!b[y+j][x+i]))));
  const reset=()=>{ rng=mk(); run=Run.begin('drop'); b=Array.from({length:20},()=>Array(10).fill(0)); cur=piece(); nxt=piece(); score=0; lines=0; over=false; acc=0; rewarded=false; };
  reset();
  const lock=()=>{ cur.m.forEach((r,j)=>r.forEach((v,i)=>{ if(v&&cur.y+j>=0) b[cur.y+j][cur.x+i]=cur.c; })); let n=0; for(let j=19;j>=0;j--) if(b[j].every(Boolean)){ b.splice(j,1); b.unshift(Array(10).fill(0)); n++; j++; } lines+=n; score+=[0,100,300,500,800][n]; cur=nxt; nxt=piece(); if(!ok(cur.m,cur.x,cur.y)){ over=true; postScore('drop',score,{daily,reward:score>=500,run}); } };
  const act=k=>{ if(over){ if(k==='enter') reset(); return; }
    if(k==='arrowleft'&&ok(cur.m,cur.x-1,cur.y)) cur.x--; else if(k==='arrowright'&&ok(cur.m,cur.x+1,cur.y)) cur.x++;
    else if(k==='arrowup'){ const r=rot(cur.m); for(const dx of [0,-1,1,-2,2]) if(ok(r,cur.x+dx,cur.y)){ cur.m=r; cur.x+=dx; break; } }
    else if(k==='arrowdown'){ if(ok(cur.m,cur.x,cur.y+1)) cur.y++; else lock(); }
    else if(k===' '){ while(ok(cur.m,cur.x,cur.y+1)) cur.y++; lock(); } };
  const tp=$('#tp',w.body); tp.onpointerdown=e=>{ const k=e.target.dataset.k; if(k) act(k); };
  const stop=loop(w,dt=>{
    const k=K.k; if(active!==w) k.clear();
    ['arrowleft','arrowright','arrowup',' ','enter'].forEach(x=>{ if(k.has(x)&&!held[x]){ held[x]=1; act(x); } else if(!k.has(x)) held[x]=0; });
    acc+=dt*(k.has('arrowdown')?12:1); const iv=Math.max(.08,.8-Math.floor(lines/10)*.07);
    if(!over&&acc>=iv){ acc=0; if(ok(cur.m,cur.x,cur.y+1)) cur.y++; else lock(); }
    g.fillStyle='#000'; g.fillRect(0,0,360,480); g.fillStyle='#111'; g.fillRect(0,0,240,480);
    b.forEach((r,j)=>r.forEach((v,i)=>{ if(v){ g.fillStyle=COL[v-1]; g.fillRect(i*CS+1,j*CS+1,CS-2,CS-2); g.fillStyle='rgba(255,255,255,.3)'; g.fillRect(i*CS+1,j*CS+1,CS-2,3); } }));
    if(!over) cur.m.forEach((r,j)=>r.forEach((v,i)=>{ if(v){ g.fillStyle=COL[cur.c-1]; g.fillRect((cur.x+i)*CS+1,(cur.y+j)*CS+1,CS-2,CS-2); } }));
    g.fillStyle='#fff'; g.font='bold 16px Arial'; g.fillText('SCORE',256,34); g.fillText(String(score),256,56); g.fillText('LINES',256,96); g.fillText(String(lines),256,118); g.fillText('NEXT',256,160);
    nxt.m.forEach((r,j)=>r.forEach((v,i)=>{ if(v){ g.fillStyle=COL[nxt.c-1]; g.fillRect(256+i*18,176+j*18,16,16); } }));
    if(over){ g.fillStyle='rgba(0,0,0,.65)'; g.fillRect(0,190,240,90); g.fillStyle='#f66'; g.font='bold 26px Arial'; g.textAlign='center'; g.fillText('GAME OVER',120,230); g.font='14px Arial'; g.fillStyle='#fff'; g.fillText('Press Enter',120,256); g.textAlign='left'; }
  });
  return ()=>{ stop(); K.off(); };
}

/* ================= PADDLE WARS: pong ================= */
function mountPong(w){
  w.body.innerHTML=`<div class="arcbar"><span>P1: W / S</span><span id="md"><button data-m="1" class="on" style="min-width:0">vs CPU</button> <button data-m="2" style="min-width:0">2 Players</button></span><span>P2: ↑ / ↓</span></div><canvas class="arc" width="480" height="300"></canvas><div class="center" style="padding:4px;font-size:12px">Space / click to serve · first to 7 wins</div>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w); let mode=1, a,b,ball,sc,serve,over,rewarded;
  const reset=()=>{ a=130; b=130; sc=[0,0]; over=false; rewarded=false; center(1); };
  const center=d=>{ ball={x:240,y:150,vx:0,vy:0}; serve=d; };
  reset();
  $('#md',w.body).onclick=e=>{ const m=e.target.dataset.m; if(!m) return; mode=+m; $$('#md button',w.body).forEach(x=>x.classList.toggle('on',x.dataset.m===m)); reset(); };
  const go=()=>{ if(over){ reset(); return; } if(!ball.vx){ ball.vx=serve*230; ball.vy=(Math.random()*2-1)*140; } };
  cv.onpointerdown=go; cv.style.touchAction='none';
  cv.onpointermove=e=>{ if(e.pointerType==='touch'||e.buttons){ const r=cv.getBoundingClientRect(); a=Math.max(0,Math.min(220,(e.clientY-r.top)*300/r.height-40)); } };
  const stop=loop(w,dt=>{
    const k=K.k; if(active!==w) k.clear(); if(k.has(' ')) go();
    const up1=k.has('w')||(mode===1&&k.has('arrowup')), dn1=k.has('s')||(mode===1&&k.has('arrowdown'));
    a+=((dn1?1:0)-(up1?1:0))*260*dt;
    if(mode===2) b+=((k.has('arrowdown')?1:0)-(k.has('arrowup')?1:0))*260*dt; else if(ball.vx>0) b+=Math.max(-170*dt,Math.min(170*dt,ball.y-40-b));
    a=Math.max(0,Math.min(220,a)); b=Math.max(0,Math.min(220,b));
    ball.x+=ball.vx*dt; ball.y+=ball.vy*dt;
    if(ball.y<6){ ball.y=6; ball.vy=Math.abs(ball.vy); } if(ball.y>294){ ball.y=294; ball.vy=-Math.abs(ball.vy); }
    if(ball.vx<0&&ball.x<30&&ball.x>18&&ball.y>a&&ball.y<a+80){ ball.vx=Math.abs(ball.vx)*1.07; ball.vy+=(ball.y-a-40)*4; }
    if(ball.vx>0&&ball.x>450&&ball.x<462&&ball.y>b&&ball.y<b+80){ ball.vx=-Math.abs(ball.vx)*1.07; ball.vy+=(ball.y-b-40)*4; }
    if(ball.x<0){ sc[1]++; center(1); } if(ball.x>480){ sc[0]++; center(-1); }
    if(!over&&(sc[0]>=7||sc[1]>=7)){ over=true; ball.vx=0; if(!rewarded&&(mode===2||sc[0]>=7)){ rewarded=true; celebrate(); } }
    g.fillStyle='#000'; g.fillRect(0,0,480,300); g.fillStyle='#444'; for(let y=0;y<300;y+=20) g.fillRect(238,y,4,10);
    g.fillStyle='#fff'; g.fillRect(18,a,10,80); g.fillRect(452,b,10,80); g.fillRect(ball.x-5,ball.y-5,10,10);
    g.font='48px "VT323",monospace'; g.textAlign='center'; g.fillText(sc[0],200,50); g.fillText(sc[1],280,50);
    if(over){ g.font='28px "VT323",monospace'; g.fillText(sc[0]>=7?(mode===1?'YOU WIN!':'PLAYER 1 WINS!'):(mode===1?'CPU WINS':'PLAYER 2 WINS!'),240,140); g.font='18px "VT323",monospace'; g.fillText('click to play again',240,170); }
    g.textAlign='left';
  });
  return ()=>{ stop(); K.off(); };
}

const ARCADE=[
  {id:'turbo',f:'TURBO.EXE',n:'Turbo Rush (Split-Screen)',e:'🏎️',wh:[660,640],m:mountTurbo},
  {id:'maze3d',f:'MAZE3D.EXE',n:'Maze Hunter 3D',e:'🔫',wh:[660,590],m:mountMaze},
  {id:'blockcraft',f:'BLOCKS.EXE',n:'Blockcraft Classic',e:'⛏️',wh:[720,520],m:mountBlock},
  {id:'drop',f:'DROP.EXE',n:'Block Drop',e:'🟦',wh:[420,640],m:mountDrop},
  {id:'pong',f:'PONG.EXE',n:'Paddle Wars',e:'🏓',wh:[520,420],m:mountPong}];
