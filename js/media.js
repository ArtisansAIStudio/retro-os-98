// ===== Media Player: original synthesized tunes + your own audio files =====
const mf=n=>440*2**((n-69)/12);
const TRACKS=[
  {n:'Chiptune Jam.wav',dur:15,build(tone){
    const L=[72,0,76,0,79,0,76,0,74,0,77,0,81,0,77,0,72,76,79,84,79,76,72,0,71,74,77,0,74,0,71,0],
          B=[48,0,48,0,53,0,53,0,43,0,43,0,55,0,55,0,48,0,48,0,53,0,53,0,43,0,55,0,43,0,55,0], step=60/140/2;
    for(let r=0;r<2;r++) L.forEach((n,i)=>{ const t=(r*32+i)*step; if(n) tone(mf(n),t,step*.9,'square',.1); if(B[i]) tone(mf(B[i]),t,step*1.8,'triangle',.22); });
  }},
  {n:'Sunday Morning.wav',dur:20,build(tone){
    const L=[67,0,0,71,0,74,0,0,72,0,0,69,0,65,0,0,64,0,67,0,71,0,0,0,69,0,0,0,67,0,0,0], step=60/80/2;
    L.forEach((n,i)=>{ const t=i*step; if(n) tone(mf(n),t,step*3,'triangle',.2); });
    [[48,52,55],[53,57,60],[45,48,52],[43,47,50]].forEach((ch,i)=>ch.forEach(n=>tone(mf(n),i*step*8,step*8,'sine',.07)));
    L.forEach((n,i)=>{ const t=(i+32)*step; if(n) tone(mf(n+(i%8===3?5:0)),t,step*3,'triangle',.18); });
    [[48,52,55],[53,57,60],[45,48,52],[43,47,50]].forEach((ch,i)=>ch.forEach(n=>tone(mf(n),(i*8+32)*step,step*8,'sine',.07)));
  }},
  {n:'Dial-Up Lullaby.wav',dur:8,build(tone,oc){
    let t=.2; const seq=[2100,1200,2400,980,1650,2250];
    for(let i=0;i<46;i++){ tone(seq[i%6]*(1+(i%3)*.03),t,.07,'sine',.14); t+=.08+(i%7===0?.18:0); }
    const nb=oc.createBuffer(1,oc.sampleRate*3,oc.sampleRate), d=nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*.25;
    const s=oc.createBufferSource(), g=oc.createGain(); s.buffer=nb; g.gain.setValueAtTime(0,4); g.gain.linearRampToValueAtTime(.35,4.3); g.gain.linearRampToValueAtTime(0,7.2); s.connect(g); g.connect(oc.destination); s.start(4);
  }}];
const SECRET={n:'Secret Track.wav',dur:14,build(tone){
  const seq=[72,72,67,67,64,69,64,69,62,60], step=.55;
  for(let r=0;r<2;r++) seq.forEach((n,i)=>{ const t=(r*10+i)*step*.9; tone(mf(n),t,step*1.6,'triangle',.22); tone(mf(n+12),t,step,'sine',.08); });
  [48,43,45,41].forEach((n,i)=>tone(mf(n),i*3.4,3.4,'sine',.08));
}};
function renderTrack(t){
  const sr=22050, OC=window.OfflineAudioContext||window.webkitOfflineAudioContext, oc=new OC(1,sr*t.dur,sr);
  const tone=(freq,st,len,type,vol)=>{ const o=oc.createOscillator(), g=oc.createGain(); o.type=type; o.frequency.value=freq; g.gain.setValueAtTime(0,st); g.gain.linearRampToValueAtTime(vol,st+.01); g.gain.exponentialRampToValueAtTime(.001,st+len); o.connect(g); g.connect(oc.destination); o.start(st); o.stop(st+len+.02); };
  t.build(tone,oc); return oc.startRendering();
}
const fmtT=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
APPS.media={icon:'🎵',wh:[400,400],single:true,col:true,title:'Media Player',
  menu:w=>[{label:'File',items:[['Open...',()=>w.mp.open()],'-',['Exit',()=>w.close()]]},
    {label:'Play',items:[['Play/Pause',()=>w.mp.toggle()],['Stop',()=>w.mp.stop()],['Next',()=>w.mp.next(1)],['Previous',()=>w.mp.next(-1)]]},
    aboutMenu('Media Player','Media Player\nPlays three original tunes and your own music: File > Open (pick several), or drag audio files onto this window. Your files never leave your computer.\n\nNo startup chimes were harmed.')],
  mount(w,a={}){
    w.body.innerHTML=`<div style="padding:6px;display:flex;flex-direction:column;gap:6px;height:100%"><canvas width="380" height="80" style="width:100%;height:80px;background:#000;box-shadow:var(--sunk)"></canvas>
      <div style="display:flex;justify-content:space-between"><b id="tt">Ready</b><span id="tm">0:00 / 0:00</span></div>
      <input type="range" id="sk" min="0" max="1000" value="0" style="width:100%">
      <div style="display:flex;gap:4px;align-items:center"><button data-a="p" style="min-width:34px">⏮</button><button data-a="t" style="min-width:34px" id="pp">▶</button><button data-a="s" style="min-width:34px">⏹</button><button data-a="n" style="min-width:34px">⏭</button>
      <span style="margin-left:8px">🔊</span><input type="range" id="vl" min="0" max="100" value="70" style="width:90px"><label style="margin-left:auto"><input type="checkbox" id="lp" checked> Loop</label></div>
      <div class="lst" id="pl" style="height:auto;flex:1;min-height:70px"></div></div>`;
    const cv=$('canvas',w.body), g=cv.getContext('2d'), tt=$('#tt',w.body), tm=$('#tm',w.body), sk=$('#sk',w.body), vl=$('#vl',w.body), lp=$('#lp',w.body), pp=$('#pp',w.body), pl=$('#pl',w.body);
    const list=TRACKS.map(t=>({n:t.n,get:()=>renderTrack(t)}));
    let ctx=null,gain,an,buf=null,src=null,t0=0,off=0,playing=false,idx=0,seeking=false;
    const ac=()=>{ if(!ctx){ ctx=new (window.AudioContext||window.webkitAudioContext)(); gain=ctx.createGain(); an=ctx.createAnalyser(); an.fftSize=128; gain.connect(an); an.connect(ctx.destination); gain.gain.value=vl.value/100; } if(ctx.state==='suspended') ctx.resume(); return ctx; };
    const killSrc=()=>{ if(src){ src.onended=null; try{ src.stop(); }catch(e){} src.disconnect(); src=null; } };
    const renderList=()=>{ pl.innerHTML=''; list.forEach((it,i)=>{ const d=mk('div',i===idx?'sel':'',`🎵 ${esc(it.n)}`); d.ondblclick=()=>load(i).then(play); d.onclick=()=>{ if(coarse) load(i).then(play); }; pl.appendChild(d); }); };
    async function load(i){ ac(); idx=i; killSrc(); playing=false; off=0; pp.textContent='▶'; tt.textContent='Loading...'; renderList(); const it=list[i]; if(!it.buf) it.buf=await it.get(); if(idx!==i) return; buf=it.buf; tt.textContent=it.n; tm.textContent=`0:00 / ${fmtT(buf.duration)}`; }
    function play(){
      if(!buf){ load(idx).then(play); return; } ac(); killSrc();
      const s=ctx.createBufferSource(); s.buffer=buf; s.connect(gain); src=s; t0=ctx.currentTime-off; s.start(0,off); playing=true; pp.textContent='⏸';
      s.onended=()=>{ if(src!==s||!playing) return; off=0; killSrc(); lp.checked?play():mp.next(1); };
    }
    const mp=w.mp={
      toggle(){ if(playing){ off=ctx.currentTime-t0; killSrc(); playing=false; pp.textContent='▶'; } else play(); },
      stop(){ killSrc(); playing=false; off=0; pp.textContent='▶'; sk.value=0; if(buf) tm.textContent=`0:00 / ${fmtT(buf.duration)}`; },
      next(d){ load((idx+d+list.length)%list.length).then(play); },
      async add(files){
        let first=-1, bad=0;
        for(const file of files){ try{ const b=await ac().decodeAudioData(await file.arrayBuffer()); list.push({n:file.name,buf:b}); if(first<0) first=list.length-1; }catch(e){ bad++; } }
        if(bad) alertBox(`Retro OS cannot play ${bad} of the files.\n\nThey are not a supported audio format (WAV, MP3, OGG, M4A and FLAC usually work), or they are corrupt.`,'err','Media Player');
        renderList(); if(first>=0){ await load(first); play(); }
      },
      open(){ const f=document.createElement('input'); f.type='file'; f.multiple=true; f.accept='audio/*,.wav,.mp3,.ogg,.m4a,.flac'; f.onchange=()=>{ if(f.files.length) mp.add([...f.files]); }; f.click(); }
    };
    w.body.querySelector('div').onclick=e=>{ const a=e.target.dataset.a; if(a==='t') mp.toggle(); else if(a==='s') mp.stop(); else if(a==='n') mp.next(1); else if(a==='p') mp.next(-1); };
    vl.oninput=()=>{ if(gain) gain.gain.value=vl.value/100; };
    sk.onpointerdown=()=>{ seeking=true; };
    sk.onchange=()=>{ seeking=false; if(!buf) return; off=sk.value/1000*buf.duration; if(playing) play(); else tm.textContent=`${fmtT(off)} / ${fmtT(buf.duration)}`; };
    w.body.ondragover=e=>{ e.preventDefault(); }; w.body.ondrop=e=>{ e.preventDefault(); const fs=[...e.dataTransfer.files].filter(f=>/^audio\//.test(f.type)||/\.(wav|mp3|ogg|m4a|flac)$/i.test(f.name)); if(fs.length) mp.add(fs); };
    if(a.secret){ list.push({n:'Secret Track (you found it).wav',get:()=>renderTrack(SECRET)}); renderList(); load(list.length-1).then(play); } else { renderList(); load(0); }
    const timer=setInterval(()=>{ if(!playing||!buf||seeking) return; const p=(ctx.currentTime-t0)%buf.duration; sk.value=p/buf.duration*1000; tm.textContent=`${fmtT(p)} / ${fmtT(buf.duration)}`; },200);
    const stopVis=loop(w,()=>{
      g.fillStyle='#000'; g.fillRect(0,0,380,80);
      if(an&&playing){ const d=new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(d); const n=32, bw=380/n;
        for(let i=0;i<n;i++){ const v=d[i]/255*78, gr=g.createLinearGradient(0,80,0,80-v); gr.addColorStop(0,'#0f0'); gr.addColorStop(.7,'#ff0'); gr.addColorStop(1,'#f00'); g.fillStyle=gr; g.fillRect(i*bw+1,80-v,bw-2,v); } }
      else { g.fillStyle='#030'; for(let i=0;i<32;i++) g.fillRect(i*11.9+1,76,10,3); }
    });
    return ()=>{ stopVis(); clearInterval(timer); killSrc(); if(ctx) ctx.close(); };
  }};
