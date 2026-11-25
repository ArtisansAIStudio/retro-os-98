// ===== Core: utils, window manager, menus, dialogs, taskbar, boot =====
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms)), rnd=n=>Math.floor(Math.random()*n), pick=a=>a[rnd(a.length)];
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mk=(tag,cls,html)=>{const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e;};
const IC={computer:'🖥️',folder:'📁',doc:'📄',notepad:'📝',paint:'🎨',calc:'🧮',mines:'💣',sol:'🃏',ie:'🌐',dos:'⬛',bin:'🗑️',control:'⚙️',floppy:'💾',cd:'💿',hdd:'🗄️',sweets:'🍬',display:'🖼️',clock:'🕒',sys:'💻',help:'❓',run:'🏃',find:'🔍',printer:'🖨️',power:'🔌',home:'🏠',star:'⭐'};
const DLG_IC={info:'ℹ️',warn:'⚠️',err:'❌',q:'❓'};
const APPS={};
const desktop=$('#desktop'), tasksEl=$('#tasks');
let wins=[], active=null, zTop=100;

/* ---------- windows ---------- */
function openApp(id,args={}){
  const A=APPS[id]; if(!A) return null;
  if(A.run){ A.run(args); return null; }
  if(A.single){ const ex=wins.find(w=>w.id===id); if(ex){ if(ex.min) toggleMin(ex,false); focusWin(ex); return ex; } }
  const small=innerWidth<700, [aw,ah]=A.wh||[A.w||480,A.h||340];
  const el=mk('div','win'), n=wins.length%8;
  el.style.left=small?'0px':(40+n*26)+'px'; el.style.top=small?'0px':(20+n*26)+'px';
  if(A.fit) el.style.width='max-content'; else { el.style.width=Math.min(aw,innerWidth-6)+'px'; el.style.height=Math.min(ah,innerHeight-40)+'px'; }
  el.innerHTML=`<div class="tbar"><span class="ti"></span><span class="tt"></span><button class="tbn min" title="Minimize">_</button>${A.fit?'':'<button class="tbn max" title="Maximize">□</button>'}<button class="tbn cls" title="Close">✕</button></div>${A.menu?'<div class="menubar"></div>':''}<div class="wbody${A.pad?' pad':''}${A.col?' col':''}"></div>${A.status?'<div class="status"><span></span><span class="s2"></span></div>':''}${A.fit?'':'<div class="grip"></div>'}`;
  const w={id,el,A,args,body:$('.wbody',el),min:false,max:false,offs:[],cleanup:null};
  w.setTitle=t=>{ w.title=t; $('.tt',el).textContent=t; if(w.btn) $('.tkt',w.btn).textContent=t; };
  w.setStatus=(t,i=0)=>{ const s=$$('.status span',el)[i]; if(s) s.textContent=t; };
  w.close=()=>closeWin(w);
  $('.ti',el).textContent=A.icon;
  desktop.appendChild(el); wins.push(w);
  w.btn=mk('button','tk',`<span>${A.icon}</span> <span class="tkt"></span>`); tasksEl.appendChild(w.btn);
  w.btn.onclick=()=>{ if(w.min) toggleMin(w,false); else if(active===w) toggleMin(w,true); else focusWin(w); };
  w.setTitle(typeof A.title==='function'?A.title(args):A.title);
  if(A.menu) buildMenubar(w,()=>A.menu(w));
  wireWindow(w);
  focusWin(w);
  w.cleanup=A.mount(w,args)||null;
  if(small&&!A.fit) toggleMax(w);
  return w;
}
function wireWindow(w){
  const el=w.el, tbar=$('.tbar',el);
  el.addEventListener('pointerdown',()=>{ if(active!==w) focusWin(w); },true);
  tbar.addEventListener('pointerdown',e=>{
    if(e.target.closest('.tbn')||w.max) return;
    const r=el.getBoundingClientRect(), dx=e.clientX-r.left, dy=e.clientY-r.top;
    tbar.setPointerCapture(e.pointerId);
    const mv=ev=>{ el.style.left=Math.max(-r.width+80,Math.min(innerWidth-60,ev.clientX-dx))+'px'; el.style.top=Math.max(0,Math.min(innerHeight-60,ev.clientY-dy))+'px'; };
    const up=()=>{ tbar.removeEventListener('pointermove',mv); tbar.removeEventListener('pointerup',up); };
    tbar.addEventListener('pointermove',mv); tbar.addEventListener('pointerup',up);
  });
  const grip=$('.grip',el);
  if(grip) grip.addEventListener('pointerdown',e=>{
    e.preventDefault(); const r=el.getBoundingClientRect(); grip.setPointerCapture(e.pointerId);
    const mv=ev=>{ el.style.width=Math.max(160,ev.clientX-r.left+6)+'px'; el.style.height=Math.max(100,ev.clientY-r.top+6)+'px'; };
    const up=()=>{ grip.removeEventListener('pointermove',mv); grip.removeEventListener('pointerup',up); };
    grip.addEventListener('pointermove',mv); grip.addEventListener('pointerup',up);
  });
  $('.min',el).onclick=()=>toggleMin(w,true);
  const mx=$('.max',el); if(mx){ mx.onclick=()=>toggleMax(w); tbar.ondblclick=e=>{ if(!e.target.closest('.tbn')) toggleMax(w); }; }
  $('.cls',el).onclick=()=>closeWin(w);
}
function focusWin(w){
  active=w; w.el.style.zIndex=++zTop;
  wins.forEach(x=>{ x.el.classList.toggle('active',x===w); x.btn.classList.toggle('on',x===w&&!x.min); });
}
function topVisible(){ return wins.filter(x=>!x.min).sort((a,b)=>b.el.style.zIndex-a.el.style.zIndex)[0]; }
function toggleMin(w,m){
  w.min=m; w.el.style.display=m?'none':'';
  if(m){ w.btn.classList.remove('on'); w.el.classList.remove('active'); if(active===w){ active=null; const n=topVisible(); if(n) focusWin(n); } }
  else focusWin(w);
}
function toggleMax(w){ w.max=!w.max; w.el.classList.toggle('maxed',w.max); }
function closeWin(w){
  try{ w.cleanup&&w.cleanup(); }catch(e){ console.error(e); }
  w.offs.forEach(f=>f()); w.el.remove(); w.btn.remove(); wins=wins.filter(x=>x!==w);
  if(active===w){ active=null; const n=topVisible(); if(n) focusWin(n); }
}
const closeAllWindows=()=>[...wins].forEach(closeWin);

/* ---------- menubar (File Edit Help...) ---------- */
function buildMenubar(w,getMenus){
  const bar=$('.menubar',w.el); let open=null;
  const closeAll=()=>{ $$('.dd',bar).forEach(d=>d.remove()); $$(':scope>span',bar).forEach(s=>s.classList.remove('on')); open=null; };
  getMenus().forEach((m0,mi)=>{
    const s=mk('span','',esc(m0.label)); bar.appendChild(s);
    const show=()=>{
      closeAll(); s.classList.add('on'); open=s;
      const m=getMenus()[mi], dd=mk('div','dd'); dd.style.left=s.offsetLeft+'px';
      m.items.forEach(it=>{
        if(it==='-'){ dd.appendChild(mk('hr')); return; }
        const [label,fn,opt={}]=it;
        const row=mk('div',opt.disabled?'dis':'',`${opt.check?'<b>✓</b>':''}<span>${esc(label)}</span><span class="k">${opt.key||''}</span>`);
        row.onclick=ev=>{ ev.stopPropagation(); closeAll(); if(!opt.disabled&&fn) fn(w); };
        dd.appendChild(row);
      });
      bar.appendChild(dd);
    };
    s.onclick=ev=>{ ev.stopPropagation(); open===s?closeAll():show(); };
    s.onmouseenter=()=>{ if(open&&open!==s) show(); };
  });
  const off=e=>{ if(!bar.contains(e.target)) closeAll(); };
  document.addEventListener('pointerdown',off); w.offs.push(()=>document.removeEventListener('pointerdown',off));
}

/* ---------- dialogs ---------- */
function dialog({title='Basement',body='',icon,buttons=['OK'],width=340,cancel=null}){
  let dEl, fin;
  const p=new Promise(resolve=>{
    const ov=mk('div','modal'), d=mk('div','win dlg active'); dEl=d;
    d.style.width=Math.min(width,innerWidth-10)+'px';
    d.innerHTML=`<div class="tbar"><span class="tt"></span><button class="tbn cls">✕</button></div><div class="dbody">${icon?`<div class="dic">${DLG_IC[icon]}</div>`:''}<div class="dtx"></div></div><div class="dbtn"></div>`;
    $('.tt',d).textContent=title;
    const tx=$('.dtx',d); typeof body==='string'?tx.innerHTML=body:tx.appendChild(body);
    const key=e=>{
      if(e.key==='Escape'){ e.stopPropagation(); fin(cancel); }
      else if(e.key==='Enter'&&e.target.tagName!=='BUTTON'){ e.stopPropagation(); fin(buttons[0]); }
    };
    fin=b=>{ ov.remove(); document.removeEventListener('keydown',key,true); resolve({btn:b,el:d}); };
    buttons.forEach((b,i)=>{ const bt=mk('button',i===0?'def':'',esc(b)); bt.onclick=()=>fin(b); $('.dbtn',d).appendChild(bt); });
    $('.cls',d).onclick=()=>fin(cancel);
    document.addEventListener('keydown',key,true);
    ov.appendChild(d); document.body.appendChild(ov);
    ($('input,select',d)||$('button',d)).focus();
  });
  p.el=dEl; p.close=()=>fin(null);
  return p;
}
const alertBox=(text,icon='info',title='Basement')=>dialog({title,icon,body:esc(text).replace(/\n/g,'<br>')});
const FOLD_ERR='This control panel item is not available in this version of Basement 98.\n\n(It never really worked anyway.)';

/* ---------- menu trees (start menu, context menu) ---------- */
function closeMenus(){ $('#smenu').hidden=true; $('#ctx').hidden=true; $('#start').classList.remove('on'); }
const menuOrder=()=>{ try{ return JSON.parse(store.get('menuorder98')||'{}'); }catch(e){ return {}; } };
let dragLi=null;
function menuTree(items,key=null,reorder=false){
  const saved=reorder&&key!==null?menuOrder()[key]:null;
  if(saved){ const by=new Map(items.filter(i=>!i.sep).map(i=>[i.label,i])), out=[]; saved.forEach(t=>{ if(t==='--') out.push({sep:1}); else if(by.has(t)){ out.push(by.get(t)); by.delete(t); } }); by.forEach(v=>out.push(v)); items=out; }
  const ul=mk('ul','ml'), canDrag=reorder&&key!==null;
  items.forEach(it=>{
    if(it.sep){ ul.appendChild(mk('li','sep')); return; }
    const li=mk('li','mi',`<span class="ic">${it.icon||''}</span><span>${esc(it.label)}</span>`); li.dataset.label=it.label;
    if(it.sub){ li.classList.add('hs'); li.appendChild(menuTree(typeof it.sub==='function'?it.sub():it.sub,(key||'')+'/'+it.label,reorder)); }
    if(canDrag){
      li.draggable=true;
      li.ondragstart=e=>{ e.stopPropagation(); dragLi=li; e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain',it.label); setTimeout(()=>li.style.opacity='.4',0); };
      li.ondragend=e=>{ e.stopPropagation(); li.style.opacity=''; dragLi=null; };
      li.ondragover=e=>{ if(dragLi&&dragLi!==li&&dragLi.parentElement===ul){ e.preventDefault(); e.stopPropagation(); li.style.boxShadow='inset 0 -2px #00f'; } };
      li.ondragleave=()=>{ li.style.boxShadow=''; };
      li.ondrop=e=>{ e.preventDefault(); e.stopPropagation(); li.style.boxShadow=''; if(!dragLi||dragLi===li||dragLi.parentElement!==ul) return;
        const kids=[...ul.children]; kids.indexOf(dragLi)<kids.indexOf(li)?li.after(dragLi):li.before(dragLi);
        const o=menuOrder(); o[key]=[...ul.children].map(k=>k.classList.contains('sep')?'--':k.dataset.label); store.set('menuorder98',JSON.stringify(o)); };
    }
    li.onclick=e=>{
      e.stopPropagation();
      if(it.sub){ [...li.parentElement.children].forEach(s=>s!==li&&s.classList.remove('open')); li.classList.toggle('open'); }
      else { closeMenus(); it.run&&it.run(); }
    };
    ul.appendChild(li);
  });
  return ul;
}
function showCtx(x,y,items){
  closeMenus(); const c=$('#ctx'); c.innerHTML=''; c.appendChild(menuTree(items)); c.hidden=false;
  c.style.left=Math.min(x,innerWidth-190)+'px'; c.style.top=Math.min(y,innerHeight-items.length*26-40)+'px';
}
function startItems(){
  const games=GAMES.map(g=>({label:g.n,icon:g.e,run:()=>openApp(g.id)}));
  const arcade=ARCADE.map(g=>({label:g.n,icon:g.e,run:()=>openApp(g.id)}));
  const docs=Object.keys(fsGet('C:\\My Documents')||{}).slice(0,12).map(n=>({label:n,icon:IC.doc,run:()=>openPath('C:\\My Documents\\'+n)}));
  return [
    {label:'Programs',icon:IC.folder,sub:[
      {label:'Accessories',icon:IC.folder,sub:[
        {label:'Calculator',icon:IC.calc,run:()=>openApp('calc')},{label:'DOS Prompt',icon:IC.dos,run:()=>openApp('dos')},
        {label:'Notepad',icon:IC.notepad,run:()=>openApp('notepad')},{label:'Media Player',icon:'🎵',run:()=>openApp('media')},{label:'Paint',icon:IC.paint,run:()=>openApp('paint')}]},
      {label:'Games',icon:IC.folder,sub:[
        {label:'Minesweeper',icon:IC.mines,run:()=>openApp('mines')},{label:'Solitaire',icon:IC.sol,run:()=>openApp('sol')},{sep:1},...arcade,{sep:1},...games]},
      {label:'NetSurfer',icon:IC.ie,run:()=>openApp('ie')},
      {label:'DOS Prompt',icon:IC.dos,run:()=>openApp('dos')},
      {label:'File Explorer',icon:IC.folder,run:()=>openApp('explorer',{path:'C:'})},
      {label:'My Sweets',icon:IC.sweets,run:()=>openApp('sweets')},
      {label:'Hall of Fame',icon:'🏆',run:()=>openApp('halloffame')}]},
    {label:'Favorites',icon:IC.star,sub:[{label:'Classic Games',icon:IC.folder,run:()=>openApp('explorer',{path:'C:\\Games'})}]},
    {label:'Documents',icon:IC.doc,sub:docs},
    {label:'Settings',icon:IC.control,sub:[
      {label:'Control Panel',icon:IC.control,run:()=>openApp('explorer',{path:'CONTROL'})},
      {label:'Privacy & Cookies',icon:'🔒',run:()=>openApp('privacy')},
      {label:'Printers',icon:IC.printer,run:()=>alertBox('No printers are installed.\n\nYour cousin has the only printer in the building.','info','Printers')},
      {label:'Taskbar & Start Menu...',icon:IC.display,run:async()=>{ const r=await dialog({title:'Taskbar Properties',icon:'info',width:380,buttons:['Reset menu order','Close'],cancel:'Close',body:'The taskbar is staying at the bottom, where it belongs.<br><br><b>Tip:</b> drag items inside the Programs, Accessories and Games menus to put them in your own order.'}); if(r.btn==='Reset menu order'){ store.set('menuorder98','{}'); alertBox('Start menu order reset.','info','Taskbar Properties'); } }}]},
    {label:'Find',icon:IC.find,sub:[{label:'Files or Folders...',icon:IC.find,run:()=>alertBox('Find is not available right now.\n\nTry the last place you left it.','info','Find: All Files')}]},
    {label:'Help',icon:IC.help,run:()=>openApp('help')},
    {label:'Guides & FAQ',icon:'📖',run:()=>window.open('guides.html','_blank','noopener')},
    {label:'Run...',icon:IC.run,run:runDialog},
    {sep:1},
    {label:'Shut Down...',icon:IC.power,run:shutdownDialog}
  ];
}
function toggleStart(){
  const sm=$('#smenu');
  if(!sm.hidden){ closeMenus(); return; }
  closeMenus(); sm.innerHTML='<div class="strip"><span>Basement<b>98</b></span></div>'; sm.appendChild(menuTree(startItems(),null,true));
  sm.hidden=false; $('#start').classList.add('on');
}

/* ---------- Run, shutdown ---------- */
async function runDialog(){
  const r=await dialog({title:'Run',buttons:['OK','Cancel'],width:380,body:'Type the name of a program, folder, or document, and Basement will open it for you.<br><br>Open: <input type="text" id="runin" autocomplete="off" spellcheck="false">'});
  if(r.btn==='OK') runCommand($('#runin',r.el).value.trim());
}
function runCommand(v){
  if(!v) return true;
  const key=v.toLowerCase().replace(/\.exe$|\.com$/,'');
  if(RUNMAP[key]){ const t=RUNMAP[key]; typeof t==='string'?openApp(t):t(); return true; }
  if(fsGet(v)!==undefined && /^[a-z]:/i.test(v)){ openPath(v); return true; }
  alertBox(`Cannot find the file '${v}' (or one of its components). Make sure the path and filename are correct and that all required libraries are available.`,'err',v);
  return false;
}
async function shutdownDialog(){
  const r=await dialog({title:'Shut Down',icon:'q',buttons:['OK','Cancel'],width:360,body:`What do you want the computer to do?<br><br>
    <label><input type="radio" name="sd" value="standby"> Stand by</label><br>
    <label><input type="radio" name="sd" value="off" checked> Shut down</label><br>
    <label><input type="radio" name="sd" value="restart"> Restart</label><br>
    <label><input type="radio" name="sd" value="dos"> Restart in DOS mode</label>`});
  if(r.btn!=='OK') return;
  const v=$('input[name=sd]:checked',r.el).value;
  if(v==='standby') standby(); else if(v==='off') shutdown(); else if(v==='restart') boot(false); else dosMode();
}
function overlay(html){ const b=$('#boot'); b.hidden=false; b.innerHTML=html; return b; }
function standby(){ const b=overlay(''); const wake=()=>{ b.hidden=true; document.removeEventListener('keydown',wake); b.onclick=null; }; b.onclick=wake; setTimeout(()=>document.addEventListener('keydown',wake),300); }
async function shutdown(){
  closeMenus();
  overlay('<div class="splash" style="background:linear-gradient(#1060c0,#6ab0f0)"><div class="logo"><small>Basement is shutting down.</small></div></div>');
  await sleep(1800);
  const b=overlay('<div class="safe">It\'s now safe to turn off<br>your computer.<br><small style="font-size:14px;color:#888;font-weight:400">(click anywhere to power back on)</small></div>');
  b.onclick=()=>boot(true);
}
function dosMode(){
  closeAllWindows(); closeMenus();
  const b=overlay('<div class="dosfull dos"></div>');
  dosMount($('.dosfull',b),{real:true,onWin:()=>boot(false)});
}

/* ---------- boot ---------- */
let bootToken=0;
async function boot(first){
  const token=++bootToken; closeAllWindows(); closeMenus();
  let skip=false; const wait=async ms=>{ const t=Date.now(); while(Date.now()-t<ms&&!skip&&token===bootToken) await sleep(40); };
  const b=overlay(''); b.onclick=()=>{ skip=true; };
  if(first){
    b.innerHTML=`<pre class="bios">BIOS v4.51PG  CPU 233MHz
Memory Test : 65536K OK

Detecting IDE Primary Master ... Hard Disk 1.6GB
Detecting IDE Primary Slave  ... None
Detecting IDE Secondary Master .. CD-ROM 40X

Press DEL to enter SETUP  (don't)
(click to skip)</pre>`;
    await wait(1700);
  }
  if(token!==bootToken) return;
  b.innerHTML=`<div class="splash"><div class="logo"><svg class="flag" width="64" height="64" viewBox="0 0 16 16"><polygon points="8,1 1,8 8,8" fill="#ff4d6d"/><polygon points="8,1 15,8 8,8" fill="#ffd23f"/><polygon points="1,8 8,15 8,8" fill="#3ec5ff"/><polygon points="15,8 8,15 8,8" fill="#7bd88f"/></svg><div>Basement<small> 98</small></div></div><div style="color:#fff;font:italic 22px Arial,sans-serif;text-shadow:2px 2px 0 #0a2a60">No windows down here.</div><div class="pb"><i></i></div></div>`;
  await wait(2800);
  if(token!==bootToken) return;
  b.hidden=true; b.onclick=null; b.innerHTML='';
  if(store.get('welcome')!=='0') openApp('welcome');
}

/* ---------- init (called from main.js) ---------- */
function initShell(){
  $('#start').onclick=e=>{ e.stopPropagation(); toggleStart(); };
  document.addEventListener('pointerdown',e=>{ if(!$('#smenu').contains(e.target)&&!$('#start').contains(e.target)&&!$('#ctx').contains(e.target)) closeMenus(); });
  $('#ql-desk').onclick=()=>{ wins.forEach(w=>{ if(!w.min) toggleMin(w,true); }); };
  $('#ql-ie').onclick=()=>openApp('ie');
  const clk=()=>{ const d=new Date(); $('#clk').textContent=d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}); $('#clk').title=d.toLocaleDateString([],{weekday:'long',year:'numeric',month:'long',day:'numeric'}); };
  clk(); setInterval(clk,10000);
}
