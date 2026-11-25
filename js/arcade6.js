// ===== Highway Rush: an original top-down racer in the style of 80s arcade road games =====
function mountHighway(w){
  w.body.innerHTML=`<div class="arcbar"><span>← → steer · ↓ brake · Space / X turbo · grab the F cans</span><span id="st"></span></div><canvas class="arc" width="192" height="224" style="image-rendering:pixelated"></canvas>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w), st=$('#st',w.body), W=192, H=224, DIST=7000, RX=40, RW=112, LN=5, LW=RW/LN, PY=186, SC=.5;
  if(coarse) touchPad(w,K,[['a','◀'],['d','▶'],['s','🛑'],[' ','🔥 Turbo']]);
  g.imageSmoothingEnabled=false;
  const COLS=['#ffd23f','#3ec5ff','#7bd88f','#ff8a00','#b57bff','#ffffff'], lx=l=>RX+LW*(l+.5);
  let me, cars, cans, state, count, el, fuel, msg, msgT, doneT, best=parseFloat(store.get('hway-best')||'0')||0, newBest, why;
  const reset=()=>{
    me={pos:0,x:lx(2),v:0,spin:0}; cars=[]; cans=[];
    for(let p=320;p<DIST-150;p+=55+Math.random()*80){ const r=Math.random(); cars.push({pos:p,lane:Math.floor(Math.random()*LN),fl:0,v:62+Math.random()*50,col:COLS[Math.floor(Math.random()*COLS.length)],kind:r<.14?'truck':r<.3?'weaver':'car',ph:Math.random()*6}); }
    for(let p=520;p<DIST-200;p+=560+Math.random()*120) cans.push({pos:p,lane:Math.floor(Math.random()*LN),got:false});
    state='count'; count=3.4; el=0; fuel=100; msg=''; msgT=0; doneT=0; newBest=false; why=''; };
  reset(); w.hw={get me(){return me;},get state(){return state;},get fuel(){return fuel;},get el(){return el;},get cars(){return cars;},get cans(){return cans;}};
  const say=t=>{ msg=t; msgT=1.1; };
  const carPx=(x,y,col,kind,rot)=>{ g.save(); g.translate(Math.round(x),Math.round(y)); if(rot) g.rotate(rot);
    const L=kind==='truck'?13:8, wd=kind==='truck'?6:4.5;
    g.fillStyle='#111'; [[-wd-1,-L+2],[wd-1,-L+2],[-wd-1,L-6],[wd-1,L-6]].forEach(([a,b])=>g.fillRect(a,b,2,4));
    g.fillStyle=col; g.fillRect(-wd,-L,wd*2+1,L*2+1);
    if(kind==='truck'){ g.fillStyle='rgba(255,255,255,.35)'; g.fillRect(-wd+1,-L+9,wd*2-1,L*2-10); g.fillStyle='#9ad0ff'; g.fillRect(-wd+1,-L+2,wd*2-1,4); }
    else { g.fillStyle='#9ad0ff'; g.fillRect(-wd+1,-L+4,wd*2-1,4); g.fillStyle='rgba(0,0,0,.3)'; g.fillRect(-wd+1,L-5,wd*2-1,3); g.fillStyle='rgba(255,255,255,.4)'; g.fillRect(0,-L,1,L*2+1); }
    g.fillStyle='#fff7a0'; g.fillRect(-wd,-L,2,1); g.fillRect(wd-1,-L,2,1); g.restore(); };
  const stop=loop(w,dt=>{
    const k=K.k; if(active!==w) k.clear(); msgT-=dt;
    const lt=k.has('arrowleft')||k.has('a'), rt=k.has('arrowright')||k.has('d'), brk=k.has('arrowdown')||k.has('s'), turbo=k.has('x')||k.has('shift')||k.has(' ')||k.has('z');
    if(state==='count'){ count-=dt; if(count<=0) state='race'; }
    else if(state==='race'||state==='out'){
      const racing=state==='race'; if(racing) el+=dt;
      const off=me.x<RX+3||me.x>RX+RW-3;
      if(me.spin>0){ me.spin-=dt; me.v=Math.max(0,me.v-120*dt); }
      else {
        let target=racing?(brk?35:(turbo?245:150)):0; if(off) target=Math.min(target,70);
        me.v+=(target>me.v?110:-170)*dt; me.v=Math.max(0,me.v);
        if(racing){ me.x+=((rt?1:0)-(lt?1:0))*dt*(55+me.v*.3); me.x=Math.max(14,Math.min(W-14,me.x)); }
      }
      me.pos+=me.v*dt;
      if(racing){ fuel-=(turbo&&me.v>160?7.5:3.3)*dt; if(fuel<=0){ fuel=0; state='out'; why='OUT OF FUEL'; } }
      cars.forEach(c=>{ c.pos+=c.v*dt; if(c.kind==='weaver') c.fl=Math.sin(c.ph+el*1.3)*1.4; });
      const sy=p=>(p-me.pos)*SC;
      cars.forEach(c=>{ const cx=lx(Math.max(0,Math.min(LN-1,c.lane+c.fl))), dy=sy(c.pos), hl=c.kind==='truck'?14:9;
        if(racing&&me.spin<=0&&Math.abs(dy)<hl+8&&Math.abs(cx-me.x)<9){ me.spin=.9; me.v*=.3; fuel=Math.max(0,fuel-7); me.x+=me.x<cx?-7:7; c.pos+=30; say('CRASH!'); Death.play(w,{kind:'crash',x:me.x,y:PY}); } });
      cans.forEach(c=>{ if(!c.got&&racing&&Math.abs(sy(c.pos))<9&&Math.abs(lx(c.lane)-me.x)<10){ c.got=true; fuel=Math.min(100,fuel+30); say('FUEL +30'); } });
      if(racing&&me.pos>=DIST){ state='done'; if(!best||el<best){ best=el; store.set('hway-best',String(el)); newBest=true; } celebrate(); }
      if(state==='out'&&me.v<=0){ state='over'; }
    } else { doneT+=dt; if(doneT>.6&&(k.has('enter')||k.has(' '))) reset(); }
    // ---- draw
    const off0=me.pos*SC;
    g.fillStyle='#2f7d32'; g.fillRect(0,0,W,H);
    for(let y=-((off0)%48);y<H;y+=48){ g.fillStyle='#378a37'; g.fillRect(0,y,W,24); }
    const hash=n=>{ n=Math.imul(n^n>>>15,2246822519); n=Math.imul(n^n>>>13,3266489917); return (n^n>>>16)>>>0; };
    for(let y=-24;y<H+24;y+=24){ const idx=Math.floor((off0-y)/24), hv=hash(idx*7+1), yy=y+((off0)%24);
      [[0,16],[RX+RW+4,W-8]].forEach(([a,b],s)=>{ const tx=a+((hv>>>(s*5))%Math.max(1,b-a-8)); g.fillStyle='#1d5a24'; g.fillRect(tx,yy,8,8); g.fillStyle='#2a7a30'; g.fillRect(tx+1,yy+1,5,5); g.fillStyle='#5a3a1a'; g.fillRect(tx+3,yy+8,2,3); }); }
    g.fillStyle='#555'; g.fillRect(RX,0,RW,H);
    for(let y=-((off0)%16);y<H;y+=16){ const band=Math.floor((off0-y)/16)%2===0; g.fillStyle=band?'#e63946':'#fff'; g.fillRect(RX-3,y,3,8); g.fillRect(RX+RW,y,3,8); g.fillStyle='#e0e0e0'; for(let i=1;i<LN;i++) g.fillRect(RX+LW*i,y,1,8); }
    const fy=PY-(DIST-me.pos)*SC; if(fy>-10&&fy<H+10) for(let i=0;i<14;i++) for(let r=0;r<2;r++){ g.fillStyle=(i+r)%2?'#111':'#fff'; g.fillRect(RX+i*8,fy+r*4,8,4); }
    cans.forEach(c=>{ if(c.got) return; const y=PY-(c.pos-me.pos)*SC; if(y<-10||y>H+10) return; const x=lx(c.lane); g.fillStyle='#000'; g.fillRect(x-4,y-5,9,11); g.fillStyle='#ffd23f'; g.fillRect(x-3,y-4,7,9); g.fillStyle='#b00000'; g.fillRect(x-1,y-3,3,1); g.fillRect(x-1,y-3,1,6); g.fillRect(x-1,y-1,3,1); });
    [...cars].sort((a,b)=>b.pos-a.pos).forEach(c=>{ const y=PY-(c.pos-me.pos)*SC; if(y<-20||y>H+20) return; carPx(lx(Math.max(0,Math.min(LN-1,c.lane+c.fl))),y,c.col,c.kind); });
    const sh=(me.x<RX+3||me.x>RX+RW-3)&&me.v>40?Math.round(Math.sin(performance.now()*.06)*1):0;
    carPx(me.x+sh,PY,'#e63946','car',me.spin>0?Math.sin(performance.now()*.03)*.9:0);
    if(me.v>200){ g.fillStyle='#ff8a00'; g.fillRect(me.x-2,PY+10,2,3); g.fillRect(me.x+1,PY+10,2,3); }
    // HUD
    g.fillStyle='#000a'; g.fillRect(2,2,38,40); g.fillStyle='#fff'; g.font='bold 8px "Courier New",monospace'; g.fillText('TIME',5,11); g.fillText(el.toFixed(1),5,21); g.fillText(Math.round(me.v*1.1)+'km',5,31); g.fillText(best?'B '+best.toFixed(1):'',5,40);
    g.fillStyle='#000a'; g.fillRect(2,H-84,10,82); g.fillStyle='#333'; g.fillRect(4,H-80,6,74); g.fillStyle=fuel>30?'#4c4':'#f44'; g.fillRect(4,H-6-74*fuel/100,6,74*fuel/100); g.fillStyle='#fff'; g.fillText('F',4,H-76);
    g.fillStyle='#000a'; g.fillRect(W-12,2,10,H-4); g.fillStyle='#444'; g.fillRect(W-8,6,2,H-12); g.fillStyle='#e63946'; g.fillRect(W-10,H-12-(H-24)*Math.min(1,me.pos/DIST),6,5);
    st.textContent=`Fuel ${Math.round(fuel)}%`;
    g.textAlign='center';
    if(msgT>0){ g.font='bold 11px "Courier New",monospace'; g.fillStyle='#000'; g.fillText(msg,W/2+1,61); g.fillStyle='#ffd23f'; g.fillText(msg,W/2,60); }
    if(state==='count'){ for(let i=0;i<3;i++){ g.fillStyle=count>i+.4?'#e63946':'#400'; if(count<=.4) g.fillStyle='#4c4'; g.fillRect(W/2-14+i*11,40,8,8); } }
    if(state==='done'||state==='over'){ g.fillStyle='rgba(0,0,0,.7)'; g.fillRect(24,72,144,66); g.font='bold 13px "Courier New",monospace'; g.fillStyle=state==='done'?'#8f8':'#f66'; g.fillText(state==='done'?'YOU MADE IT!':why||'GAME OVER',W/2,92); g.fillStyle='#fff'; g.font='bold 9px "Courier New",monospace'; if(state==='done') g.fillText(`Time ${el.toFixed(2)}s${newBest?'  NEW BEST!':''}`,W/2,108); else g.fillText(`Reached ${Math.round(100*me.pos/DIST)}% of the road`,W/2,108); g.fillText('Space / Enter: drive again',W/2,124); }
    g.textAlign='left';
  });
  return ()=>{ stop(); K.off(); };
}
ARCADE.push({id:'highway',f:'HWAY.EXE',n:'Highway Rush (Top-Down Racer)',e:'🚗',wh:[500,680],m:mountHighway});
