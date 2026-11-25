/* ===== Death sequences shared by every game =====
   Death.play(window | element, {kind, x, y, el, col, text}) draws particles on a transparent layer over the game,
   shakes the screen and plays a sound. x/y are in the game canvas' own pixels (or pass el: a DOM element).
   kinds: boom, splat, splash, pop, crash, flash, shatter */
const Death=(()=>{
  const R=(a,b)=>a+Math.random()*(b-a), PAL=['#ff4d4d','#ffd23f','#3ec5ff','#7bd88f','#ff8a00','#b57bff','#ffffff'];
  function layer(host){
    let L=host._dfx;
    if(!L||!L.isConnected){ L=document.createElement('canvas'); L.className='dfx'; L.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:6'; if(getComputedStyle(host).position==='static') host.style.position='relative'; host.appendChild(L); host._dfx=L; L.fx=[]; L.shake=0; L.on=false; }
    const W=Math.max(1,host.clientWidth), H=Math.max(1,host.clientHeight); if(L.width!==W||L.height!==H){ L.width=W; L.height=H; }
    return L; }
  function run(L,host){
    if(L.on) return; L.on=true; let last=performance.now();
    const f=t=>{ const dt=Math.min(.05,(t-last)/1000); last=t; const g=L.getContext('2d'); g.clearRect(0,0,L.width,L.height);
      L.fx.forEach(p=>{ p.t-=dt; const a=Math.max(0,p.t/p.t0), age=1-a; g.save(); g.globalAlpha=Math.min(1,a*1.6);
        if(p.k==='sq'){ p.vy+=(p.g||0)*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=.985; p.rot+=p.vr*dt; g.translate(p.x,p.y); g.rotate(p.rot); g.fillStyle=p.col; g.fillRect(-p.sz/2,-p.sz/2,p.sz,p.sz); }
        else if(p.k==='ring'){ g.strokeStyle=p.col; g.lineWidth=Math.max(1,4*a); g.beginPath(); g.arc(p.x,p.y,p.r0+(p.r1-p.r0)*age,0,7); g.stroke(); }
        else if(p.k==='disc'){ g.fillStyle=p.col; g.beginPath(); g.arc(p.x,p.y,p.r0+(p.r1-p.r0)*age,0,7); g.fill(); }
        else if(p.k==='smoke'){ p.y-=22*dt; p.x+=p.vx*dt; g.fillStyle=p.col; g.beginPath(); g.arc(p.x,p.y,p.r0+(p.r1-p.r0)*age,0,7); g.fill(); }
        else if(p.k==='blob'){ const sq=1+.5*Math.max(0,1-age*6), r=p.r0; g.translate(p.x,p.y); g.scale(sq,1/sq); g.fillStyle=p.col; g.beginPath(); g.ellipse(0,0,r,r*.55,0,0,7); g.fill(); g.strokeStyle='#123'; g.lineWidth=2; g.beginPath(); [[-5,-3],[5,-3]].forEach(([ex,ey])=>{ g.moveTo(ex-2,ey-2); g.lineTo(ex+2,ey+2); g.moveTo(ex+2,ey-2); g.lineTo(ex-2,ey+2); }); g.stroke(); }
        else if(p.k==='text'){ p.y-=18*dt; g.font='bold '+(p.sz||24)+'px "Courier New",monospace'; g.textAlign='center'; g.lineWidth=5; g.strokeStyle='#000'; g.strokeText(p.txt,p.x,p.y); g.fillStyle=p.col; g.fillText(p.txt,p.x,p.y); }
        else if(p.k==='flash'){ g.fillStyle=p.col; g.fillRect(0,0,L.width,L.height); }
        g.restore(); });
      L.fx=L.fx.filter(p=>p.t>0);
      const cv=host.querySelector('canvas:not(.dfx)'); if(L.shake>0){ L.shake-=dt; const m=Math.max(0,L.shake)*22; if(cv) cv.style.transform=`translate(${R(-m,m)}px,${R(-m,m)}px)`; } else if(cv&&cv.style.transform) cv.style.transform='';
      if(L.fx.length||L.shake>0) requestAnimationFrame(f); else { L.on=false; g.clearRect(0,0,L.width,L.height); } };
    requestAnimationFrame(f); }
  function play(target,o={}){
    try{
      const host=target.body||target; if(!host||!host.isConnected) return; const L=layer(host), kind=o.kind||'boom', col=o.col||'#ff8a00';
      const cv=host.querySelector('canvas:not(.dfx)'), rh=host.getBoundingClientRect(); let x=L.width/2, y=L.height/2, s=1;
      if(o.el){ const r=o.el.getBoundingClientRect(); x=r.left-rh.left+r.width/2; y=r.top-rh.top+r.height/2; s=Math.max(.6,r.width/16); }
      else if(cv){ const rc=cv.getBoundingClientRect(); s=rc.width/cv.width; x=rc.left-rh.left+(o.x??cv.width/2)*s; y=rc.top-rh.top+(o.y??cv.height/2)*s; }
      const add=p=>L.fx.push({t:p.t,t0:p.t,...p});
      const sq=(n,cols,v0,v1,t0,t1,sz0,sz1,gr)=>{ for(let i=0;i<n;i++){ const a=R(0,Math.PI*2), v=R(v0,v1)*s; add({k:'sq',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:gr*s,rot:R(0,6),vr:R(-9,9),t:R(t0,t1),sz:R(sz0,sz1)*s,col:cols[Math.floor(R(0,cols.length))]}); } };
      if(kind==='boom'){ add({k:'disc',x,y,r0:6*s,r1:46*s,t:.28,col:'#fff'}); add({k:'ring',x,y,r0:8*s,r1:70*s,t:.55,col:'#ffd23f'}); add({k:'ring',x,y,r0:4*s,r1:44*s,t:.4,col:'#ff4d4d'}); sq(26,['#ff8a00','#ffd23f','#fff','#ff4d4d'],60,230,.45,.9,3,7,0); sq(10,[col,'#333'],40,160,.7,1.2,4,8,320); L.shake=.45; }
      else if(kind==='splat'){ add({k:'blob',x,y,r0:15*s,t:1.3,col:'#5cbf3a'}); sq(14,['#5cbf3a','#8be05a'],30,120,.5,.9,2,5,260); add({k:'ring',x,y,r0:6*s,r1:30*s,t:.35,col:'#8be05a'}); L.shake=.15; }
      else if(kind==='splash'){ [0,.12,.24].forEach((d,i)=>setTimeout(()=>{ if(L.isConnected) add({k:'ring',x,y,r0:4*s,r1:(26+i*14)*s,t:.7,col:'#9ad6ff'}); },d*1000)); for(let i=0;i<18;i++) add({k:'sq',x,y,vx:R(-70,70)*s,vy:R(-210,-90)*s,g:420*s,rot:0,vr:0,t:R(.6,1.1),sz:R(2,4)*s,col:i%3?'#9ad6ff':'#fff'}); }
      else if(kind==='pop'){ add({k:'ring',x,y,r0:4*s,r1:30*s,t:.35,col}); sq(12,[col,'#fff'],40,130,.3,.6,2,5,0); L.shake=.08; }
      else if(kind==='crash'){ sq(16,['#ffd23f','#fff','#ff8a00'],80,220,.3,.7,2,4,160); for(let i=0;i<6;i++) add({k:'smoke',x:x+R(-8,8)*s,y,vx:R(-12,12),r0:6*s,r1:20*s,t:R(.8,1.3),col:'#777'}); add({k:'ring',x,y,r0:4*s,r1:34*s,t:.3,col:'#ffd23f'}); L.shake=.3; }
      else if(kind==='flash'){ add({k:'flash',t:.7,col:'rgba(200,0,0,.55)'}); L.shake=.5; }
      else if(kind==='shatter'){ for(let i=0;i<70;i++) add({k:'sq',x:R(0,L.width),y:R(0,L.height*.7),vx:R(-40,40),vy:R(-90,20),g:380,rot:R(0,6),vr:R(-6,6),t:R(.9,1.7),sz:R(5,12)*s,col:PAL[i%PAL.length]}); L.shake=.25; }
      if(o.text) add({k:'text',x:L.width/2,y:L.height*.38,t:1.6,col:o.tcol||'#ffd23f',txt:o.text,sz:o.size||26});
      if(typeof Music!=='undefined'&&Music.sfx) Music.sfx(kind);
      run(L,host);
    }catch(e){}
  }
  return {play};
})();
