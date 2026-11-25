// ===== Calculator, Paint, Minesweeper, Solitaire =====
const aboutMenu=(name,text)=>({label:'Help',items:[[`About ${name}`,()=>alertBox(text,'info',`About ${name}`)]]});

/* ---------- Calculator ---------- */
APPS.calc={icon:IC.calc,fit:true,single:true,title:'Calculator',
  menu:w=>[{label:'Edit',items:[['Copy',()=>navigator.clipboard&&navigator.clipboard.writeText($('.cd',w.body).textContent)]]},aboutMenu('Calculator','Calculator\nIt adds. It subtracts. It has never once been wrong.')],
  mount(w){
    const keys=[['←','o'],['CE','o'],['C','o'],['√','n'],['%','n'],['MC','o'],['7','n'],['8','n'],['9','n'],['/','o'],['MR','o'],['4','n'],['5','n'],['6','n'],['*','o'],['MS','o'],['1','n'],['2','n'],['3','n'],['-','o'],['M+','o'],['0','n'],['±','n'],['.','n'],['+','o'],['1/x','n'],['=','o']];
    w.body.innerHTML=`<div class="calc"><div class="cd">0</div><div class="ck">${keys.map(k=>`<button class="${k[1]}" data-k="${k[0]}"${k[0]==='='?' style="grid-column:span 4"':''}>${k[0]==='*'?'×':k[0]==='/'?'÷':k[0]}</button>`).join('')}</div></div>`;
    const disp=$('.cd',w.body); let cur='0',acc=null,op=null,fresh=true,mem=0;
    const show=v=>{ disp.textContent=v; };
    const fmt=n=>{ if(!isFinite(n)) return 'Cannot divide by zero.'; return String(+n.toPrecision(12)); };
    const calc=(a,o,b)=>o==='+'?a+b:o==='-'?a-b:o==='*'?a*b:o==='/'?a/b:b;
    const press=k=>{
      if(/^\d$/.test(k)){ cur=fresh||cur==='0'?k:cur+k; fresh=false; show(cur); }
      else if(k==='.'){ if(fresh){cur='0.';fresh=false;} else if(!cur.includes('.')) cur+='.'; show(cur); }
      else if('+-*/'.includes(k)){ if(op&&!fresh){ acc=calc(acc,op,parseFloat(cur)); cur=fmt(acc); show(cur); } else acc=parseFloat(cur); op=k; fresh=true; }
      else if(k==='='){ if(op){ const r=calc(acc,op,parseFloat(cur)); cur=fmt(r); show(cur); op=null; acc=null; fresh=true; if(!isFinite(r)) cur='0'; } }
      else if(k==='C'){ cur='0'; acc=null; op=null; fresh=true; show(cur); }
      else if(k==='CE'){ cur='0'; fresh=true; show(cur); }
      else if(k==='←'){ cur=cur.length>1?cur.slice(0,-1):'0'; show(cur); }
      else if(k==='±'){ if(cur!=='0'){ cur=cur.startsWith('-')?cur.slice(1):'-'+cur; show(cur); } }
      else if(k==='√'){ const v=parseFloat(cur); if(v<0){ show('Invalid input for function.'); } else { cur=fmt(Math.sqrt(v)); show(cur); fresh=true; } }
      else if(k==='%'){ cur=fmt(parseFloat(cur)/100*(acc??0)); show(cur); fresh=true; }
      else if(k==='1/x'){ cur=fmt(1/parseFloat(cur)); show(cur); fresh=true; if(cur.startsWith('Cannot')) cur='0'; }
      else if(k==='MC') mem=0; else if(k==='MR'){ cur=fmt(mem); fresh=true; show(cur); } else if(k==='MS') mem=parseFloat(cur); else if(k==='M+') mem+=parseFloat(cur);
    };
    w.body.onclick=e=>{ const b=e.target.closest('button'); if(b) press(b.dataset.k); };
    const onKey=e=>{ if(active!==w) return; const k=e.key; if(/^[\d.+\-*/]$/.test(k)) press(k); else if(k==='Enter'||k==='=') press('='); else if(k==='Backspace') press('←'); else if(k==='Escape') press('C'); else return; e.preventDefault(); };
    document.addEventListener('keydown',onKey); return ()=>document.removeEventListener('keydown',onKey);
  }};

/* ---------- Paint ---------- */
const PAL=['#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080','#808040','#004040','#0080ff','#004080','#8000ff','#804000','#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ffff80','#00ff80','#80ffff','#8080ff','#ff0080','#ff8040'];
APPS.paint={icon:IC.paint,wh:[620,480],single:false,title:'untitled - Paint',
  menu:w=>[{label:'File',items:[['New',()=>w.pt.clear()],['Save (download PNG)',()=>w.pt.save()],'-',['Exit',()=>w.close()]]},{label:'Edit',items:[['Clear Image',()=>w.pt.clear()]]},aboutMenu('Paint','Paint\nMake a masterpiece. Or a smiley face with a very long nose.')],
  mount(w){
    const TOOLS=[['✏️','pencil'],['🖌️','brush'],['🧽','eraser'],['🪣','fill'],['🧴','spray'],['╱','line'],['▭','rect'],['⬭','ellipse']];
    w.body.innerHTML=`<div class="pt"><div class="tools">${TOOLS.map((t,i)=>`<button data-t="${t[1]}" title="${t[1]}" class="${i===0?'on':''}">${t[0]}</button>`).join('')}<select id="sz" style="grid-column:1/3;padding:1px"><option value="1">1px</option><option value="3">3px</option><option value="6">6px</option><option value="12">12px</option></select></div><div class="cv"><canvas width="520" height="340"></canvas></div><div class="pal"><div class="pcur"><i id="bg" style="right:3px;bottom:3px;background:#fff"></i><i id="fg" style="left:3px;top:3px;background:#000"></i></div><div class="pcols">${PAL.map(c=>`<i data-c="${c}" style="background:${c}"></i>`).join('')}</div></div></div>`;
    const cv=$('canvas',w.body), g=cv.getContext('2d'); let tool='pencil', fg='#000000', bg='#ffffff', size=1;
    const clear=()=>{ g.fillStyle='#fff'; g.fillRect(0,0,cv.width,cv.height); }; clear();
    w.pt={clear,save(){ const a=document.createElement('a'); a.download='untitled.png'; a.href=cv.toDataURL(); a.click(); }};
    $('.tools',w.body).onclick=e=>{ const b=e.target.closest('button[data-t]'); if(!b) return; tool=b.dataset.t; $$('.tools button',w.body).forEach(x=>x.classList.toggle('on',x===b)); };
    $('#sz',w.body).onchange=e=>size=+e.target.value;
    const setC=(c,right)=>{ if(right){ bg=c; $('#bg',w.body).style.background=c; } else { fg=c; $('#fg',w.body).style.background=c; } };
    $$('.pcols i',w.body).forEach(i=>{ i.onclick=()=>setC(i.dataset.c,false); i.oncontextmenu=e=>{ e.preventDefault(); setC(i.dataset.c,true); }; });
    const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
    function flood(x,y,col){
      x|=0; y|=0; const img=g.getImageData(0,0,cv.width,cv.height), d=img.data, W=cv.width, H=cv.height, i0=(y*W+x)*4, t=[d[i0],d[i0+1],d[i0+2]], n=hex(col);
      if(t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]) return; const st=[[x,y]];
      while(st.length){ const [px,py]=st.pop(); if(px<0||py<0||px>=W||py>=H) continue; const i=(py*W+px)*4; if(d[i]!==t[0]||d[i+1]!==t[1]||d[i+2]!==t[2]) continue; d[i]=n[0]; d[i+1]=n[1]; d[i+2]=n[2]; d[i+3]=255; st.push([px+1,py],[px-1,py],[px,py+1],[px,py-1]); }
      g.putImageData(img,0,0);
    }
    let down=false, snap=null, sx=0, sy=0, lx=0, ly=0, col=fg, sprayT=null;
    const pos=e=>{ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height]; };
    const stroke=(a,b,c,wd)=>{ g.strokeStyle=c; g.lineWidth=wd; g.lineCap='round'; g.beginPath(); g.moveTo(a[0],a[1]); g.lineTo(b[0],b[1]); g.stroke(); };
    const shape=(x,y)=>{ g.putImageData(snap,0,0); g.strokeStyle=col; g.lineWidth=size; g.lineCap='round';
      if(tool==='line'){ g.beginPath(); g.moveTo(sx,sy); g.lineTo(x,y); g.stroke(); }
      else if(tool==='rect'){ g.strokeRect(sx,sy,x-sx,y-sy); }
      else { g.beginPath(); g.ellipse((sx+x)/2,(sy+y)/2,Math.abs(x-sx)/2,Math.abs(y-sy)/2,0,0,7); g.stroke(); } };
    const spray=(x,y)=>{ g.fillStyle=col; for(let i=0;i<14;i++){ const a=Math.random()*7, r=Math.random()*size*2.5+3; g.fillRect(x+Math.cos(a)*r,y+Math.sin(a)*r,1,1); } };
    cv.addEventListener('pointerdown',e=>{
      e.preventDefault(); cv.setPointerCapture(e.pointerId); const [x,y]=pos(e); col=e.button===2?bg:fg; sx=lx=x; sy=ly=y;
      if(tool==='fill'){ flood(x,y,col); return; }
      down=true; snap=g.getImageData(0,0,cv.width,cv.height);
      if(tool==='pencil'||tool==='brush'){ stroke([x,y],[x,y],col,tool==='brush'?Math.max(size,4):size); }
      else if(tool==='eraser'){ g.fillStyle=bg; g.fillRect(x-size*1.5,y-size*1.5,size*3+2,size*3+2); }
      else if(tool==='spray'){ spray(x,y); sprayT=setInterval(()=>spray(lx,ly),30); }
    });
    cv.addEventListener('pointermove',e=>{
      const [x,y]=pos(e); $('.status span',w.el)&&0; if(!down) return;
      if(tool==='pencil'||tool==='brush') stroke([lx,ly],[x,y],col,tool==='brush'?Math.max(size,4):size);
      else if(tool==='eraser'){ const n=Math.ceil(Math.hypot(x-lx,y-ly)/2)+1; g.fillStyle=bg; for(let i=0;i<=n;i++){ g.fillRect(lx+(x-lx)*i/n-size*1.5,ly+(y-ly)*i/n-size*1.5,size*3+2,size*3+2); } }
      else if(tool==='spray'){ spray(x,y); }
      else shape(x,y);
      lx=x; ly=y;
    });
    const end=()=>{ down=false; clearInterval(sprayT); };
    cv.addEventListener('pointerup',end); cv.addEventListener('pointercancel',end); cv.addEventListener('contextmenu',e=>e.preventDefault());
    return ()=>clearInterval(sprayT);
  }};

/* ---------- Minesweeper ---------- */
const MLV={b:[9,9,10],i:[16,16,40],e:[30,16,99]};
APPS.mines={icon:IC.mines,wh:[230,330],single:true,title:'Minesweeper',
  menu:w=>[{label:'Game',items:[['New',()=>w.mw.reset(),{key:'F2'}],'-',['Beginner',()=>w.mw.lvl('b'),{check:w.mw&&w.mw.l==='b'}],['Intermediate',()=>w.mw.lvl('i'),{check:w.mw&&w.mw.l==='i'}],['Expert',()=>w.mw.lvl('e'),{check:w.mw&&w.mw.l==='e'}],'-',['Exit',()=>w.close()]]},
    aboutMenu('Minesweeper','Minesweeper\nLeft-click to dig. Right-click (or long-press, or Shift-click) to flag. Click a number to chord.\n\nNo actual mines were harmed.')],
  mount(w){
    const {daily,dseed}=takeDaily('mines-i'); let dailyOn=daily, run=null, log=[], ready=false; const mw=w.mw={l:daily?'i':(store.get('mine-lv')||'b')}; let C,R,M,cells,over,started,flags,secs,timer,opened;
    let cs=coarse?24:16;
    w.body.innerHTML=`<div class="mw"><div class="mhd"><div class="led" id="ml">010</div><button class="face" id="fc">🙂</button><div class="led" id="mt">000</div></div><div class="mg" id="mg" style="--cs:${cs}px"></div></div>`;
    const g=$('#mg',w.body), face=$('#fc',w.body), ml=$('#ml',w.body), mt=$('#mt',w.body);
    const pad=n=>String(Math.max(-99,Math.min(999,n))).padStart(3,'0').replace(/^-0/,'-0');
    const nb=i=>{ const x=i%C,y=(i/C)|0,o=[]; for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){ if(!dx&&!dy) continue; const a=x+dx,b=y+dy; if(a>=0&&b>=0&&a<C&&b<R) o.push(b*C+a); } return o; };
    mw.reset=()=>{
      clearInterval(timer); ready=false; log=[]; const rn=run=Run.begin('mines-'+mw.l); rn.ready.then(()=>{ if(run===rn) ready=true; }); [C,R,M]=MLV[mw.l]; cells=Array.from({length:R*C},()=>({m:0,o:0,f:0,n:0})); over=false; started=false; flags=0; secs=0; opened=0;
      g.style.setProperty('--c',C); g.innerHTML=cells.map((_,i)=>`<div class="cl" data-i="${i}"></div>`).join(''); face.textContent='🙂'; ml.textContent=pad(M); mt.textContent='000';
    };
    /* the window can be dragged bigger or maximised: tiles scale to fill it */
    const fitCells=()=>{ const bw=w.body.clientWidth-24, bh=w.body.clientHeight-64; if(bw<60||bh<60||!C) return; cs=Math.max(14,Math.min(80,Math.floor(Math.min(bw/C,bh/R)))); g.style.setProperty('--cs',cs+'px'); };
    const sizeWin=()=>{ const base=coarse?24:16; cs=base; g.style.setProperty('--cs',base+'px'); const b=w.body, dx=w.el.offsetWidth-b.clientWidth, dy=w.el.offsetHeight-b.clientHeight; w.el.style.width=Math.min(innerWidth-6,C*base+6+24+dx)+'px'; w.el.style.height=Math.min(innerHeight-40,R*base+6+64+dy)+'px'; };
    const ro=window.ResizeObserver?new ResizeObserver(fitCells):null; if(ro) ro.observe(w.body);
    mw.lvl=l=>{ dailyOn=false; mw.l=l; store.set('mine-lv',l); mw.reset(); sizeWin(); };
    const paint=i=>{ const c=cells[i], el=g.children[i]; el.className='cl'; el.textContent='';
      if(c.o){ el.classList.add('op'); if(c.m){ el.textContent='💣'; } else if(c.n){ el.textContent=c.n; el.classList.add('n'+c.n); } }
      else if(c.f) el.textContent='🚩'; };
    const lose=i=>{ over=true; clearInterval(timer); face.textContent='😵'; cells.forEach((c,k)=>{ if(c.m&&!c.f){ c.o=1; paint(k); } else if(!c.m&&c.f){ g.children[k].textContent='❌'; } }); g.children[i].classList.add('bm'); };
    const win=()=>{ over=true; clearInterval(timer); face.textContent='😎'; cells.forEach((c,k)=>{ if(c.m&&!c.f){ c.f=1; paint(k); } }); ml.textContent=pad(0); postScore('mines-'+mw.l,Math.max(1,secs),{daily:dailyOn&&mw.l==='i',reward:true,run,log}); };
    const reveal=i=>{
      const st=[i];
      while(st.length){ const k=st.pop(), c=cells[k]; if(c.o||c.f) continue; c.o=1; opened++; paint(k); if(!c.n&&!c.m) nb(k).forEach(j=>!cells[j].o&&st.push(j)); }
    };
    const start=i=>{
      started=true; const mm=SIM.mineSet(dailyOn?dseed:run.seed,R*C,M,i); cells.forEach((c,k)=>c.m=mm[k]);
      cells.forEach((c,k)=>c.n=nb(k).filter(j=>cells[j].m).length);
      timer=setInterval(()=>{ secs++; mt.textContent=pad(secs); },1000);
    };
    const left=i=>{
      if(over||!ready) return; log.push([Math.round(performance.now()),'l',i]); const c=cells[i];
      if(c.o&&c.n){ const fl=nb(i).filter(j=>cells[j].f).length; if(fl===c.n) nb(i).forEach(j=>{ if(!cells[j].f&&!cells[j].o){ if(cells[j].m){ lose(j); } else reveal(j); } }); }
      else if(!c.o&&!c.f){ if(!started) start(i); if(c.m){ c.o=1; paint(i); lose(i); return; } reveal(i); }
      if(!over&&opened===R*C-M) win();
    };
    const flag=i=>{ if(over||!ready||cells[i].o) return; log.push([Math.round(performance.now()),'f',i]); const c=cells[i]; c.f=c.f?0:1; flags+=c.f?1:-1; paint(i); ml.textContent=pad(M-flags); };
    let lp=0,lpT;
    const idx=e=>{ const t=e.target.closest('.cl'); return t?+t.dataset.i:-1; };
    g.onpointerdown=e=>{ if(e.pointerType==='touch'){ const i=idx(e); lpT=setTimeout(()=>{ lp=1; if(i>=0) flag(i); },450); } };
    g.onpointerup=g.onpointerleave=()=>clearTimeout(lpT);
    g.onclick=e=>{ if(lp){ lp=0; return; } const i=idx(e); if(i<0) return; e.shiftKey?flag(i):left(i); };
    g.oncontextmenu=e=>{ e.preventDefault(); const i=idx(e); if(i>=0) flag(i); };
    face.onclick=mw.reset;
    const onKey=e=>{ if(active===w&&e.key==='F2'){ e.preventDefault(); mw.reset(); } };
    document.addEventListener('keydown',onKey);
    mw.reset(); sizeWin(); return ()=>{ clearInterval(timer); if(ro) ro.disconnect(); document.removeEventListener('keydown',onKey); };
  }};

/* ---------- Solitaire (Klondike, draw 1) ---------- */
APPS.sol={icon:IC.sol,wh:[600,500],single:true,title:'Solitaire',status:true,
  menu:w=>[{label:'Game',items:[['Deal',()=>w.sl.deal(),{key:'F2'}],'-',['Exit',()=>w.close()]]},aboutMenu('Solitaire','Solitaire\nClick a card, then click where it should go. Double-click sends a card to the foundations. Click the deck to draw.')],
  mount(w){
    const SU=['♠','♥','♦','♣'], RK=['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    w.body.innerHTML='<div class="sol"></div>'; const box=$('.sol',w.body);
    let stock,waste,found,tab,sel,moves; const sl=w.sl={};
    const red=c=>c.s===1||c.s===2;
    sl.deal=()=>{
      const d=[]; for(let s=0;s<4;s++)for(let r=1;r<=13;r++) d.push({s,r,up:false});
      for(let i=d.length-1;i>0;i--){ const j=rnd(i+1); [d[i],d[j]]=[d[j],d[i]]; }
      tab=Array.from({length:7},()=>[]); for(let i=0;i<7;i++)for(let j=0;j<=i;j++){ const c=d.pop(); c.up=j===i; tab[i].push(c); }
      stock=d; waste=[]; found=[[],[],[],[]]; sel=null; moves=0; draw();
    };
    const pile=p=>p[0]==='t'?tab[+p.slice(1)]:p[0]==='f'?found[+p.slice(1)]:p==='w'?waste:stock;
    function draw(){
      box.innerHTML=''; const X=i=>10+i*76, Y2=110;
      const slot=(x,y,id,txt='')=>{ const e=mk('div','slot',txt); e.style.left=x+'px'; e.style.top=y+'px'; e.dataset.p=id; box.appendChild(e); };
      slot(X(0),10,'s',stock.length?'':'↺'); slot(X(1),10,'w'); for(let i=0;i<4;i++) slot(X(3+i),10,'f'+i,SU[i]); for(let i=0;i<7;i++) slot(X(i),Y2,'t'+i);
      const card=(c,x,y,id,idx)=>{
        const e=mk('div','card'+(red(c)?' r':'')+(c.up?'':' dn')+(sel&&sel.p===id&&idx>=sel.i?' sel':''),`${RK[c.r]}${SU[c.s]}<i>${SU[c.s]}</i>`);
        e.style.left=x+'px'; e.style.top=y+'px'; e.style.zIndex=idx+1; e.dataset.p=id; e.dataset.i=idx; box.appendChild(e);
      };
      stock.forEach((c,i)=>i>stock.length-2&&card(c,X(0),10,'s',i));
      waste.forEach((c,i)=>{ c.up=true; i>waste.length-2&&card(c,X(1),10,'w',i); });
      found.forEach((p,k)=>p.forEach((c,i)=>i>p.length-2&&card(c,X(3+k),10,'f'+k,i)));
      tab.forEach((p,k)=>{ let y=Y2; p.forEach((c,i)=>{ card(c,X(k),y,'t'+k,i); y+=c.up?20:7; }); });
      w.setStatus(`Moves: ${moves}`);
      if(found.every(p=>p.length===13)){ w.setStatus('You win!'); celebrate(); }
    }
    const canTab=(c,t)=>t.length?(t[t.length-1].up&&t[t.length-1].r===c.r+1&&red(t[t.length-1])!==red(c)):c.r===13;
    const canFound=(c,f)=>f.length?(f[f.length-1].s===c.s&&f[f.length-1].r===c.r-1):c.r===1;
    function tryMove(to){
      const from=pile(sel.p), cards=from.slice(sel.i), c=cards[0], dst=pile(to);
      if(to[0]==='t'&&canTab(c,dst)){ from.splice(sel.i); dst.push(...cards); }
      else if(to[0]==='f'&&cards.length===1&&canFound(c,dst)){ from.pop(); dst.push(c); }
      else return false;
      if(sel.p[0]==='t'&&from.length&&!from[from.length-1].up) from[from.length-1].up=true;
      moves++; sel=null; return true;
    }
    box.onclick=e=>{
      const t=e.target.closest('[data-p]'); if(!t) { sel=null; draw(); return; }
      const p=t.dataset.p, i=t.dataset.i===undefined?-1:+t.dataset.i;
      if(p==='s'){ if(stock.length){ const c=stock.pop(); c.up=true; waste.push(c); } else { stock=waste.reverse(); stock.forEach(c=>c.up=false); waste=[]; } moves++; sel=null; return draw(); }
      if(sel){
        if(sel.p===p&&sel.i===i){ sel=null; return draw(); }
        if(p[0]!=='w'&&tryMove(p)) return draw();
      }
      const pl=pile(p);
      if(i>=0&&pl[i].up&&(p==='w'?i===pl.length-1:p[0]==='f'?i===pl.length-1:true)) sel={p,i};
      else if(i>=0&&p[0]==='t'&&i===pl.length-1&&!pl[i].up){ pl[i].up=true; sel=null; moves++; }
      else sel=null;
      draw();
    };
    box.ondblclick=e=>{
      const t=e.target.closest('.card'); if(!t) return; const p=t.dataset.p, pl=pile(p), i=+t.dataset.i;
      if(p==='s'||i!==pl.length-1||!pl[i].up) return;
      for(let k=0;k<4;k++) if(canFound(pl[i],found[k])){ sel={p,i}; tryMove('f'+k); break; }
      draw();
    };
    const onKey=e=>{ if(active===w&&e.key==='F2'){ e.preventDefault(); sl.deal(); } };
    document.addEventListener('keydown',onKey); sl.deal(); return ()=>document.removeEventListener('keydown',onKey);
  }};
