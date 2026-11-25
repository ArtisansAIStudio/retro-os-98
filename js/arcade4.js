// ===== Bike Brawl: an original motorbike race-and-fight game (reuses the road engine from Turbo Rush) =====
function mountBrawl(w){
  w.body.innerHTML=`<div class="arcbar"><span>A D steer · W gas · S brake</span><span id="st"></span><span>J / K punch left / right</span></div><canvas class="arc" width="640" height="440"></canvas>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w), st=$('#st',w.body), W=640, H=440, MAXS=112, LAPS=2, L=TL*LAPS;
  const COLS=['#3ec5ff','#ffd23f','#7bd88f','#ff8a00','#b57bff'];
  let me, riders, traffic, state, count, score, rewarded, msg, msgT, punchT, punchSide, rank;
  const reset=()=>{
    me={pos:0,x:0,speed:0,hp:100,head:0,sv:0};
    riders=COLS.map((c,i)=>({pos:6+i*7,x:(i%3-1)*.5,speed:0,down:0,cd:1+Math.random()*2,cruise:86+Math.random()*20,col:c,lane:(i%3-1)*.5,fin:false}));
    traffic=Array.from({length:9},(_,i)=>({pos:260+i*320+Math.random()*80,x:(Math.random()*1.2-.6),speed:34,col:pick(['#e63946','#ffffff','#8d99ae','#2a9d8f'])}));
    state='count'; count=3.2; score=0; rewarded=false; msg=''; msgT=0; punchT=0; punchSide=0; rank=0; };
  reset(); w.bb={get me(){return me;},get riders(){return riders;},get state(){return state;},get score(){return score;},get rank(){return rank;},L};
  const say=t=>{ msg=t; msgT=1.1; };
  const bike=(x,y,sz,col,down,punch)=>{
    g.save(); g.translate(x,y); if(down){ g.rotate(.9*(x<W/2?-1:1)); g.globalAlpha=.85; }
    g.fillStyle='#111'; g.beginPath(); g.ellipse(0,0,sz*.2,sz*.34,0,0,7); g.fill();               // rear wheel
    g.fillStyle=col; g.fillRect(-sz*.17,-sz*.78,sz*.34,sz*.5);                                        // bike body
    g.fillStyle='#222'; g.fillRect(-sz*.26,-sz*.58,sz*.52,sz*.07);                                    // handlebars
    g.fillStyle=col; g.fillRect(-sz*.22,-sz*1.18,sz*.44,sz*.46);                                      // rider torso
    g.fillStyle='#f1c27d'; g.beginPath(); g.arc(0,-sz*1.32,sz*.17,0,7); g.fill();                     // head
    g.fillStyle='#222'; g.beginPath(); g.arc(0,-sz*1.36,sz*.19,Math.PI,0); g.fill();                  // helmet
    if(punch){ g.fillStyle='#f1c27d'; g.fillRect(punch*sz*.2,-sz*1.05,punch*sz*.55,sz*.12); g.fillRect(punch*sz*.72-(punch<0?sz*.12:0),-sz*1.08,sz*.12,sz*.18); }
    g.restore(); };
  const car=(x,y,sz,col)=>{ g.fillStyle='#111'; g.fillRect(x-sz*.55,y-sz*.2,sz*.2,sz*.2); g.fillRect(x+sz*.35,y-sz*.2,sz*.2,sz*.2); g.fillStyle=col; g.fillRect(x-sz/2,y-sz*.55,sz,sz*.4); g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(x-sz*.34,y-sz*.78,sz*.68,sz*.26); g.fillStyle='#ff3030'; g.fillRect(x-sz*.46,y-sz*.45,sz*.14,sz*.1); g.fillRect(x+sz*.32,y-sz*.45,sz*.14,sz*.1); };
  const stop=loop(w,dt=>{
    const k=K.k; if(active!==w) k.clear();
    const gas=k.has('w')||k.has('arrowup'), brk=k.has('s')||k.has('arrowdown'), L_=k.has('a')||k.has('arrowleft'), R_=k.has('d')||k.has('arrowright');
    if(state==='count'){ count-=dt; if(count<=0) state='race'; }
    else if(state==='race'||state==='done'){
      const racing=state==='race';
      if(racing){
        const off=Math.abs(me.x)>1.05; if(gas) me.speed+=62*dt; else me.speed-=26*dt; if(brk) me.speed-=125*dt;
        const lim=off?MAXS*.4:MAXS; if(me.speed>lim) me.speed-=95*dt; me.speed=Math.max(0,me.speed);
        const sp=me.speed/MAXS, st_=(R_?1:0)-(L_?1:0); me.x+=st_*dt*1.9*(.2+.8*sp); me.x-=curveAt(me.pos+10)*dt*.6*sp; me.x=Math.max(-1.5,Math.min(1.5,me.x)); me.sv=st_;
        me.pos+=me.speed*dt; me.head+=curveAt(me.pos)*me.speed*dt*.0004;
        punchT-=dt; if(punchT<=0){ const side=(k.has('j')||k.has('z'))?-1:(k.has('k')||k.has('x'))?1:0;
          if(side){ punchT=.38; punchSide=side; let hit=false;
            riders.forEach(r=>{ if(r.down<=0&&Math.abs(r.pos-me.pos)<9&&(r.x-me.x)*side>0&&Math.abs(r.x-me.x)<.6){ r.down=2.4; r.speed*=.15; score+=100; hit=true; } });
            if(hit) say('WHAM! +100'); } }
        traffic.forEach(c=>{ if(Math.abs(c.pos-me.pos)<5&&Math.abs(c.x-me.x)<.28){ c.pos+=40; me.speed*=.35; me.hp-=14; me.x+=(me.x<c.x?-.25:.25); say('CRASH!'); } });
      } else me.speed=Math.max(0,me.speed-40*dt), me.pos+=me.speed*dt;
      riders.forEach((r,i)=>{
        if(r.down>0){ r.down-=dt; r.speed=Math.max(0,r.speed-120*dt); }
        else { const dz=r.pos-me.pos; let target=r.cruise; if(dz>140) target*=.86; if(dz<-90) target=MAXS*.97;
          if(r.speed<target) r.speed+=55*dt; else r.speed-=40*dt;
          const ahead=traffic.find(c=>c.pos>r.pos&&c.pos-r.pos<46&&Math.abs(c.x-r.x)<.32); if(ahead) r.lane=ahead.x>0?-.55:.55;
          const tx=Math.max(-.8,Math.min(.8,r.lane-curveAt(r.pos+20)*.08)); r.x+=Math.max(-.9*dt,Math.min(.9*dt,tx-r.x)); }
        r.pos+=r.speed*dt; r.cd-=dt;
        if(racing&&r.down<=0&&r.cd<=0&&Math.abs(r.pos-me.pos)<7&&Math.abs(r.x-me.x)<.4){ r.cd=1.3+Math.random()*1.6; me.hp-=7; me.speed*=.88; me.x+=(me.x>r.x?.18:-.18); say('Ouch!'); }
      });
      riders.forEach(r=>{ if(!r.fin&&r.pos>=L) r.fin=true; });
      if(racing){ if(me.hp<=0){ me.hp=0; state='busted'; } else if(me.pos>=L){ state='done'; rank=1+riders.filter(r=>r.pos>me.pos).length; if(rank===1&&!rewarded){ rewarded=true; celebrate(); } } }
    } else if(k.has('enter')||k.has(' ')) reset();
    if(state==='done'&&(k.has('enter'))) reset();
    msgT-=dt;
    // ---- draw
    const hor=H*.42, lines=Math.floor(H-hor);
    const sky=g.createLinearGradient(0,0,0,hor); sky.addColorStop(0,'#e0692f'); sky.addColorStop(1,'#ffd9a0'); g.fillStyle=sky; g.fillRect(0,0,W,hor+1);
    g.fillStyle='#fff3a0'; g.beginPath(); g.arc(W*.7,hor-H*.1,H*.06,0,7); g.fill();
    g.fillStyle='#7a3b2e'; g.beginPath(); g.moveTo(0,hor); const off2=me.head*500; for(let xx=0;xx<=W;xx+=8) g.lineTo(xx,hor-H*.06-H*.05*Math.sin((xx+off2)*.016)-H*.03*Math.sin((xx+off2)*.045)); g.lineTo(W,hor); g.fill();
    const xs=new Array(lines); { let x=0,dx=0; for(let i=lines-1;i>=0;i--){ const t=(i+1)/lines, d=Math.min(400,24*(1/t-1)); dx+=curveAt(me.pos+d)*.02*(W/640); x+=dx; xs[i]=x; } }
    for(let i=0;i<lines;i++){ const t=(i+1)/lines, d=Math.min(2000,24*(1/t-1)), y=hor+i, rh=W*(.03+.42*t), cx=W/2+xs[i]-me.x*rh, band=Math.floor((me.pos+d)/10)%2;
      g.fillStyle=band?'#c98a4b':'#d9a066'; g.fillRect(0,y,W,1); g.fillStyle=band?'#e63946':'#fff'; g.fillRect(cx-rh*1.12,y,rh*2.24,1); g.fillStyle=band?'#4a4a4a':'#555'; g.fillRect(cx-rh,y,rh*2,1);
      if(band){ g.fillStyle='#ffd23f'; g.fillRect(cx-Math.max(1,rh*.015),y,Math.max(2,rh*.03),1); } }
    const proj=(ox,opos)=>{ const dz=opos-me.pos; if(dz<-3||dz>300) return null; const t=Math.min(1.2,1/(1+Math.max(0,dz)/24)), i=Math.max(0,Math.min(lines-1,Math.floor(t*lines)-1)), rh=W*(.03+.42*t); return {x:W/2+xs[i]+(ox-me.x)*rh,y:hor+t*lines,s:Math.max(6,rh*.55),dz}; };
    const items=[]; traffic.forEach(c=>{ const p=proj(c.x,c.pos); if(p) items.push({p,f:()=>car(p.x,p.y,p.s,c.col)}); });
    riders.forEach(r=>{ const p=proj(r.x,r.pos); if(p) items.push({p,f:()=>bike(p.x,p.y,p.s,r.col,r.down>0,0)}); });
    items.sort((a,b)=>b.p.dz-a.p.dz).forEach(o=>o.f());
    const shake=Math.abs(me.x)>1.05?Math.sin(performance.now()*.05)*2:0;
    bike(W/2+me.sv*8,H-8+shake,W*.17,'#e63946',false,punchT>0?punchSide:0);
    if(msgT>0){ g.textAlign='center'; g.font='bold 34px Arial'; g.lineWidth=5; g.strokeStyle='#000'; g.fillStyle='#ffd400'; g.strokeText(msg,W/2,100); g.fillText(msg,W/2,100); g.textAlign='left'; }
    // HUD
    const place=1+riders.filter(r=>r.pos>me.pos).length, lap=Math.min(LAPS,Math.floor(me.pos/TL)+1);
    g.fillStyle='#000a'; g.fillRect(6,6,210,54); g.fillStyle='#fff'; g.font='bold 15px Arial'; g.fillText(`${Math.round(me.speed*2.2)} km/h   Lap ${lap}/${LAPS}`,14,25); g.fillText(`Place ${place}/6   Cash $${score}`,14,45);
    g.fillStyle='#600'; g.fillRect(W-166,10,150,14); g.fillStyle=me.hp>35?'#4c4':'#f55'; g.fillRect(W-166,10,150*me.hp/100,14); g.strokeStyle='#fff'; g.lineWidth=1; g.strokeRect(W-166,10,150,14); g.fillStyle='#fff'; g.font='12px Arial'; g.fillText('STAMINA',W-166,40);
    st.textContent=`Place ${place}/6`;
    g.textAlign='center'; g.lineWidth=6; g.strokeStyle='#000'; g.fillStyle='#ffd400'; g.font='bold 64px Arial';
    if(state==='count'){ const m=count>.2?String(Math.ceil(count-.2)):'GO!'; g.strokeText(m,W/2,230); g.fillText(m,W/2,230); }
    if(state==='done'||state==='busted'){ g.fillStyle='rgba(0,0,0,.6)'; g.fillRect(0,150,W,130); g.fillStyle=state==='busted'?'#f66':rank===1?'#8f8':'#ffd400'; g.font='bold 40px Arial'; g.fillText(state==='busted'?'BUSTED! You ran out of stamina':rank===1?'YOU WIN THE RACE!':`Finished ${rank}${['','st','nd','rd'][rank]||'th'} of 6`,W/2,205); g.fillStyle='#fff'; g.font='17px Arial'; g.fillText(`Cash earned: $${score}   ·   Press Enter to race again`,W/2,245); }
    g.textAlign='left';
  });
  return ()=>{ stop(); K.off(); };
}
ARCADE.push({id:'brawl',f:'BRAWL.EXE',n:'Bike Brawl (Race & Fight)',e:'🏍️',wh:[680,600],m:mountBrawl});
