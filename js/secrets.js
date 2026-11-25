// ===== Hidden files and Easter eggs =====
const EGGS=['bsod','helper','bin','capsule','mixtape','konami','volume','love','party'];
const eggsFound=()=>{ try{ return JSON.parse(store.get('eggs98')||'[]'); }catch(e){ return []; } };
function updateEggUI(){ const n=eggsFound().length; $$('.eggcnt').forEach(e=>e.textContent=`🥚 Secrets: ${n}/${EGGS.length}`); }
async function egg(id){
  const f=eggsFound(); if(f.includes(id)) return; f.push(id); store.set('eggs98',JSON.stringify(f)); updateEggUI();
  await sleep(900);
  if(f.length===5){
    const j=jar(); j['Golden Wrapper']=(j['Golden Wrapper']||0)+1; store.set('candies',JSON.stringify(j)); renderTuck();
    const c=CANDIES.find(x=>x.secret);
    dialog({title:'Secret sweet unlocked!',width:380,body:`<div class="pm">${candySVG(c)}<div>You found <b>5 secrets</b>.<br><b>Golden Wrapper</b> added to My Sweets.<br><i>Only the curious get this one.</i></div></div>`});
  } else dialog({title:'Secret found!',icon:'info',width:340,body:`🥚 You found a hidden secret.<br><b>${f.length} of ${EGGS.length}</b> found${f.length<5?'. Find 5 for a surprise.':'.'}`});
}

/* confetti + jingle (original, synthesized) */
function confetti(emojis){
  const c=mk('canvas'); c.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:9500;pointer-events:none'; c.width=innerWidth; c.height=innerHeight; document.body.appendChild(c);
  const g=c.getContext('2d'), cols=['#e63946','#f5c400','#2a9d3a','#1d6fe0','#ff6fb5','#ff8a00'];
  const P=Array.from({length:150},()=>({x:Math.random()*c.width,y:-Math.random()*c.height*.6,vx:(Math.random()-.5)*3,vy:2+Math.random()*4,r:Math.random()*6,s:5+Math.random()*7,col:pick(cols),e:emojis&&Math.random()<.25?pick(emojis):null}));
  let raf; const t0=performance.now();
  const f=t=>{ g.clearRect(0,0,c.width,c.height); P.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.r+=.15; if(p.e){ g.font='22px serif'; g.fillText(p.e,p.x,p.y); } else { g.save(); g.translate(p.x,p.y); g.rotate(p.r); g.fillStyle=p.col; g.fillRect(-p.s/2,-p.s/4,p.s,p.s/2); g.restore(); } });
    if(t-t0<5000) raf=requestAnimationFrame(f); else { cancelAnimationFrame(raf); c.remove(); } }; raf=requestAnimationFrame(f);
}
function jingle(notes,step=.12,type='square'){
  try{ const AC=window.AudioContext||window.webkitAudioContext, ctx=new AC(); const t0=ctx.currentTime+.02;
    notes.forEach((n,i)=>{ if(!n) return; const o=ctx.createOscillator(), g=ctx.createGain(); o.type=type; o.frequency.value=mf(n); g.gain.setValueAtTime(0,t0+i*step); g.gain.linearRampToValueAtTime(.15,t0+i*step+.01); g.gain.exponentialRampToValueAtTime(.001,t0+i*step+step*1.8); o.connect(g); g.connect(ctx.destination); o.start(t0+i*step); o.stop(t0+i*step+step*2); });
    setTimeout(()=>ctx.close(),notes.length*step*1000+800); }catch(e){}
}

/* hidden programs (run, no window of their own) */
APPS.bsod={icon:'💀',run(){
  egg('bsod');
  const b=mk('div','',`<pre style="margin:0;font:22px/1.25 var(--pix)">Retro OS

A fatal exception 0E has occurred at 0028:C0011E36. The current
application will be terminated.

*  Press any key to terminate the current application.
*  Press CTRL+ALT+DEL again to restart your computer. You will
   lose any unsaved information in all applications.

...just kidding. Nothing is wrong. Press any key to continue _</pre>`);
  b.style.cssText='position:fixed;inset:0;z-index:9800;background:#0000aa;color:#fff;padding:40px;cursor:pointer';
  document.body.appendChild(b);
  const off=()=>{ b.remove(); document.removeEventListener('keydown',off,true); };
  setTimeout(()=>{ b.onclick=off; document.addEventListener('keydown',off,true); },700);
}};
APPS.helper={icon:'📎',async run(){
  egg('helper');
  const r=await dialog({title:'Your Friendly Assistant',icon:'q',width:380,buttons:['Yes, please','No, I am fine'],cancel:'No, I am fine',body:'<b>It looks like you are procrastinating.</b><br><br>Would you like some help with that?'});
  if(r.btn==='Yes, please') alertBox('Great!\n\nStep 1: open another game.\nStep 2: tell yourself "one more round".\nStep 3: it is now 3 AM.\n\nYou are welcome.','info','Your Friendly Assistant');
  else alertBox('Okay. I will just sit in the corner of your screen.\n\nJudging.','info','Your Friendly Assistant');
}};
APPS.lovecalc={icon:'💘',run(){ egg('love'); alertBox('LOVE CALCULATOR v1.0\n\nCalculating compatibility...\nUsing the scientific method known as FLAMES.','info','Love Calculator'); setTimeout(()=>openApp('flames'),300); }};
APPS.party={icon:'🎉',run(){ egg('party'); confetti(['🍬','🍫','🎉','⭐']); jingle([72,76,79,84,79,84,88,84],.11); alertBox('PARTY.EXE\n\nYou found the party. It has been here since 1998, waiting.','info','PARTY.EXE'); }};
APPS.secretmix={icon:'📼',run(){ egg('mixtape'); const ex=wins.find(x=>x.id==='media'); if(ex) ex.close(); openApp('media',{secret:true}); }};

/* Konami code and the volume icon */
function initSecrets(){
  const code=['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a']; let buf=[];
  document.addEventListener('keydown',e=>{
    if(e.target&&['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
    buf.push(e.key.toLowerCase()); buf=buf.slice(-10);
    if(buf.join()===code.join()){ buf=[]; confetti(CANDIES.filter(c=>!c.secret).map(()=>'🍬')); jingle([60,60,67,67,69,69,67,0,65,65,64,64,62,62,60],.1,'triangle'); egg('konami'); alertBox('↑ ↑ ↓ ↓ ← → ← → B A\n\n30 extra lives! (They do nothing here.)\n\nYou are a person of culture.','info','Cheat activated'); }
  });
  let n=0,t=0; const vol=$('.trayr span[title=Volume]'); vol.style.cursor='default';
  vol.onclick=()=>{ const now=Date.now(); n=now-t>4000?1:n+1; t=now; if(n>=5){ n=0; jingle([79,76,72,76,79,84],.09,'sine'); egg('volume'); alertBox('You found the Volume Secret.\n\nThis speaker was never connected to anything.','info','Volume Control'); } };
  updateEggUI();
}
