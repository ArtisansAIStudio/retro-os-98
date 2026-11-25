// ===== Filesystem, desktop, Explorer, Notepad, DOS, IE, Control Panel =====
const DEF={'C:':{
  'Basement':{'Desktop':{},'Help':{},'System32':{'CRASH.EXE':'#exe:bsod','HELPER.EXE':'#exe:helper','LOVECALC.EXE':'#exe:lovecalc','readme_first.txt':'You were not supposed to find this folder.\r\n\r\nSince you did:\r\n  CRASH.EXE     - do not run (run it)\r\n  HELPER.EXE    - a helpful assistant\r\n  LOVECALC.EXE  - results may vary\r\n\r\nThere are more things like this on the disk.\r\nLook in the places people hide things.'},'notepad.exe':'#exe:notepad','calc.exe':'#exe:calc','paint.exe':'#exe:paint','mines.exe':'#exe:mines','sol.exe':'#exe:sol','explorer.exe':'#exe:explorer','upstairs.com':'#exe:welcome','mplayer2.exe':'#exe:media'},
  'My Documents':{
    'Love Letter.txt':'Dear Rani,\r\n\r\nI have calculated our FLAMES 47 times.\r\nIt says F every time.\r\nI am choosing to ignore that.\r\n\r\n- Raj',
    'Mixtape Tracklist.txt':'SIDE A\r\n1. Chaiyya Chaiyya\r\n2. Pehla Nasha\r\n3. Wannabe\r\n4. I Want It That Way\r\n\r\nSIDE B\r\n1. Macarena (do NOT tell anyone)\r\n2. Mmmbop\r\n3. Baby One More Time\r\n4. Tujhe Dekha Toh\r\n\r\n(recorded off the radio, the first 4 seconds of every song are missing)',
    'Homework (DO NOT OPEN).txt':'Maths: ex 4.3 Q1-10\r\nScience: draw the human heart (labelled)\r\nHindi: nibandh - Meri Pehli Railyatra\r\n\r\nStatus: copied from Rohan in the bus.',
    'Pocket Money.txt':'Mon  Rs 5   Choco eclairs x2, toffee x1\r\nTue  Rs 2   Orange candy\r\nWed  Rs 0   (spent on Tuesday)\r\nThu  Rs 10  cricket cards\r\nFri  Rs 5   Glucose biscuits, the good kind',
    'Private':{'Secret Crush List.txt':'MY SECRET CRUSH LIST (1998)\r\n\r\n1. [REDACTED]\r\n2. [REDACTED]\r\n3. The girl from tuition. [REDACTED]\r\n4. Whoever is on the cover of this month\'s cricket magazine\r\n\r\nNote to self: do NOT leave this on the family computer.','Time Capsule.txt':'TIME CAPSULE\r\nWritten: 14 March 1999\r\nTo be opened: {{year}}\r\n\r\nDear me from {{year}},\r\n\r\nI hope there are flying cars. I hope you still play cricket in the lane.\r\nI hope you remember Sunday mornings and the sound of the shutters.\r\nI hope you did not become boring.\r\n\r\nIt is {{date}} where you are.\r\nIf you are reading this, you still have time to call your old friends.\r\n\r\n- You, aged 12','secret_mixtape.wav':'#exe:secretmix','PARTY.EXE':'#exe:party'},
    'To Do.txt':'1. Return Rohan\'s cassette\r\n2. Finish level 8 (the hard one)\r\n3. Be home before the streetlights come on'},
  'Program Files':{'NetSurfer':{'netsurf.exe':'#exe:ie'},'Accessories':{'paint.exe':'#exe:paint','textpad.exe':'#exe:notepad'}},
  'Games':{},
  'Recycled':{'Ex Number.txt':'Deleted.\r\nUn-deleted.\r\nDeleted again.\r\n\r\n(I know it by heart anyway.)','Myspace Password.txt':'password123\r\n\r\nTom is still my friend, if you were wondering.','Resignation Letter v14.txt':'Dear Sir,\r\n\r\nI would like to quit.\r\n\r\nSorry, draft 14. Never sent. Do not send.','Copy of Copy of Homework.doc':'x','Floppy Disk 1 of 47.zip':'x'},
  'autoexec.bat':'@echo off\r\nPATH C:\\BASEMENT;C:\\BASEMENT\\COMMAND\r\nSET SOUND=A220 I5 D1 T4\r\nLH C:\\BASEMENT\\COMMAND\\CDROM.EXE /D:CD001',
  'config.sys':'DEVICE=C:\\BASEMENT\\MEMORY.SYS\r\nDOS=HIGH,UMB\r\nFILES=40',
  'command.com':'#exe:dos',
  'README.TXT':'BASEMENT 98 - THE FAN-MADE ONE\r\n=============================\r\n\r\nThis is a tribute built from scratch in JavaScript,\r\ninspired by the desktops of the late 90s.\r\nAll code, icons and sounds are original.\r\nNot affiliated with any company.\r\n\r\nThe games in C:\\GAMES are original lookalikes of the\r\nclassics we all played. Win some, collect the sweets.\r\n\r\nSome things on this disk are hidden. Explorer: View > Show Hidden Files. DOS: DIR /A.\r\nCurious people find things.\r\n\r\nEverything runs in your browser. Close the tab and it\'s gone.\r\nExcept your Notepad files and sweets, those stay on this\r\ncomputer (localStorage).'
 },'A:':null,'D:':null};
let FS, USER;
const DRIVES=[['A:','3½ Floppy (A:)',IC.floppy],['C:','(C:)',IC.hdd],['D:','(D:)',IC.cd]];
const RUNMAP={notepad:'notepad',mplayer:'media',mplayer2:'media',wmplayer:'media',winamp:'media',mspaint:'paint',paint:'paint',calc:'calc',winmine:'mines',mines:'mines',minesweeper:'mines',sol:'sol',solitaire:'sol',command:'dos',cmd:'dos',netsurf:'ie',welcome:'welcome',winver:'sysprops',
  explorer:()=>openApp('explorer',{path:'C:'}),control:()=>openApp('explorer',{path:'CONTROL'}),desk:'display'};
function initFS(){
  const games={};
  [...GAMES,...ARCADE].forEach(g=>{ games[g.f]='#exe:'+g.id; RUNMAP[g.id]=g.id; RUNMAP[g.f.toLowerCase().replace(/\.exe$/,'')]=g.id; });
  games['MINES.EXE']='#exe:mines'; games['SOL.EXE']='#exe:sol';
  DEF['C:']['Games']=games;
  FS=JSON.parse(JSON.stringify(DEF)); USER=JSON.parse(store.get('fs98')||'{}');
  for(const [p,v] of Object.entries(USER)) fsApply(p,v);
}
function fsLookup(path){
  const parts=String(path).split(/[\\/]/).filter(Boolean); if(!parts.length) return {v:undefined};
  let cur=FS, real=[];
  for(const part of parts){
    if(cur===null||typeof cur!=='object') return {v:undefined};
    const k=Object.keys(cur).find(k=>k.toLowerCase()===part.toLowerCase()); if(k===undefined) return {v:undefined};
    real.push(k); cur=cur[k];
  }
  return {v:cur,real:real.join('\\')};
}
const fsGet=p=>fsLookup(p).v;
function fsApply(path,val){
  const parts=path.split(/[\\/]/).filter(Boolean); let cur=FS;
  for(let i=0;i<parts.length-1;i++){ const k=Object.keys(cur).find(k=>k.toLowerCase()===parts[i].toLowerCase())||parts[i]; if(cur[k]==null||typeof cur[k]!=='object') cur[k]={}; cur=cur[k]; }
  const last=parts[parts.length-1], k=Object.keys(cur).find(k=>k.toLowerCase()===last.toLowerCase())||last;
  if(val===null) delete cur[k]; else cur[k]=(val&&typeof val==='object')?{}:val;
}
function fsSet(path,val){ fsApply(path,val); USER[path]=val; store.set('fs98',JSON.stringify(USER)); }
function fsDel(path){ fsApply(path,null); USER[path]=null; store.set('fs98',JSON.stringify(USER)); }
const joinP=(p,n)=>p+'\\'+n;
function openPath(path){
  const {v,real}=fsLookup(path), p=real||path, name=p.split('\\').pop();
  if(v===null){ alertBox(`${p}\\ is not accessible.\n\nThe device is not ready.`,'err',p+'\\'); return; }
  if(v===undefined){ alertBox(`Cannot find '${path}'.`,'err','Basement'); return; }
  if(/^c:\\recycled/i.test(p)&&typeof v==='string') egg('bin');
  if(typeof v==='object'){ openApp('explorer',{path:p}); return; }
  if(v.startsWith('#exe:')){ openApp(v.slice(5)); return; }
  if(/\.(txt|bat|sys|ini|log|md|cfg)$/i.test(name)){ openApp('notepad',{path:p}); return; }
  alertBox(`Basement cannot open this file:\n\nFile: ${name}\n\nTo open this file, Basement needs to know what program created it.`,'info','Open With');
}
const HIDDEN=new Set(['c:\\basement\\system32','c:\\my documents\\private']);
const isHidden=p=>HIDDEN.has(p.toLowerCase());
const iconFor=(name,v)=>v&&typeof v==='object'?IC.folder:typeof v==='string'&&v.startsWith('#exe:')?(APPS[v.slice(5)]?.icon||'⚙️'):/\.(bat|sys|com)$/i.test(name)?'⚙️':IC.doc;

/* ---------- desktop ---------- */
const DESK_DIR='C:\\Basement\\Desktop';
function fixedIcons(){ return [
  {n:'My Computer',i:IC.computer,run:()=>openApp('explorer',{path:''})},
  {n:'My Documents',i:IC.folder,run:()=>openApp('explorer',{path:'C:\\My Documents'})},
  {n:'NetSurfer',i:IC.ie,run:()=>openApp('ie')},
  {n:'Recycle Bin',i:IC.bin,run:()=>openApp('explorer',{path:'BIN'})},
  {n:'Hall of Fame',i:'🏆',run:()=>openApp('halloffame')},
  {n:'My Sweets',i:IC.sweets,run:()=>openApp('sweets')},
  {n:'DOS Prompt',i:IC.dos,run:()=>openApp('dos')},
  {n:'Notepad',i:IC.notepad,run:()=>openApp('notepad')},
  {n:'Media Player',i:'🎵',run:()=>openApp('media')},
  {n:'Paint',i:IC.paint,run:()=>openApp('paint')},
  {n:'Calculator',i:IC.calc,run:()=>openApp('calc')},
  {n:'Minesweeper',i:IC.mines,run:()=>openApp('mines')},
  {n:'Solitaire',i:IC.sol,run:()=>openApp('sol')},
  ...GAMES.map(g=>({n:g.n,i:g.e,run:()=>openApp(g.id)})),
  ...ARCADE.map(g=>({n:g.n,i:g.e,run:()=>openApp(g.id)}))]; }
const coarse=matchMedia('(pointer:coarse)').matches;
const IW=80, IH=78, IPAD=6; let ICON_CELLS={}, justDragged=false;
const iconPos=()=>{ try{ return JSON.parse(store.get('iconpos98')||'{}'); }catch(e){ return {}; } };
const iconRows=()=>Math.max(2,Math.floor((desktop.clientHeight-IPAD)/IH));
const placeIcon=(el,p)=>{ el.style.left=(IPAD+p[0]*IW)+'px'; el.style.top=(IPAD+p[1]*IH)+'px'; };
function allIcons(){
  const user=Object.entries(fsGet(DESK_DIR)||{}).map(([n,v])=>({n,i:iconFor(n,v),run:()=>openPath(joinP(DESK_DIR,n)),user:true,path:joinP(DESK_DIR,n)}));
  return [...fixedIcons(),...user];
}
function snapIcon(el,it){
  const rows=iconRows(), occ=new Set(Object.entries(ICON_CELLS).filter(([n])=>n!==it.n).map(([,p])=>p[0]+','+p[1]));
  let c=Math.max(0,Math.round((parseFloat(el.style.left)-IPAD)/IW)), r=Math.max(0,Math.min(rows-1,Math.round((parseFloat(el.style.top)-IPAD)/IH)));
  if(occ.has(c+','+r)){ let best=null; for(let dc=-4;dc<=4;dc++)for(let dr=-rows;dr<=rows;dr++){ const cc=c+dc, rr=r+dr; if(cc<0||rr<0||rr>=rows||occ.has(cc+','+rr)) continue; const d=dc*dc+dr*dr; if(!best||d<best.d) best={c:cc,r:rr,d}; } if(best){ c=best.c; r=best.r; } }
  ICON_CELLS[it.n]=[c,r]; store.set('iconpos98',JSON.stringify(ICON_CELLS)); placeIcon(el,[c,r]);
}
function arrangeIcons(mode){
  const items=allIcons();
  if(mode==='name') items.sort((a,b)=>a.n.localeCompare(b.n));
  else if(mode==='type') items.sort((a,b)=>(a.i===IC.folder?0:1)-(b.i===IC.folder?0:1)||a.n.localeCompare(b.n));
  const rows=iconRows(), cells={}; let c=0,r=0; items.forEach(it=>{ cells[it.n]=[c,r]; if(++r>=rows){ r=0; c++; } });
  store.set('iconpos98',JSON.stringify(mode==='auto'?{}:cells)); renderIcons();
}
function renderIcons(){
  const box=$('#icons'); box.innerHTML='';
  const rows=iconRows(), saved=iconPos(), items=allIcons(), taken=new Set(), pos={}, key=(c,r)=>c+','+r;
  items.forEach(it=>{ const p=saved[it.n]; if(p&&Number.isInteger(p[0])&&Number.isInteger(p[1])&&p[0]>=0&&p[1]>=0&&p[1]<rows&&!taken.has(key(p[0],p[1]))){ pos[it.n]=p; taken.add(key(p[0],p[1])); } });
  let c=0,r=0; const next=()=>{ while(taken.has(key(c,r))){ if(++r>=rows){ r=0; c++; } } taken.add(key(c,r)); return [c,r]; };
  items.forEach(it=>{ if(!pos[it.n]) pos[it.n]=next(); });
  ICON_CELLS=pos;
  items.forEach(it=>{
    const el=mk('div','dicon',`<span class="g">${it.i}</span><span class="n">${esc(it.n)}</span>`); placeIcon(el,pos[it.n]);
    el.onclick=e=>{ e.stopPropagation(); if(justDragged) return; closeMenus(); $$('.dicon.sel').forEach(x=>x.classList.remove('sel')); el.classList.add('sel'); if(coarse) it.run(); };
    el.ondblclick=()=>{ if(!justDragged) it.run(); };
    el.addEventListener('pointerdown',e=>{
      if(e.button!==0) return; const sx=e.clientX, sy=e.clientY, l0=parseFloat(el.style.left), t0=parseFloat(el.style.top); let moved=false;
      const mv=ev=>{ const dx=ev.clientX-sx, dy=ev.clientY-sy; if(!moved){ if(Math.hypot(dx,dy)<6) return; moved=true; el.classList.add('drag'); el.setPointerCapture(e.pointerId); $$('.dicon.sel').forEach(x=>x.classList.remove('sel')); el.classList.add('sel'); }
        el.style.left=Math.max(0,Math.min(desktop.clientWidth-IW,l0+dx))+'px'; el.style.top=Math.max(0,Math.min(desktop.clientHeight-IH,t0+dy))+'px'; };
      const up=()=>{ el.removeEventListener('pointermove',mv); el.removeEventListener('pointerup',up); el.removeEventListener('pointercancel',up); if(!moved) return; el.classList.remove('drag'); justDragged=true; setTimeout(()=>{ justDragged=false; },80); snapIcon(el,it); };
      el.addEventListener('pointermove',mv); el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);
    });
    el.oncontextmenu=e=>{ e.preventDefault(); e.stopPropagation(); $$('.dicon.sel').forEach(x=>x.classList.remove('sel')); el.classList.add('sel');
      showCtx(e.clientX,e.clientY,[{label:'Open',icon:'📂',run:it.run},...(it.user?[{sep:1},{label:'Delete',icon:IC.bin,run:async()=>{ const r=await dialog({title:'Confirm File Delete',icon:'q',buttons:['Yes','No'],body:`Are you sure you want to send '${esc(it.n)}' to the Recycle Bin?`}); if(r.btn==='Yes'){ fsDel(it.path); const s=iconPos(); delete s[it.n]; store.set('iconpos98',JSON.stringify(s)); renderIcons(); } }}]:[])]); };
    box.appendChild(el);
  });
}
async function newItem(kind){
  const base=kind==='dir'?'New Folder':'New Text Document.txt', d=fsGet(DESK_DIR)||{}; let n=base,i=2;
  while(Object.keys(d).some(k=>k.toLowerCase()===n.toLowerCase())) n=kind==='dir'?`New Folder (${i++})`:`New Text Document (${i++}).txt`;
  fsSet(joinP(DESK_DIR,n),kind==='dir'?{}:''); renderIcons();
}
function initDesktop(){
  desktop.addEventListener('click',()=>{ $$('.dicon.sel').forEach(x=>x.classList.remove('sel')); });
  desktop.addEventListener('contextmenu',e=>{
    if(e.target!==desktop&&e.target!==$('#icons')) return; e.preventDefault();
    showCtx(e.clientX,e.clientY,[
      {label:'Arrange Icons',sub:[{label:'by Name',run:()=>arrangeIcons('name')},{label:'by Type',run:()=>arrangeIcons('type')},{sep:1},{label:'Auto Arrange (reset)',run:()=>arrangeIcons('auto')}]},
      {label:'Refresh',run:async()=>{ $('#icons').style.visibility='hidden'; await sleep(120); renderIcons(); $('#icons').style.visibility=''; }},
      {sep:1},{label:'New',sub:[{label:'Folder',icon:IC.folder,run:()=>newItem('dir')},{label:'Text Document',icon:IC.doc,run:()=>newItem('txt')}]},
      {sep:1},{label:'Properties',icon:IC.display,run:()=>openApp('display')}]);
  });
  applyWallpaper(store.get('wp98')||'none',store.get('wpmode98')||'stretch'); renderIcons(); initSaver(); addEventListener('resize',()=>renderIcons());
}
const WP={
  none:['(None)','#008080'],
  clouds:['Clouds','radial-gradient(ellipse 18% 8% at 22% 22%,#fff 0,#fff0 100%),radial-gradient(ellipse 22% 9% at 70% 36%,#fff 0,#fff0 100%),radial-gradient(ellipse 25% 8% at 40% 70%,#fffc 0,#fff0 100%),linear-gradient(#2f6fd0,#9cc9f5)'],
  hills:['Green Hills','radial-gradient(ellipse 140% 55% at 25% 108%,#4aa83a 0 62%,#fff0 63%),radial-gradient(ellipse 120% 45% at 95% 112%,#2f7d22 0 62%,#fff0 63%),linear-gradient(#3b78d8,#b5dcff)'],
  sunset:['Sunset','linear-gradient(#1b1464,#c33764 58%,#f7b733)'],
  grid:['Blueprint','linear-gradient(#ffffff26 1px,#fff0 1px) 0 0/40px 40px,linear-gradient(90deg,#ffffff26 1px,#fff0 1px) 0 0/40px 40px,#10205a'],
  dots:['Dots','radial-gradient(#00a0a0 2px,#fff0 2.5px) 0 0/14px 14px,#006868'],
  stripes:['Stripes','repeating-linear-gradient(45deg,#006e6e 0 10px,#008080 10px 20px)'],
  tiles:['Tiles','conic-gradient(#0a0 25%,#080 0 50%,#0a0 0 75%,#080 0) 0 0/32px 32px'],
  night:['Night Sky','radial-gradient(#fff 1px,#fff0 1.5px) 0 0/60px 60px,radial-gradient(#fff9 1px,#fff0 1.5px) 30px 30px/60px 60px,#000018'],
  black:['Black','#000']};
const customImg=()=>store.get('wpimg98');
function wpCss(k,mode){
  if(k==='custom'&&customImg()){ const img=customImg(); return `url("${img}") ${mode==='tile'?'0 0/auto repeat':mode==='center'?'center/auto no-repeat':'center/cover no-repeat'},#000`; }
  if(k&&k.startsWith('solid:')&&/^solid:#[0-9a-f]{6}$/i.test(k)) return k.slice(6);
  return (WP[k]||WP.none)[1];
}
function applyWallpaper(k,mode='stretch'){ document.documentElement.style.setProperty('--wp',wpCss(k,mode)); store.set('wp98',k); store.set('wpmode98',mode); }
/* screen saver */
let lastAct=Date.now(), saverOn=false;
function initSaver(){
  ['pointermove','pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>{ lastAct=Date.now(); },true));
  setInterval(()=>{ const s=JSON.parse(store.get('ss98')||'{"k":"none","m":2}'); if(s.k!=='none'&&!saverOn&&Date.now()-lastAct>s.m*60000) startSaver(); },4000);
}
function startSaver(){
  if(saverOn) return; saverOn=true;
  const c=mk('canvas'); c.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:9999;background:#000;cursor:none'; c.width=innerWidth; c.height=innerHeight; document.body.appendChild(c);
  const g=c.getContext('2d'), S=Array.from({length:220},()=>({x:Math.random()*2-1,y:Math.random()*2-1,z:Math.random()}));
  let raf; const loop=()=>{ g.fillStyle='#000'; g.fillRect(0,0,c.width,c.height);
    S.forEach(s=>{ s.z-=.008; if(s.z<=0){ s.x=Math.random()*2-1; s.y=Math.random()*2-1; s.z=1; } const k=1/s.z, x=c.width/2+s.x*k*c.width/4, y=c.height/2+s.y*k*c.height/4; g.fillStyle='#fff'; g.fillRect(x,y,Math.min(4,k*.8),Math.min(4,k*.8)); });
    raf=requestAnimationFrame(loop); }; loop();
  const stop=()=>{ cancelAnimationFrame(raf); c.remove(); saverOn=false; lastAct=Date.now(); ['pointermove','pointerdown','keydown'].forEach(e=>removeEventListener(e,stop,true)); };
  setTimeout(()=>['pointermove','pointerdown','keydown'].forEach(e=>addEventListener(e,stop,true)),500);
}

/* ---------- Explorer ---------- */
const pathTitle=p=>p===''?'My Computer':p==='BIN'?'Recycle Bin':p==='CONTROL'?'Control Panel':p.endsWith(':')?`(${p})`:p.split('\\').pop();
const CPL=()=>[
  {n:'Display',i:IC.display,run:()=>openApp('display')},{n:'Date/Time',i:IC.clock,run:()=>openApp('datetime')},{n:'System',i:IC.sys,run:()=>openApp('sysprops')},
  {n:'Sounds',i:'🔊',run:()=>alertBox('Sounds are muted.\n\nThe dial-up noise is the only sound this PC is allowed to make.','info','Sounds Properties')},
  {n:'Mouse',i:'🖱️',run:()=>alertBox(FOLD_ERR,'info','Mouse Properties')},{n:'Keyboard',i:'⌨️',run:()=>alertBox(FOLD_ERR,'info','Keyboard Properties')},
  {n:'Add/Remove Programs',i:'📦',run:()=>alertBox('Nothing to remove.\n\nBoredom is not an installed program.','info','Add/Remove Programs')},
  {n:'Passwords',i:'🔑',run:()=>alertBox('The password is 1234. It has always been 1234.','info','Passwords Properties')},
  {n:'Network',i:'🌐',run:()=>alertBox('Unable to connect.\n\nSomeone picked up the phone.','err','Network')}];
APPS.explorer={icon:IC.folder,wh:[580,400],col:true,status:true,
  title:a=>pathTitle(a.path||''),
  menu:w=>[
    {label:'File',items:[['New Folder',()=>w.ex.newFolder()],'-',['Close',()=>w.close()]]},
    {label:'View',items:[['Show Hidden Files',()=>{ w.ex.hid=!w.ex.hid; w.ex.render(); },{check:w.ex&&w.ex.hid}],'-',['Large Icons',()=>w.ex.view('large'),{check:w.ex&&w.ex.v==='large'}],['List',()=>w.ex.view('list'),{check:w.ex&&w.ex.v==='list'}],'-',['Refresh',()=>w.ex.render()]]},
    {label:'Go',items:[['Back',()=>w.ex.go(-1)],['Forward',()=>w.ex.go(1)],['Up One Level',()=>w.ex.up()]]},
    {label:'Help',items:[['About Basement 98',()=>openApp('sysprops')]]}],
  mount(w,a){
    const ex=w.ex={path:a.path??'',hist:[a.path??''],hi:0,v:'large',hid:false};
    w.body.innerHTML=`<div class="etool"><button data-a="b">⬅ Back</button><button data-a="f">Forward ➡</button><button data-a="u">⬆ Up</button></div><div class="eaddr"><span>Address</span><input type="text" spellcheck="false"></div><div class="fl"></div>`;
    const fl=$('.fl',w.body), addr=$('input',w.body);
    const entries=()=>{
      const p=ex.path==='BIN'?'C:\\Recycled':ex.path;
      if(p==='') return [...DRIVES.map(d=>({n:d[1],i:d[2],go:d[0]})),{n:'Control Panel',i:IC.control,go:'CONTROL'},{n:'Printers',i:IC.printer,run:()=>alertBox('No printers are installed.','info','Printers')}];
      if(p==='CONTROL') return CPL();
      const d=fsGet(p); if(!d||typeof d!=='object') return null;
      return Object.keys(d).filter(n=>ex.hid||!isHidden(joinP(p,n))).sort((a,b)=>(typeof d[b]==='object')-(typeof d[a]==='object')||a.localeCompare(b,undefined,{sensitivity:'base'}))
        .map(n=>({n,i:iconFor(n,d[n]),go:typeof d[n]==='object'&&d[n]!==null?joinP(p,n):undefined,run:typeof d[n]!=='object'||d[n]===null?()=>openPath(joinP(p,n)):undefined}));
    };
    ex.render=()=>{
      const list=entries(); fl.className='fl'+(ex.v==='list'?' list':''); fl.innerHTML='';
      addr.value=ex.path===''?'My Computer':ex.path==='BIN'?'Recycle Bin':ex.path==='CONTROL'?'Control Panel':ex.path;
      w.setTitle(pathTitle(ex.path));
      if(!list){ fl.textContent='The folder cannot be found.'; w.setStatus('0 object(s)'); return; }
      list.forEach(it=>{
        const el=mk('div','fi',`<span class="g">${it.i}</span><span class="n">${esc(it.n)}</span>`);
        const open=()=>it.go!==undefined?ex.nav(it.go):it.run&&it.run();
        el.onclick=()=>{ $$('.fi.sel',fl).forEach(x=>x.classList.remove('sel')); el.classList.add('sel'); if(coarse) open(); };
        el.ondblclick=open; fl.appendChild(el);
      });
      w.setStatus(`${list.length} object(s)`); w.setStatus(ex.path===''?'My Computer':ex.path==='BIN'||ex.path==='CONTROL'?'':'',1);
    };
    ex.nav=p=>{
      if(p!==''&&p!=='BIN'&&p!=='CONTROL'&&fsGet(p)===null){ alertBox(`${p}\\ is not accessible.\n\nThe device is not ready.`,'err',p+'\\'); return; }
      ex.hist=ex.hist.slice(0,ex.hi+1); ex.hist.push(p); ex.hi=ex.hist.length-1; ex.path=p; ex.render();
    };
    ex.go=d=>{ const n=ex.hi+d; if(n<0||n>=ex.hist.length) return; ex.hi=n; ex.path=ex.hist[n]; ex.render(); };
    ex.up=()=>{ const p=ex.path; if(p===''||p==='BIN'||p==='CONTROL') return ex.nav(''); if(p.endsWith(':')) return ex.nav(''); ex.nav(p.slice(0,p.lastIndexOf('\\'))); };
    ex.view=v=>{ ex.v=v; ex.render(); };
    ex.newFolder=async()=>{
      if(!fsGet(ex.path)||typeof fsGet(ex.path)!=='object'||ex.path==='') return alertBox('You cannot create a folder here.','warn','Explorer');
      let n='New Folder',i=2; while(fsGet(joinP(ex.path,n))!==undefined) n=`New Folder (${i++})`;
      fsSet(joinP(ex.path,n),{}); ex.render(); if(ex.path.toLowerCase()===DESK_DIR.toLowerCase()) renderIcons();
    };
    $('.etool',w.body).onclick=e=>{ const a=e.target.dataset.a; if(a==='b') ex.go(-1); else if(a==='f') ex.go(1); else if(a==='u') ex.up(); };
    addr.onkeydown=e=>{ if(e.key==='Enter'){ const v=addr.value.trim(); const r=fsLookup(v); if(r.v&&typeof r.v==='object') ex.nav(r.real); else if(/^my computer$/i.test(v)) ex.nav(''); else alertBox(`'${v}' could not be found.`,'err','Explorer'); } };
    ex.render();
  }};

/* ---------- Notepad ---------- */
APPS.notepad={icon:IC.notepad,wh:[520,380],col:true,
  title:a=>`${a.path?a.path.split('\\').pop():'Untitled'} - Notepad`,
  menu:w=>[
    {label:'File',items:[['New',()=>w.np.neu()],['Open...',()=>w.np.open()],['Save',()=>w.np.save()],['Save As...',()=>w.np.saveAs()],'-',['Exit',()=>w.close()]]},
    {label:'Edit',items:[['Select All',()=>w.np.ta.select()],['Time/Date',()=>w.np.stamp(),{key:'F5'}]]},
    {label:'Help',items:[['About Notepad',()=>alertBox('Notepad\nFan-made tribute. Plain text, plain joy.','info','About Notepad')]]}],
  mount(w,a){
    const ta=mk('textarea','np'); ta.spellcheck=false; w.body.appendChild(ta);
    const np=w.np={ta,path:a.path||null};
    const v=a.path&&fsGet(a.path); if(typeof v==='string'&&!v.startsWith('#exe:')) ta.value=v.replace(/\r\n/g,'\n').replace(/\{\{year\}\}/g,new Date().getFullYear()).replace(/\{\{date\}\}/g,new Date().toLocaleDateString([],{day:'numeric',month:'long',year:'numeric'})); if(/time capsule/i.test(a.path||'')) egg('capsule');
    const title=()=>w.setTitle(`${np.path?np.path.split('\\').pop():'Untitled'} - Notepad`);
    np.neu=()=>{ ta.value=''; np.path=null; title(); };
    np.save=()=>np.path?(fsSet(np.path,ta.value.replace(/\n/g,'\r\n')),w.setStatus&&0):np.saveAs();
    np.saveAs=async()=>{
      const r=await dialog({title:'Save As',buttons:['Save','Cancel'],width:340,body:'Save in: C:\\My Documents<br><br>File name: <input type="text" value="'+esc(np.path?np.path.split('\\').pop():'Untitled.txt')+'">'});
      if(r.btn!=='Save') return; let n=$('input',r.el).value.trim()||'Untitled.txt'; if(!/\.[a-z0-9]+$/i.test(n)) n+='.txt';
      np.path='C:\\My Documents\\'+n; fsSet(np.path,ta.value.replace(/\n/g,'\r\n')); title();
    };
    np.open=async()=>{
      const files=Object.entries(fsGet('C:\\My Documents')||{}).filter(([,v])=>typeof v==='string'&&!v.startsWith('#exe:')).map(([n])=>n);
      const r=await dialog({title:'Open',buttons:['Open','Cancel'],width:340,body:`Look in: C:\\My Documents<br><br><select size="7" style="height:110px">${files.map(f=>`<option>${esc(f)}</option>`).join('')}</select>`});
      const sel=$('select',r.el).value; if(r.btn!=='Open'||!sel) return;
      np.path='C:\\My Documents\\'+sel; ta.value=String(fsGet(np.path)).replace(/\r\n/g,'\n'); title();
    };
    np.stamp=()=>{ ta.setRangeText(new Date().toLocaleString(),ta.selectionStart,ta.selectionEnd,'end'); };
    ta.addEventListener('keydown',e=>{ if(e.key==='F5'){ e.preventDefault(); np.stamp(); } });
    setTimeout(()=>ta.focus(),50);
  }};

/* ---------- DOS prompt ---------- */
function dosMount(el,opt={}){
  let cwd='C:\\BASEMENT';
  el.innerHTML=''; const out=mk('span'), line=mk('div'), pr=mk('span'), inp=mk('input'); inp.spellcheck=false; inp.autocomplete='off'; inp.autocapitalize='off';
  line.append(pr,inp); el.append(out,line);
  const print=t=>{ out.append(document.createTextNode(t+'\n')); };
  const setPrompt=()=>{ pr.textContent=cwd.toUpperCase()+'>'; setTimeout(()=>{ el.scrollTop=el.scrollHeight; inp.focus({preventScroll:true}); },0); };
  const resolve=a=>{ a=a.replace(/\//g,'\\'); if(/^[a-z]:/i.test(a)) return a.replace(/\\$/,''); if(a==='\\') return 'C:'; if(a==='..') return cwd.includes('\\')?cwd.slice(0,cwd.lastIndexOf('\\')):cwd; return cwd+'\\'+a; };
  const HELP='Supported commands:\nCD  CLS  COPY  DATE  DEL  DIR [/A]  ECHO  EXIT  FORMAT  HELP  MD  MEM  TIME  TYPE  UPSTAIRS  VER  VOL\nOr just type a program name: SNAKE, FLAMES, NOTEPAD, CALC, WINMINE, SOL ...';
  const hist=[]; let hi=0;
  print(opt.real?'Starting DOS...\n\nBasement 98 [Version 1.0]\nType UPSTAIRS to return to Basement.\n':'Basement 98 [Version 1.0]\n(Fan-made tribute. Nothing here is real. Type HELP.)\n');
  function run(raw){
    print(pr.textContent+raw); const [c0,...r]=raw.trim().split(/\s+/), cmd=(c0||'').toLowerCase(), arg=r.join(' ');
    if(/^[a-z]:$/.test(cmd)){ print(cmd==='c:'?'':`Not ready reading drive ${cmd.toUpperCase()}\nAbort, Retry, Fail?`); if(cmd==='c:') cwd='C:'; return; }
    switch(cmd){
      case '': break;
      case 'help': print(HELP); break;
      case 'cls': out.textContent=''; break;
      case 'ver': print('\nBasement 98 [Version 1.0]\n'); break;
      case 'vol': print(' Volume in drive C is WIN98\n Volume Serial Number is 1998-0A1B'); break;
      case 'date': print('Current date is '+new Date().toLocaleDateString()); break;
      case 'time': print('Current time is '+new Date().toLocaleTimeString()); break;
      case 'echo': print(arg||'ECHO is on'); break;
      case 'mem': print('\nMemory Type        Total     Used     Free\n----------------  -------  -------  -------\nConventional         640K      41K     599K\nExtended (XMS)    64,512K  12,288K  52,224K\n'); break;
      case 'cd': case 'chdir': { if(!arg){ print(cwd.toUpperCase()); break; } const t=resolve(arg), d=fsLookup(t); if(d.v&&typeof d.v==='object'){ cwd=d.real; } else print('Invalid directory'); break; }
      case 'dir': { const all=/\/a/i.test(arg), a2=arg.replace(/\/\w+/g,'').trim(), t=a2?resolve(a2):cwd, d=fsLookup(t); if(!d.v||typeof d.v!=='object'){ print('File not found'); break; }
        const names=Object.keys(d.v).filter(n=>all||!isHidden((d.real||t)+'\\'+n)); let nd=0,nf=0;
        print(` Volume in drive C is WIN98\n Directory of ${(d.real||t).toUpperCase()}\n\n.            <DIR>\n..           <DIR>`);
        names.forEach(n=>{ const dir=typeof d.v[n]==='object'; dir?nd++:nf++; const sz=dir?'':String((d.v[n]||'').length||512).padStart(10); print(`${n.toUpperCase().padEnd(28)}${dir?'<DIR>':sz}`); });
        print(`     ${nf} file(s)\n     ${nd} dir(s)   1,342,177,280 bytes free\n`); break; }
      case 'type': { const v=arg&&fsGet(resolve(arg)); if(typeof v==='string'&&!v.startsWith('#exe:')) print(v); else print('File not found - '+arg.toUpperCase()); break; }
      case 'md': case 'mkdir': if(arg){ fsSet(resolve(arg),{}); } else print('Required parameter missing'); break;
      case 'del': case 'erase': case 'deltree': { const p=resolve(arg); if(arg&&fsGet(p)!==undefined&&USER[p]!==undefined){ fsDel(p); } else print(arg?'Access denied - '+arg.toUpperCase()+'\n(It was not yours to delete.)':'Required parameter missing'); break; }
      case 'copy': print('        0 file(s) copied\n(Piracy is not cool. Also, the floppy is full.)'); break;
      case 'format': print('WARNING, ALL DATA ON NON-REMOVABLE DISK\nDRIVE C: WILL BE LOST!\nProceed with Format (Y/N)? Y\n\nFormatting 1,536.00M ... 100%\n\n...just kidding. Nothing was harmed.'); break;
      case 'win': case 'upstairs': opt.real?opt.onWin():print('You are already running Basement 98.'); break;
      case 'exit': opt.real?print('Type UPSTAIRS to return to Basement.'):opt.close&&opt.close(); break;
      case 'start': run2(arg); break;
      default: run2(raw.trim());
    }
    function run2(v){ const key=v.toLowerCase().replace(/\.exe$|\.com$/,''); if(RUNMAP[key]&&!opt.real){ const t=RUNMAP[key]; typeof t==='string'?openApp(t):t(); print('Starting '+v.toUpperCase()+'...'); } else if(RUNMAP[key]) print('This program requires Basement.\nType UPSTAIRS to start it.'); else print('Bad command or file name'); }
  }
  inp.onkeydown=e=>{
    if(e.key==='Enter'){ const v=inp.value; inp.value=''; if(v.trim()){ hist.push(v); hi=hist.length; } run(v); setPrompt(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); if(hi>0) inp.value=hist[--hi]; }
    else if(e.key==='ArrowDown'){ e.preventDefault(); inp.value=hi<hist.length-1?hist[++hi]:(hi=hist.length,''); }
  };
  el.addEventListener('pointerdown',()=>setTimeout(()=>inp.focus({preventScroll:true}),0));
  setPrompt();
}
APPS.dos={icon:IC.dos,wh:[580,380],title:'DOS Prompt',mount(w){ w.body.classList.add('dos'); dosMount(w.body,{close:()=>w.close()}); }};

/* ---------- NetSurfer ---------- */
const IE_HOME=`<h1>🌍 Welcome to the Homepage of Alex "Pixel" Rivera!!</h1>
<p style="text-align:center;font-size:20px;margin:0"><b>Greatest Gamer in the World</b> <small>(self-certified)</small></p>
<p class="blink">★ ★ WORLD CHAMPION (ACCORDING TO ME) ★ ★</p>
<div class="mq"><span>Welcome, visitor from anywhere on Earth! My high score in everything is number 1! Cheat codes inside! Think you can beat me? Prove it in the Hall of Fame! Best viewed in NetSurfer 4.0 at 800x600!</span></div>
<p style="text-align:center">You are visitor number <b style="font-family:'Courier New';background:#000;color:#0f0;padding:1px 6px">004217</b> from <b>195 countries</b></p><hr>
<ul>
 <li><a data-app="halloffame">🏆 Beat my scores in the Hall of Fame!!</a> (you can't)</li>
 <li><a data-app="snake">🐍 My Snake record: unbeatable. Try it.</a></li>
 <li><a data-app="turbo">🏎️ Race me in Turbo Rush, loser buys the pizza</a></li>
 <li><a data-app="mines">💣 Watch me clear Minesweeper with my eyes closed</a></li>
 <li><a data-u="http://homepages.example.com/~pixel/cheats.html">Cheat Codes (do not tell Mum)</a></li>
 <li><a data-u="http://homepages.example.com/~pixel/guestbook.html">Sign my Guestbook!!</a></li>
 <li><a data-u="http://homepages.example.com/~pixel/mp3.html">Download my Victory Anthem (28 min per song)</a></li>
</ul>
<p>Email me your challenges: <a data-u="mailto:pixel_master_98@example.com">pixel_master_98@example.com</a></p>
<p style="text-align:center;font-size:13px">[ <a data-u="http://www.webring.example/prev">&lt;&lt; Prev</a> | International Gamers WebRing | <a data-u="http://www.webring.example/next">Next &gt;&gt;</a> ]</p>
<p style="text-align:center;font-size:12px;color:#666">This page is © 1998 Alex "Pixel" Rivera. Do not steal my high scores.</p>`;
async function dialUp(url){
  const d=dialog({title:'Dial-up Connection',icon:'info',buttons:['Cancel'],width:360,body:'<b>Connecting...</b><div class="pb"><i></i></div><div class="st">Dialing...</div>'});
  let off=false; d.then(()=>{ off=true; });
  for(const s of ['Dialing 1-800-555-0198...','Verifying user name and password...','Registering your computer on the network...']){
    if(off) return; const st=$('.st',d.el); if(st) st.textContent=s; await sleep(1100);
  }
  if(off) return; d.close();
  alertBox(`NetSurfer cannot open the Internet site ${url}.\n\nA connection with the server could not be established.`,'err','NetSurfer');
}
APPS.ie={icon:IC.ie,wh:[640,440],col:true,status:true,single:true,title:'Pixel\'s Homepage - NetSurfer',
  menu:w=>[{label:'File',items:[['Close',()=>w.close()]]},{label:'Favorites',items:[['Classic Games',()=>openApp('explorer',{path:'C:\\Games'})]]},{label:'Help',items:[['About NetSurfer',()=>alertBox('NetSurfer\nBrowsing the 1998 web at 28.8 kbps.','info','About')]]}],
  mount(w){
    w.body.innerHTML=`<div class="iebar"><button data-a="x">⬅ Back</button><button data-a="x">➡ Forward</button><button data-a="x">⛔ Stop</button><button data-a="r">🔄 Refresh</button><button data-a="h">🏠 Home</button></div><div class="eaddr"><span>Address</span><input type="text" value="http://homepages.example.com/~pixel/" spellcheck="false"><button style="min-width:0">Go</button></div><div class="ie-page">${IE_HOME}</div>`;
    w.setStatus('Done'); w.setStatus('🌐 Internet zone',1);
    const go=u=>{ w.setStatus('Opening page '+u+'...'); dialUp(u).then(()=>w.setStatus('Done')); };
    $('.ie-page',w.body).onclick=e=>{ const a=e.target.closest('a'); if(!a) return; if(a.dataset.app){ openApp(a.dataset.app); w.setStatus('Done'); } else go(a.dataset.u); };
    $('.iebar',w.body).onclick=e=>{ const a=e.target.dataset.a; if(a==='h'||a==='r'){ $('.ie-page',w.body).innerHTML=IE_HOME; w.setStatus('Done'); } else if(a==='x') w.setStatus('Done'); };
    const inp=$('.eaddr input',w.body); $('.eaddr button',w.body).onclick=()=>go(inp.value.trim()||'about:blank');
    inp.onkeydown=e=>{ if(e.key==='Enter') go(inp.value.trim()||'about:blank'); };
  }};

/* ---------- Control Panel applets ---------- */
function tabsHTML(names,i){ return `<div class="tabs">${names.map((n,k)=>`<span data-t="${k}" class="${k===i?'on':''}">${n}</span>`).join('')}</div>`; }
APPS.display={icon:IC.display,fit:true,single:true,title:'Display Properties',mount(w){
  let tab=0, sel=store.get('wp98')||'none', mode=store.get('wpmode98')||'stretch', ss=JSON.parse(store.get('ss98')||'{"k":"none","m":2}');
  const draw=()=>{
    const names=Object.entries(WP).map(([k,v])=>[k,v[0]]); if(customImg()) names.push(['custom','My Picture']); if(sel.startsWith('solid:')) names.push([sel,'Solid colour']);
    w.body.innerHTML=`<div style="width:420px">${tabsHTML(['Background','Screen Saver'],tab)}<div class="tabbody">${tab===0?
      `<div class="mon"><div id="prev" style="background:${wpCss(sel,mode)}"></div></div>Wallpaper:<div class="lst" style="margin-top:4px">${names.map(([k,n])=>`<div data-k="${esc(k)}" class="${k===sel?'sel':''}">${esc(n)}</div>`).join('')}</div>
       <div style="display:flex;gap:10px;margin-top:8px;align-items:center;flex-wrap:wrap"><button id="br" style="min-width:90px">Browse...</button><label>Display: <select id="md" style="width:84px"><option value="stretch">Stretch</option><option value="center">Center</option><option value="tile">Tile</option></select></label><label>Colour: <input type="color" id="co" value="${sel.startsWith('solid:')?sel.slice(6):'#008080'}" style="width:38px;height:24px;padding:0;vertical-align:middle"></label></div>`:
      `<div class="mon"><div style="background:#000"></div></div>Screen Saver:<br><select id="ssk" style="margin:4px 0 10px"><option value="none">(None)</option><option value="stars">Starfield Simulation</option></select><br>Wait: <select id="ssm" style="width:90px"><option value="1">1</option><option value="2">2</option><option value="5">5</option></select> minutes <button id="ssp" style="margin-left:10px;min-width:70px">Preview</button>`}</div>
      <div class="dbtn" style="justify-content:flex-end"><button id="ok" class="def">OK</button><button id="cn">Cancel</button><button id="ap">Apply</button></div></div>`;
    if(tab===1){ $('#ssk',w.body).value=ss.k; $('#ssm',w.body).value=String(ss.m); }
    else $('#md',w.body).value=mode;
    $$('.tabs span',w.body).forEach(s=>s.onclick=()=>{ tab=+s.dataset.t; draw(); });
    $$('.lst div',w.body).forEach(d=>d.onclick=()=>{ sel=d.dataset.k; draw(); });
    if(tab===0){
      const prev=()=>{ $('#prev',w.body).style.background=wpCss(sel,mode); };
      $('#md',w.body).onchange=e=>{ mode=e.target.value; prev(); };
      $('#co',w.body).oninput=e=>{ sel='solid:'+e.target.value; prev(); };
      $('#co',w.body).onchange=()=>draw();
      $('#br',w.body).onclick=()=>{ const f=document.createElement('input'); f.type='file'; f.accept='image/*'; f.onchange=()=>{ const file=f.files[0]; if(!file) return; const url=URL.createObjectURL(file), img=new Image();
        img.onload=()=>{ const sc=Math.min(1,1600/img.width), c=document.createElement('canvas'); c.width=Math.round(img.width*sc); c.height=Math.round(img.height*sc); c.getContext('2d').drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(url);
          const data=c.toDataURL('image/jpeg',.82); store.set('wpimg98',data);
          if(store.get('wpimg98')!==data){ alertBox('That picture is too big to keep in this browser.\n\nTry a smaller image.','warn','Display Properties'); return; } sel='custom'; draw(); };
        img.onerror=()=>alertBox('Basement cannot read that picture.','err','Display Properties'); img.src=url; }; f.click(); };
    }
    if(tab===1){ $('#ssk',w.body).onchange=e=>ss.k=e.target.value; $('#ssm',w.body).onchange=e=>ss.m=+e.target.value; $('#ssp',w.body).onclick=startSaver; }
    const apply=()=>{ applyWallpaper(sel,mode); store.set('ss98',JSON.stringify(ss)); };
    $('#ap',w.body).onclick=apply; $('#ok',w.body).onclick=()=>{ apply(); w.close(); }; $('#cn',w.body).onclick=()=>w.close();
  }; draw();
}};
APPS.datetime={icon:IC.clock,fit:true,single:true,title:'Date/Time Properties',mount(w){
  w.body.innerHTML=`<div style="width:360px">${tabsHTML(['Date & Time'],0)}<div class="tabbody center"><canvas width="150" height="150" id="clk" style="box-shadow:var(--sunk);background:#fff"></canvas><p id="dt" style="margin:10px 0 0;font-size:13px"></p></div><div class="dbtn" style="justify-content:flex-end"><button class="def" id="ok">OK</button><button id="cn">Cancel</button></div></div>`;
  const c=$('#clk',w.body), g=c.getContext('2d');
  const tick=()=>{ const d=new Date(); g.clearRect(0,0,150,150); g.strokeStyle='#000'; g.lineWidth=2; g.beginPath(); g.arc(75,75,70,0,7); g.stroke();
    for(let i=0;i<12;i++){ const a=i*Math.PI/6; g.beginPath(); g.moveTo(75+Math.sin(a)*62,75-Math.cos(a)*62); g.lineTo(75+Math.sin(a)*68,75-Math.cos(a)*68); g.stroke(); }
    const hand=(a,l,wd,col)=>{ g.strokeStyle=col; g.lineWidth=wd; g.beginPath(); g.moveTo(75,75); g.lineTo(75+Math.sin(a)*l,75-Math.cos(a)*l); g.stroke(); };
    hand((d.getHours()%12+d.getMinutes()/60)*Math.PI/6,38,4,'#000'); hand((d.getMinutes()+d.getSeconds()/60)*Math.PI/30,55,3,'#000'); hand(d.getSeconds()*Math.PI/30,60,1,'#f00');
    $('#dt',w.body).textContent=d.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric',year:'numeric'})+'  '+d.toLocaleTimeString(); };
  tick(); const t=setInterval(tick,1000);
  $('#ok',w.body).onclick=$('#cn',w.body).onclick=()=>w.close(); return ()=>clearInterval(t);
}};
APPS.sysprops={icon:IC.sys,fit:true,single:true,title:'System Properties',mount(w){
  w.body.innerHTML=`<div style="width:400px">${tabsHTML(['General'],0)}<div class="tabbody" style="line-height:1.5;font-size:13px"><b>System:</b><br>&nbsp;&nbsp;Basement 98<br>&nbsp;&nbsp;Special Edition 1.0<br><br><b>Registered to:</b><br>&nbsp;&nbsp;You<br>&nbsp;&nbsp;Boredom Industries<br><br><b>Computer:</b><br>&nbsp;&nbsp;233MHz processor<br>&nbsp;&nbsp;64.0MB RAM<br><br><i style="color:#555;font-size:11px">Fan-made tribute. Not affiliated with any company.</i></div><div class="dbtn" style="justify-content:flex-end"><button class="def" id="ok">OK</button><button id="cn">Cancel</button></div></div>`;
  $('#ok',w.body).onclick=$('#cn',w.body).onclick=()=>w.close();
}};

/* ---------- Help, Sweets, Welcome ---------- */
APPS.help={icon:IC.help,wh:[520,420],col:true,single:true,title:'Help',mount(w){
  w.body.innerHTML=`<div class="helpbox"><h3>Getting started</h3>Double-click an icon (a single tap works on phones). Drag windows by their title bars. Resize from the bottom-right corner. Drag desktop icons to rearrange them, and drag items inside Start > Programs to reorder the menu. Right-click the desktop for Arrange Icons, New and Properties (wallpaper, your own picture, colours).
<h3>The games</h3>Open <b>C:\\Games</b> or Start &gt; Programs &gt; Games. There's Minesweeper, Solitaire, our own 3D maze shooter, a split-screen racer, a block-building sandbox, falling blocks, Paddle Wars (Pong), and the notebook classics: FLAMES, Book Cricket, Name Place Animal Thing...
<h3>Sweets</h3>Win a game and a sweet lands in <b>My Sweets</b>. There are 14 to collect, and one is hidden.
<h3>DOS Prompt</h3>Type <b>HELP</b>. Try <b>DIR</b>, <b>TYPE</b> a file in My Documents, or just type a game's name.
<h3>Tips</h3>Start &gt; Settings &gt; Control Panel &gt; Display lets you change the wallpaper and switch on the Starfield screen saver. Start &gt; Shut Down &gt; Restart in DOS mode is as authentic as it gets.
<h3>About</h3>A fan-made tribute, written from scratch and inspired by the desktops of the late 90s. All code, icons and sounds are original. Not affiliated with any company.</div>`;
}};
APPS.sweets={icon:IC.sweets,wh:[500,400],col:true,status:true,single:true,title:'My Sweets (C:)',mount(w){
  w.body.innerHTML='<div class="shelf"></div>'; $$('.status span',w.el)[0].classList.add('tcnt'); $$('.status span',w.el)[1].classList.add('eggcnt'); renderTuck(); updateEggUI();
}};
APPS.welcome={icon:IC.home,wh:[500,310],single:true,title:'Welcome to Basement 98',mount(w){
  w.body.innerHTML=`<div style="display:flex;height:100%"><div style="width:130px;background:linear-gradient(#000080,#1084d0);color:#fff;font:italic 700 24px Arial;padding:14px 10px;flex:none">Basement<br><small style="font-size:20px;color:#c0c0c0">98</small></div>
    <div style="padding:14px 16px;flex:1;display:flex;flex-direction:column"><h3 style="font-family:Arial;color:#000080;font-size:18px;margin:0 0 8px">Did you know?</h3>
    <p style="margin:0 0 8px;line-height:1.5"><i>No windows down here. Just games.</i><br><br>Win a game, get a sweet. Post your score to the <b>Hall of Fame</b> and see who in the world beats you. A new <b>Daily Challenge</b> drops at midnight UTC: same game for everyone.<br><br>Press <b>Start</b> for the games.</p>
    <label style="margin-top:auto"><input type="checkbox" id="sw" checked> Show this screen each time Basement 98 starts</label>
    <div style="display:flex;gap:6px;margin-top:10px"><button id="rnd" style="min-width:0;padding:4px 8px">🎲 Surprise me</button><button id="hf" style="min-width:0;padding:4px 8px">🏆 Hall of Fame</button><button id="cl" class="def" style="margin-left:auto">Close</button></div></div></div>`;
  $('#sw',w.body).onchange=e=>store.set('welcome',e.target.checked?'1':'0');
  $('#cl',w.body).onclick=()=>w.close(); $('#hf',w.body).onclick=()=>{ w.close(); openApp('halloffame'); };
  $('#rnd',w.body).onclick=()=>{ w.close(); openApp(pick([...GAMES,...ARCADE]).id); };
}};
