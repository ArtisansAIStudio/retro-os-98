/* ===== Game music: original chiptune loops made on the fly (no audio files). One tune per game. =====
   Plays while a game window is open, stops when none is. The tray speaker turns it on/off. */
const Music=(()=>{
  // id: [bpm, mode, driving, root midi note]. Anything not listed gets a calm tune.
  const CFG={turbo:[158,'min',1,52],brawl:[150,'min',1,50],dirt:[156,'min',1,55],highway:[152,'min',1,53],hopper:[132,'maj',1,57],rocks:[140,'min',1,50],commando:[138,'min',1,48],invaders:[144,'min',1,52],maze3d:[126,'min',1,45],chomper:[148,'min',1,57],pong:[132,'maj',1,55],drop:[136,'min',0,57],snake:[122,'maj',0,55],blockcraft:[96,'maj',0,52],flames:[104,'maj',0,57],'book-cricket':[112,'maj',0,55],hangman:[92,'min',0,52],npat:[108,'maj',0,53],rps:[116,'maj',0,57],xo:[100,'maj',0,55],dots:[102,'maj',0,53],mines:[88,'min',0,50],sol:[84,'maj',0,52],breakout:[134,'maj',1,55]};
  const SCALE={maj:[0,2,4,7,9],min:[0,3,5,7,10]}, PROG={maj:[0,7,9,5],min:[0,8,3,10]};
  const mf=n=>440*Math.pow(2,(n-69)/12);
  let ctx=null, master=null, noise=null, timer=null, cur=null, on=store.get('music98')!=='0', seq=null, next=0, step=0;
  const ensure=()=>{
    if(!ctx){ try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; }
      master=ctx.createGain(); master.gain.value=.085; master.connect(ctx.destination);
      noise=ctx.createBuffer(1,ctx.sampleRate*.2,ctx.sampleRate); const d=noise.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
    if(ctx.state==='suspended') ctx.resume().catch(()=>{}); return ctx; };
  const osc=(type,f,t,len,vol)=>{ const o=ctx.createOscillator(), g=ctx.createGain(); o.type=type; o.frequency.value=f; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.008); g.gain.exponentialRampToValueAtTime(.0008,t+len); o.connect(g); g.connect(master); o.start(t); o.stop(t+len+.03); };
  const hat=(t,vol,len=.04)=>{ const s=ctx.createBufferSource(), g=ctx.createGain(), f=ctx.createBiquadFilter(); s.buffer=noise; f.type='highpass'; f.frequency.value=6000; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0005,t+len); s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t+len+.02); };
  const kick=t=>{ const o=ctx.createOscillator(), g=ctx.createGain(); o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(40,t+.12); g.gain.setValueAtTime(.9,t); g.gain.exponentialRampToValueAtTime(.001,t+.16); o.connect(g); g.connect(master); o.start(t); o.stop(t+.2); };
  // 64-step melody (4 bars of 16ths), the same every time for a given game
  function compose(id){
    const [bpm,mode,drv,root]=CFG[id]||[100,'maj',0,55], r=SIM.mulberry32(SIM.seedFrom('tune:'+id)), sc=SCALE[mode], lead=[]; let d=5+Math.floor(r()*3);
    for(let i=0;i<64;i++){ const beat=i%4===0, p=beat?.8:(i%2===0?.5:.28); if(i%16===0){ d=Math.max(2,Math.min(8,d)); lead.push(d); continue; }
      if(r()<p){ d+=Math.floor(r()*5)-2; if(d<0) d=0; if(d>9) d=9; lead.push(d); } else lead.push(-1); }
    return {bpm,mode,drv,root,lead,sc,prog:PROG[mode]};
  }
  function tick(){
    if(!ctx||!seq) return; const sp=60/seq.bpm/4;
    while(next<ctx.currentTime+.25){
      const s=step%64, bar=Math.floor(s/16)%4, st=s%16, rt=seq.root+seq.prog[bar], t=next;
      if(seq.drv?st%2===0:st%4===0) osc('triangle',mf(rt-12+(st%8===6?7:0)),t,sp*1.8,.5);
      if(st%4===0&&seq.drv) kick(t); if(st%2===1) hat(t,seq.drv?.12:.07); if(st===4||st===12) hat(t,.18,.07);
      const dg=seq.lead[s]; if(dg>=0) osc('square',mf(seq.root+12+seq.sc[dg%5]+12*Math.floor(dg/5)),t,sp*(st%2?1.2:1.7),.2);
      if(st===0||st===8) [0,seq.mode==='maj'?4:3,7].forEach(n=>osc('square',mf(rt+n),t,sp*5,.045));
      next+=sp; step++; }
  }
  function play(id){ if(!on||cur===id) return; const c=ensure(); if(!c) return; stop(); cur=id; seq=compose(id); step=0; next=c.currentTime+.08; timer=setInterval(tick,90); tick(); }
  function stop(){ clearInterval(timer); timer=null; cur=null; seq=null; }
  const GAMEIDS=new Set([...GAMES.map(g=>g.id),...ARCADE.map(g=>g.id),'mines','sol']);
  function follow(){
    const open=wins.filter(w=>GAMEIDS.has(w.id)&&!w.closed);
    if(!on||wins.some(w=>w.id==='media')||!open.length||document.hidden){ if(cur) stop(); return; }
    const a=active&&GAMEIDS.has(active.id)?active:(open.find(w=>w.id===cur)||open[open.length-1]);
    if(a&&a.id!==cur) play(a.id);
  }
  /* short sound effects for deaths (follow the same on/off switch as the music) */
  function sfx(kind){
    if(!on) return; const c=ensure(); if(!c||!master) return; const t=c.currentTime, out=c.createGain(); out.gain.value=.5; out.connect(c.destination);
    const noiseBurst=(len,f0,f1,vol)=>{ const s=c.createBufferSource(), fl=c.createBiquadFilter(), g=c.createGain(); s.buffer=noise; s.loop=true; fl.type='lowpass'; fl.frequency.setValueAtTime(f0,t); fl.frequency.exponentialRampToValueAtTime(f1,t+len); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+len); s.connect(fl); fl.connect(g); g.connect(out); s.start(t); s.stop(t+len+.05); };
    const sweep=(type,f0,f1,len,vol)=>{ const o=c.createOscillator(), g=c.createGain(); o.type=type; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(f1,t+len); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+len); o.connect(g); g.connect(out); o.start(t); o.stop(t+len+.05); };
    if(kind==='boom'){ noiseBurst(.6,2400,60,.9); sweep('sine',160,35,.5,.8); }
    else if(kind==='crash'){ noiseBurst(.4,1800,120,.7); sweep('square',200,50,.3,.25); }
    else if(kind==='splat'){ sweep('sine',320,50,.22,.8); noiseBurst(.12,900,200,.3); }
    else if(kind==='splash'){ noiseBurst(.35,5000,900,.4); }
    else if(kind==='pop'){ sweep('square',700,180,.12,.3); }
    else if(kind==='flash'){ sweep('sawtooth',260,40,.9,.35); noiseBurst(.5,1200,80,.5); }
    else if(kind==='shatter'){ noiseBurst(.7,6000,300,.6); sweep('triangle',500,70,.6,.3); }
  }
  function paint(){ const el=$('.trayr span[title]'); if(el){ el.textContent=on?'🔊':'🔇'; el.title=on?'Game sound: on (click to mute)':'Game sound: off (click to turn on)'; el.style.cursor='pointer'; } }
  function toggle(){ on=!on; store.set('music98',on?'1':'0'); if(!on) stop(); else { ensure(); follow(); } paint(); }
  const unlock=()=>{ ensure(); };
  document.addEventListener('pointerdown',unlock,{once:false,passive:true}); document.addEventListener('keydown',unlock,{passive:true});
  document.addEventListener('visibilitychange',()=>{ if(document.hidden){ stop(); if(ctx) ctx.suspend().catch(()=>{}); } else { ensure(); follow(); } });
  setInterval(follow,500); paint();
  const sp=$('.trayr span[title]'); if(sp) sp.onclick=toggle;
  return {toggle,play,stop,sfx,get on(){return on;},get info(){return (ctx?ctx.state:'no-ctx')+':'+cur;}};
})();
