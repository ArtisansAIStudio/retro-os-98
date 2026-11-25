// ===== Dirt Dash: an original side-view motocross game with an 8-bit pixel look =====
function mountDirt(w){
  w.body.innerHTML=`<div class="arcbar"><span>Space gas · X turbo · ↑↓ change lane · ←→ tilt in the air</span><span id="st"></span></div><canvas class="arc" width="256" height="160" style="image-rendering:pixelated"></canvas>`;
  const cv=$('canvas',w.body), g=cv.getContext('2d'), K=keyset(w), st=$('#st',w.body), W=256, H=160, TLEN=4200;
  if(coarse) touchPad(w,K,[['w','▲'],['s','▼'],[' ','⛽ Gas'],['x','🔥 Turbo'],['a','⟲'],['d','⟳']]);
  g.imageSmoothingEnabled=false;
  const LY=[86,103,121,140], JERSEY=['#e63946','#ffd23f','#3ec5ff','#7bd88f'];
  // 16x12 pixel bike facing right. k tyre, w hub, j jersey, h helmet, s skin, m frame, g fork/pipe
  const BIKE=['......hhh.......','......hhhs......','....jjjjj.......','...jjjjjjj.g....','..jjjjjjj.gg....','..mmmmmmmmg.....','.mmmmmmmmmmm....','.kkk..mm..kkk...','kkwkk.mm.kkwkk..','kwwwk....kwwwk..','kkwkk....kkwkk..','.kkk......kkk...'];
  const pix=(rows,x,y,pal)=>{ for(let r=0;r<rows.length;r++) for(let c=0;c<rows[r].length;c++){ const p=rows[r][c]; if(p!=='.'){ g.fillStyle=pal[p]; g.fillRect(x+c,y+r,1,1); } } };
  let me, cpus, obs, dust, state, count, el, msg, msgT, rewarded, rank, best=parseFloat(store.get('dirt-best')||'0')||0, laneCd, newBest, doneT;
  const mkBike=(lane,col,cpu)=>({x:20,lane,ly:lane,v:0,z:0,vz:0,pitch:0,down:0,temp:0,air:0,ramp:null,col,cpu,cd:0,hit:new Set()});
  const reset=()=>{
    me=mkBike(2,JERSEY[0],false); cpus=[0,1,3].map((l,i)=>{ const b=mkBike(l,JERSEY[i+1],true); b.top=130+Math.random()*28; return b; });
    obs=[]; for(let x=320;x<TLEN-220;x+=70+Math.random()*90){ const r=Math.random(), lane=Math.floor(Math.random()*4);
      if(r<.34) obs.push({t:'ramp',x,lane,w:30+(Math.random()*20|0),h:11+(Math.random()*13|0)});
      else if(r<.6) obs.push({t:'mud',x,lane,w:42,h:0});
      else if(r<.84) obs.push({t:'bump',x,lane,w:8,h:0});
      else for(let l=0;l<4;l++) obs.push({t:'ramp',x,lane:l,w:44,h:22}); }
    dust=[]; state='count'; count=3.4; el=0; msg=''; msgT=0; rewarded=false; rank=0; laneCd=0; newBest=false; doneT=0; };
  reset(); w.dd={get me(){return me;},get cpus(){return cpus;},get obs(){return obs;},get state(){return state;},get el(){return el;},get rank(){return rank;}};
  const say=t=>{ msg=t; msgT=1.2; };
  const rampAt=b=>obs.find(o=>o.t==='ramp'&&o.lane===Math.round(b.ly)&&b.x>=o.x&&b.x<o.x+o.w);
  const crash=(b,t)=>{ b.down=1.1; b.v=0; b.z=0; b.pitch=0; b.vz=0; b.air=0; b.ramp=null; if(!b.cpu) say(t||'CRASH!'); };
  const stop=loop(w,dt=>{
    const k=K.k; if(active!==w) k.clear(); msgT-=dt;
    const gas=k.has(' ')||k.has('z'), turbo=k.has('x')||k.has('shift'), up=k.has('arrowup')||k.has('w'), dn=k.has('arrowdown')||k.has('s'), tl=k.has('arrowleft')||k.has('a'), tr=k.has('arrowright')||k.has('d');
    if(state==='count'){ count-=dt; if(count<=0) state='race'; }
    else {
      const racing=state==='race'; if(racing) el+=dt;
      const b=me; laneCd-=dt;
      if(b.down>0){ b.down-=dt; b.v=0; }
      else if(racing){
        if(!b.air&&laneCd<=0){ if(up&&b.lane>0){ b.lane--; laneCd=.16; } else if(dn&&b.lane<3){ b.lane++; laneCd=.16; } }
        if(!b.air){
          const o=rampAt(b), mud=obs.find(m=>m.t==='mud'&&m.lane===Math.round(b.ly)&&b.x>=m.x&&b.x<m.x+m.w);
          let target=gas?(turbo?200:140):0; if(mud) target*=.5;
          b.v+=(target>b.v?95:-55)*dt; b.v=Math.max(0,b.v);
          if(turbo&&gas) b.temp+=32*dt; else b.temp=Math.max(0,b.temp-18*dt);
          if(b.temp>=100){ b.temp=45; crash(b,'OVERHEATED!'); }
          const bump=obs.find(m=>m.t==='bump'&&m.lane===Math.round(b.ly)&&Math.abs(b.x-m.x)<4&&!b.hit.has(m));
          if(bump){ b.hit.add(bump); b.v*=.5; b.z=0; say('BUMP!'); }
          if(o){ b.ramp=o; b.z=(b.x-o.x)/o.w*o.h; b.pitch+=(Math.atan2(o.h,o.w)-b.pitch)*Math.min(1,dt*10); }
          else if(b.ramp){ const o2=b.ramp; b.ramp=null; b.air=0.001; b.vz=b.v*(o2.h/o2.w)*1.1+25; b.z=o2.h; }
          else b.pitch*=Math.max(0,1-dt*8);
        } else {
          b.air+=dt; b.z+=b.vz*dt; b.vz-=360*dt; b.pitch+=((tl?1:0)-(tr?1:0))*dt*2.3;
          if(b.z<=0){ const ok=Math.abs(b.pitch)<.42; b.z=0; b.vz=0;
            if(ok){ if(Math.abs(b.pitch)<.16&&b.air>.5) say('NICE LANDING!'); b.air=0; b.pitch=0; } else crash(b,'WIPEOUT!'); }
        }
        b.x+=b.v*dt;
        b.ly+=(b.lane-b.ly)*Math.min(1,dt*14);
        if(b.v>40&&!b.air&&Math.random()<dt*40) dust.push({x:b.x-6,y:LY[Math.round(b.ly)]+6,vx:-b.v*.3,vy:-12-Math.random()*14,l:.5});
        if(turbo&&gas&&b.v>150&&Math.random()<dt*30) dust.push({x:b.x-8,y:LY[Math.round(b.ly)]-8-b.z,vx:-90,vy:-5+Math.random()*10,l:.25,f:1});
        if(b.x>=TLEN){ state='done'; rank=1+cpus.filter(c=>c.x>b.x).length; if(el<best||!best){ best=el; store.set('dirt-best',String(el)); newBest=true; } if(rank===1&&!rewarded){ rewarded=true; celebrate(); } }
      }
      cpus.forEach(c=>{
        if(c.down>0){ c.down-=dt; c.v=0; } else if(racing||state==='done'){ c.v+=((c.top||120)*(racing?1:.4)>c.v?60:-40)*dt; if(obs.some(m=>m.t==='mud'&&m.lane===c.lane&&c.x>=m.x&&c.x<m.x+m.w)) c.v*=1-dt*1.2; }
        c.x+=c.v*dt; c.cd-=dt;
        if(racing&&c.cd<=0&&c.lane===Math.round(me.ly)&&Math.abs(c.x-me.x)<11&&me.z<7){ c.cd=.8; me.v*=.75; c.v*=.8; say('BUMPED!'); }
      });
    }
    dust.forEach(d=>{ d.x+=d.vx*dt; d.y+=d.vy*dt; d.vy+=40*dt; d.l-=dt; }); dust=dust.filter(d=>d.l>0);
    if(state==='done'){ doneT+=dt; if(doneT>.6&&(k.has('enter')||k.has(' '))) reset(); }
    // ---- draw
    const cam=Math.max(0,Math.min(TLEN-120,me.x-60)), hash=n=>{ n=Math.imul(n^n>>>15,2246822519); n=Math.imul(n^n>>>13,3266489917); return (n^n>>>16)>>>0; };
    ['#3b8cff','#5aa5ff','#7bb9ff','#9ccdff'].forEach((c,i)=>{ g.fillStyle=c; g.fillRect(0,i*13,W,13); });
    g.fillStyle='#2f8f4e'; for(let x=0;x<W;x+=2){ const hh=10+7*Math.sin((x+cam*.2)*.05)+4*Math.sin((x+cam*.2)*.13); g.fillRect(x,56-hh,2,hh+2); }
    g.fillStyle='#3a3a4d'; g.fillRect(0,50,W,24);
    for(let x=-3;x<W+3;x+=3){ const cx=Math.floor((x+cam*.5)/3), hv=hash(cx); for(let r=0;r<4;r++){ g.fillStyle=['#e63946','#ffd23f','#ffffff','#3ec5ff','#7bd88f','#ff8a00'][(hv>>>(r*4))%6]; g.fillRect(x,52+r*5+((hv>>>(r+9))%2),2,3); } }
    g.fillStyle='#d8d8e8'; g.fillRect(0,71,W,3); g.fillStyle='#9a9ab0'; for(let x=-((cam*1)%12);x<W;x+=12) g.fillRect(x,71,1,3);
    g.fillStyle='#b5733a'; g.fillRect(0,74,W,H-74);
    for(let i=0;i<4;i++){ g.fillStyle=i%2?'#c68443':'#b97a3c'; g.fillRect(0,LY[i]-8,W,17); g.fillStyle='#e6c58a'; for(let x=-((cam)%24);x<W;x+=24) g.fillRect(x,LY[i]-8,10,1); }
    g.fillStyle='#8a5a28'; g.fillRect(0,H-6,W,6); for(let x=-((cam*1.3)%16);x<W;x+=16){ g.fillStyle='#a06a30'; g.fillRect(x,H-6,6,2); }
    const chk=(wx)=>{ const sx=Math.floor(wx-cam); if(sx<-10||sx>W) return; for(let i=0;i<4;i++) for(let r=0;r<6;r++){ g.fillStyle=(r+i)%2?'#111':'#fff'; g.fillRect(sx,LY[i]-8+r*3,4,3); g.fillStyle=(r+i)%2?'#fff':'#111'; g.fillRect(sx+4,LY[i]-8+r*3,4,3); } };
    chk(30); chk(TLEN);
    obs.forEach(o=>{ const sx=Math.floor(o.x-cam); if(sx>W||sx+o.w<0) return; const y=LY[o.lane]+7;
      if(o.t==='ramp'){ g.fillStyle='#8a5a24'; g.beginPath(); g.moveTo(sx,y); g.lineTo(sx+o.w,y); g.lineTo(sx+o.w,y-o.h); g.closePath(); g.fill(); g.strokeStyle='#ffd23f'; g.lineWidth=1.2; g.beginPath(); g.moveTo(sx,y); g.lineTo(sx+o.w,y-o.h); g.stroke(); g.fillStyle='#5a3a18'; g.fillRect(sx+o.w-1,y-o.h,2,o.h); }
      else if(o.t==='mud'){ g.fillStyle='#5a3a20'; g.fillRect(sx,y-5,o.w,5); g.fillStyle='#7a5230'; for(let i=2;i<o.w;i+=6) g.fillRect(sx+i,y-4,2,1); }
      else { g.fillStyle='#4a2c12'; g.fillRect(sx,y-4,o.w,4); g.fillStyle='#9a6a38'; g.fillRect(sx,y-5,o.w,1); } });
    const drawBike=(b,pal)=>{ const sx=Math.floor(b.x-cam), ly=LY[Math.floor(b.ly)]+((LY[Math.min(3,Math.floor(b.ly)+1)]-LY[Math.floor(b.ly)])*(b.ly-Math.floor(b.ly))), gy=Math.floor(ly)+7;
      if(sx<-20||sx>W+20) return; g.fillStyle='rgba(0,0,0,.3)'; g.fillRect(sx-7,gy+1,14,2);
      g.save(); g.translate(sx,gy-b.z); g.rotate(b.down>0?-.9+Math.sin(performance.now()*.03)*.2:-b.pitch); g.translate(-8,-12); pix(BIKE,0,0,pal); g.restore(); };
    [...cpus,me].sort((a,b)=>a.ly-b.ly).forEach(b=>drawBike(b,{k:'#111',w:'#bbb',j:b.col,h:'#fff',s:'#f1c27d',m:b.cpu?'#444':'#222',g:'#999'}));
    dust.forEach(d=>{ g.fillStyle=d.f?(d.l>.12?'#ffd23f':'#ff8a00'):'#d9b27a'; g.fillRect(Math.floor(d.x-cam),Math.floor(d.y),2,d.f?1:2); });
    // HUD
    g.fillStyle='#000a'; g.fillRect(2,2,92,24); g.font='bold 8px "Courier New",monospace'; g.fillStyle='#fff'; g.fillText(`TIME ${el.toFixed(2)}${best?'  BEST '+best.toFixed(1):''}`,5,10);
    g.fillStyle='#222'; g.fillRect(5,14,62,7); g.fillStyle=me.temp<60?'#3ec5ff':me.temp<85?'#ffd23f':'#ff4040'; g.fillRect(5,14,62*me.temp/100,7); g.strokeStyle='#fff'; g.lineWidth=1; g.strokeRect(5.5,14.5,61,6); g.fillStyle='#fff'; g.fillText('HEAT',70,21);
    g.fillStyle='#000a'; g.fillRect(W-62,2,60,10); g.fillStyle='#444'; g.fillRect(W-58,6,52,2); [me,...cpus].forEach((b,i)=>{ g.fillStyle=i?b.col:'#fff'; g.fillRect(W-58+Math.min(50,50*b.x/TLEN),5,3,4); });
    const place=1+cpus.filter(c=>c.x>me.x).length; st.textContent=`Place ${place}/4`;
    g.textAlign='center'; g.font='bold 12px "Courier New",monospace';
    if(msgT>0){ g.fillStyle='#000'; g.fillText(msg,W/2+1,41); g.fillStyle='#ffd23f'; g.fillText(msg,W/2,40); }
    if(state==='count'){ for(let i=0;i<3;i++){ g.fillStyle=count>i+.4?'#e63946':'#400'; if(count<=.4) g.fillStyle='#4c4'; g.fillRect(W/2-14+i*11,30,8,8); } }
    if(state==='done'){ g.fillStyle='rgba(0,0,0,.65)'; g.fillRect(30,50,196,60); g.fillStyle=rank===1?'#8f8':'#ffd23f'; g.font='bold 14px "Courier New",monospace'; g.fillText(rank===1?'YOU WIN!':`FINISHED ${rank}${['','st','nd','rd','th'][rank]}`,W/2,70); g.fillStyle='#fff'; g.font='bold 9px "Courier New",monospace'; g.fillText(`Time ${el.toFixed(2)}s${newBest?'  NEW BEST!':''}`,W/2,86); g.fillText('Space / Enter: ride again',W/2,100); }
    g.textAlign='left';
  });
  return ()=>{ stop(); K.off(); };
}
ARCADE.push({id:'dirt',f:'DIRT.EXE',n:'Dirt Dash (Motocross)',e:'🏍️',wh:[700,560],m:mountDirt});
