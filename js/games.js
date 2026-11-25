// Reward system + classic games
/* ---------------- TUCK SHOP (rewards) ---------------- */
const CANDIES=[
  {n:'Melody',s:'wrap',a:'#a9561a',b:'#f2c14e'},
  {n:'Eclairs',s:'wrap',a:'#5a2e12',b:'#d9a066'},
  {n:'Kismi',s:'wrap',a:'#ff8a00',b:'#ffd36b'},
  {n:'Mango Bite',s:'wrap',a:'#ffc400',b:'#ff9f1c'},
  {n:'Alpenliebe',s:'wrap',a:'#e63946',b:'#ffffff'},
  {n:'Pulse',s:'round',a:'#6fd04a',b:'#2e9e5b'},
  {n:'Boomer',s:'round',a:'#ff6fb5',b:'#ff2d95'},
  {n:'Rola Cola',s:'round',a:'#3b1f0e',b:'#9b5a2a'},
  {n:'Orange Candy',s:'round',a:'#ff9b21',b:'#ffd08a'},
  {n:'Gems',s:'gems',a:'#e63946',b:'#ffd400'},
  {n:'Five Star',s:'bar',a:'#6b3a1e',b:'#c0392b'},
  {n:'Perk',s:'bar',a:'#7b4a2a',b:'#f4b400'},
  {n:'Lollipop',s:'lolly',a:'#e63946',b:'#ffffff'},
  {n:'Golden Wrapper',s:'wrap',a:'#d4af37',b:'#fff3b0',secret:true},
];
function candySVG(c){
  const {s,a,b}=c; let g='';
  if(s==='wrap') g=`<path d="M2 6L17 20 2 34Z" fill="${b}"/><path d="M62 6L47 20 62 34Z" fill="${b}"/><rect x="14" y="6" width="36" height="28" rx="12" fill="${a}"/><path d="M22 13q10-5 20 0" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  else if(s==='round') g=`<circle cx="32" cy="20" r="16" fill="${a}" stroke="${b}" stroke-width="3"/><path d="M22 13q6-6 14-3" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  else if(s==='gems') g=`<circle cx="18" cy="24" r="11" fill="${a}"/><circle cx="35" cy="14" r="11" fill="${b}"/><circle cx="47" cy="27" r="11" fill="#3a86ff"/><circle cx="14" cy="20" r="3" fill="#fff" opacity=".6"/><circle cx="31" cy="10" r="3" fill="#fff" opacity=".6"/>`;
  else if(s==='bar') g=`<rect x="5" y="6" width="54" height="28" rx="4" fill="${a}"/><path d="M18 6V34M32 6V34M46 6V34M5 20H59" stroke="#000" stroke-opacity=".25" stroke-width="2"/><rect x="5" y="14" width="54" height="12" fill="${b}"/><path d="M12 20h40" stroke="#fff" stroke-width="2" stroke-dasharray="3 4"/>`;
  else g=`<path d="M34 25L58 38" stroke="#ddd" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="18" r="16" fill="${a}"/><circle cx="24" cy="18" r="10" fill="none" stroke="${b}" stroke-width="3"/><circle cx="24" cy="18" r="4" fill="none" stroke="${b}" stroke-width="3"/>`;
  return `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
const jar=()=>{ try{ return JSON.parse(store.get('candies')||'{}'); }catch(e){ return {}; } };
function renderTuck(){
  const j=jar(), have=CANDIES.filter(c=>j[c.n]).length;
  $$('.shelf').forEach(sh=>{ sh.innerHTML=CANDIES.map(c=>`<div class="sw ${j[c.n]?'':'lock'}">${j[c.n]?`<b>${j[c.n]}</b>`:''}${candySVG(c)}${j[c.n]?c.n:'???'}</div>`).join(''); });
  $$('.tcnt').forEach(t=>t.textContent=`${have}/${CANDIES.length} collected`);
}
async function celebrate(){
  await sleep(700);
  const j=jar(), pool=CANDIES.filter(c=>!c.secret), unseen=pool.filter(c=>!j[c.n]);
  const c=unseen.length&&Math.random()<.75?pick(unseen):pick(pool);
  j[c.n]=(j[c.n]||0)+1; store.set('candies',JSON.stringify(j));
  const LINES=['Core memory unlocked.','This used to cost ₹1.','The tuck-shop uncle approves.','Pocket money well spent.','Tastes like a Friday.'];
  renderTuck();
  dialog({title:'Achievement unlocked',width:360,body:`<div class="pm">${candySVG(c)}<div><b>${c.n}</b> added to My Sweets.${unseen.includes(c)?' <b class="bad">NEW!</b>':''}<br><i>${pick(LINES)}</i></div></div>`});
}
/* ---------------- FLAMES ---------------- */
const MEAN = {F:['Friends','🤝'],L:['Love','❤️'],A:['Affection','🥰'],M:['Marriage','💍'],E:['Enemies','😈'],S:['Siblings','👫']};
function flames(n1, n2){
  const a=[...n1.toLowerCase().replace(/[^a-z]/g,'')], b=[...n2.toLowerCase().replace(/[^a-z]/g,'')];
  const ca=a.map(()=>false), cb=b.map(()=>false);
  a.forEach((ch,i)=>{ const j=b.findIndex((c,j)=>!cb[j] && c===ch); if(j>-1){ ca[i]=true; cb[j]=true; } });
  const n = ca.filter(x=>!x).length + cb.filter(x=>!x).length;
  const arr=[...'FLAMES'], order=[];
  if(n>0){ let idx=0; while(arr.length>1){ idx=(idx+n-1)%arr.length; order.push(arr[idx]); arr.splice(idx,1); } }
  return {a,b,ca,cb,n,order,result:arr[0]};
}
function mountFlames(root){
  let alive=true;
  root.innerHTML=`
    <div class="panel">
      <p>Write both names. Cancel common letters. Count what's left. Play F-L-A-M-E-S.</p>
      <div class="row"><input type="text" id="n1" placeholder="Your name" maxlength="30"><input type="text" id="n2" placeholder="Partner's name" maxlength="30"></div>
      <p class="center"><button class="big" id="go">FLAMES!</button></p>
    </div>
    <div class="panel center" id="out" hidden></div>`;
  const out=$('#out',root);
  const show=(arr,flags)=>arr.map((c,i)=>`<span class="${flags&&flags[i]?'x':''}">${c.toUpperCase()}</span>`).join('');
  async function run(){
    const n1=$('#n1',root).value.trim(), n2=$('#n2',root).value.trim();
    out.hidden=false;
    const r=flames(n1,n2);
    if(!r.a.length||!r.b.length){ out.innerHTML='<p class="bad">Write two names first (letters only, please).</p>'; return; }
    $('#go',root).disabled=true;
    out.innerHTML=`<div class="letters" id="la">${show(r.a)}</div><div>&amp;</div><div class="letters" id="lb">${show(r.b)}</div><p class="msg" id="m"></p><div class="fl" id="fl"></div><div class="res" id="res"></div>`;
    const m=$('#m',out);
    m.textContent='Cancelling common letters…'; await sleep(900); if(!alive)return;
    $('#la',out).innerHTML=show(r.a,r.ca); $('#lb',out).innerHTML=show(r.b,r.cb);
    await sleep(900); if(!alive)return;
    if(r.n===0){
      m.textContent='Zero letters left. Same name?! Are you flirting with a mirror? 🪞';
      $('#res',out).textContent='Twins? 😂'; $('#go',root).disabled=false; return;
    }
    m.textContent=`${r.n} letter${r.n>1?'s':''} left. Counting ${r.n} on F-L-A-M-E-S…`;
    const fl=$('#fl',out); fl.innerHTML=[...'FLAMES'].map(c=>`<div data-c="${c}">${c}</div>`).join('');
    await sleep(900);
    for(const c of r.order.slice(0,-1)){ if(!alive)return; $(`[data-c="${c}"]`,fl).classList.add('gone'); await sleep(700); }
    if(!alive)return;
    $(`[data-c="${r.result}"]`,fl).classList.add('win');
    const [word,emo]=MEAN[r.result];
    m.textContent='';
    $('#res',out).innerHTML=`${emo} ${word}!`;
    const who=`${n1} & ${n2}`;
    const p=document.createElement('p'); p.textContent=`${who} = ${word}. Don't blame the pencil.`; out.appendChild(p);
    $('#go',root).disabled=false; celebrate();
  }
  $('#go',root).onclick=run;
  root.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{ if(e.key==='Enter') run(); }));
  return ()=>{ alive=false; };
}

/* ---------------- BOOK CRICKET ---------------- */
function mountBookCricket(root){
  let phase='you', runs=0, balls=0, target=null, done=false, run=Run.begin('cricket');
  const MAX=12;
  root.innerHTML=`<div class="panel center">
    <p>Open a random page. Last digit decides: <b>0 = OUT</b>, <b>1–6 = runs</b>, 7–9 = dot ball. 12 balls, 1 wicket each.</p>
    <div class="score"><span id="who"></span><span id="sc"></span><span id="bl"></span></div>
    <div class="bigNum" id="big">📖</div>
    <p class="msg" id="m">You bat first. Turn the page!</p>
    <button class="big" id="turn">Turn page</button>
  </div>`;
  const $m=$('#m',root), $b=$('#turn',root);
  const upd=()=>{
    $('#who',root).textContent=phase==='you'?'🏏 You batting':'🤖 Computer batting';
    $('#sc',root).textContent=`${runs} runs`+(target?` (target ${target})`:'');
    $('#bl',root).textContent=`Ball ${Math.min(balls,MAX)}/${MAX}`;
  };
  upd();
  function endInnings(){
    if(phase==='you'){
      target=runs+1; phase='cpu'; runs=0; balls=0;
      $m.textContent+=` You scored ${target-1}. Computer needs ${target}.`;
      $b.textContent='Computer bats';
    } else { finish(); return; }
    upd();
  }
  function finish(){
    done=true; const you=target-1;
    $m.textContent = runs>=target ? `Computer wins by chasing ${target}! 😭` : runs===you ? "It's a TIE! Super over in the playground." : `YOU WIN by ${you-runs} run${you-runs>1?'s':''}! 🏆`;
    $b.textContent='Play again'; upd(); if(you>0) postScore('cricket',you,{reward:runs<you,run});
  }
  $b.onclick=()=>{
    if(done){ run=Run.begin('cricket'); phase='you'; runs=0; balls=0; target=null; done=false; $m.textContent='New match. You bat first.'; $b.textContent='Turn page'; $('#big',root).textContent='📖'; upd(); return; }
    const page=1+rnd(200), d=page%10; balls++;
    let txt; let out=false;
    if(d===0){ out=true; txt='OUT! 🎯'; $('#big',root).textContent='OUT'; }
    else if(d<=6){ runs+=d; txt= d===6?'SIX! 🚀':d===4?'FOUR! 🔥':`${d} run${d>1?'s':''}`; $('#big',root).textContent=d; }
    else { txt='Dot ball.'; $('#big',root).textContent='•'; }
    $m.textContent=`Page ${page} → ${txt}`;
    upd();
    if(phase==='cpu' && runs>=target){ finish(); return; }
    if(out || balls>=MAX) endInnings();
  };
  return ()=>{};
}

/* ---------------- SNAKE ---------------- */
function mountSnake(root){
  const {daily,mk}=takeDaily('snake'); let rng=Math.random, run=null, log='', ready=false, pending=null;
  const N=15, S=20;
  root.innerHTML=`<div class="panel center">
    <div class="score"><span id="s">Score 0</span><span id="hi">Best 0</span></div>
    <canvas id="c" width="${N*S}" height="${N*S}"></canvas>
    <div class="msg" id="m">Arrow keys / WASD / swipe / buttons. Press any to start.</div>
    <div class="dpad"><span></span><button data-d="u">▲</button><span></span><button data-d="l">◀</button><button data-d="d">▼</button><button data-d="r">▶</button></div>
  </div>`;
  const cv=$('#c',root), g=cv.getContext('2d');
  let hi=+store.get('snake-hi')||0; $('#hi',root).textContent='Best '+hi;
  let snake,dir,next,food,score,timer,running;
  const V={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};
  function reset(){
    snake=[[7,7],[6,7],[5,7]]; dir=next='r'; score=0; running=false; log=''; ready=false; pending=null; food=[0,0]; const r=run=Run.begin('snake'); r.ready.then(()=>{ if(run!==r) return; rng=mk(r.seed); placeFood(); ready=true; draw(); if(pending){ const d=pending; pending=null; turn(d); } }); $('#s',root).textContent='Score 0'; draw(); clearInterval(timer);
  }
  function placeFood(){ do{ food=[Math.floor(rng()*N),Math.floor(rng()*N)]; }while(snake.some(s=>s[0]===food[0]&&s[1]===food[1])); }
  function start(){ if(running) return; running=true; $('#m',root).textContent='Go go go!'; timer=setInterval(tick,115); }
  function turn(d){
    if(!ready){ pending=d; return; }
    const o={u:'d',d:'u',l:'r',r:'l'};
    if(!running && d===o[dir]) return;
    if(d!==o[dir]) next=d;
    start();
  }
  function tick(){
    dir=next; log+=dir; const [dx,dy]=V[dir]; const h=[snake[0][0]+dx,snake[0][1]+dy];
    if(h[0]<0||h[1]<0||h[0]>=N||h[1]>=N||snake.some(s=>s[0]===h[0]&&s[1]===h[1])) return over();
    snake.unshift(h);
    if(h[0]===food[0]&&h[1]===food[1]){ score++; $('#s',root).textContent='Score '+score; placeFood(); } else snake.pop();
    draw();
  }
  function over(){
    clearInterval(timer); running=false;
    if(score>hi){ hi=score; store.set('snake-hi',hi); $('#hi',root).textContent='Best '+hi; }
    $('#m',root).textContent=`Game over! Score ${score}. Press a key to retry.`; reset0=true;
    if(score>0) postScore('snake',score,{daily,reward:score>=5,run,log});
  }
  let reset0=false;
  function draw(){
    g.fillStyle='#a3b58a'; g.fillRect(0,0,N*S,N*S);
    g.fillStyle='#1f2a14'; g.fillRect(food[0]*S+3,food[1]*S+3,S-6,S-6);
    g.fillStyle='#1f2a14'; snake.forEach((s,i)=>g.fillRect(s[0]*S+1,s[1]*S+1,S-2,S-2));
  }
  const map={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r',w:'u',s:'d',a:'l',d:'r'};
  const onKey=e=>{ if(!root.closest('.win')?.classList.contains('active')) return; const d=map[e.key]; if(!d) return; e.preventDefault(); if(reset0){ reset(); reset0=false; } turn(d); };
  document.addEventListener('keydown',onKey);
  root.querySelectorAll('.dpad button').forEach(b=>b.onclick=()=>{ if(reset0){reset();reset0=false;} turn(b.dataset.d); });
  let t0; cv.addEventListener('touchstart',e=>{ t0=e.touches[0]; },{passive:true});
  cv.addEventListener('touchend',e=>{
    if(!t0) return; const t=e.changedTouches[0], dx=t.clientX-t0.clientX, dy=t.clientY-t0.clientY;
    if(Math.max(Math.abs(dx),Math.abs(dy))<20) return;
    if(reset0){reset();reset0=false;}
    turn(Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u'));
  });
  reset();
  return ()=>{ clearInterval(timer); document.removeEventListener('keydown',onKey); };
}

/* ---------------- TIC TAC TOE (XO) ---------------- */
function mountTTT(root){
  let vsCpu=true, b, turn, over;
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  root.innerHTML=`<div class="panel center">
    <div class="mode"><button data-m="cpu" class="on">vs Computer</button><button data-m="friend">vs Friend</button></div>
    <div class="msg" id="m"></div>
    <div class="board" id="bd"></div>
    <button id="re">New game</button>
  </div>`;
  const winner=bb=>{ for(const [x,y,z] of L) if(bb[x]&&bb[x]===bb[y]&&bb[x]===bb[z]) return bb[x]; return bb.every(Boolean)?'T':null; };
  function minimax(bb,p){
    const w=winner(bb); if(w) return w==='O'?1:w==='X'?-1:0;
    let best=p==='O'?-2:2;
    for(let i=0;i<9;i++) if(!bb[i]){ bb[i]=p; const s=minimax(bb,p==='O'?'X':'O'); bb[i]=''; best=p==='O'?Math.max(best,s):Math.min(best,s); }
    return best;
  }
  function cpu(){
    const free=[...Array(9).keys()].filter(i=>!b[i]);
    let mv;
    if(Math.random()<.25) mv=pick(free);
    else { let best=-2; for(const i of free){ b[i]='O'; const s=minimax(b,'X'); b[i]=''; if(s>best){best=s;mv=i;} } }
    b[mv]='O'; turn='X';
  }
  function render(){
    const w=winner(b);
    $('#bd',root).innerHTML=b.map((v,i)=>`<button data-i="${i}" ${v||w?'disabled':''} style="color:${v==='X'?'var(--ink)':'var(--red)'}">${v}</button>`).join('');
    $('#m',root).textContent = w? (w==='T'?"It's a draw. Classic.":`${w} wins! 🎉`) : `${turn}'s turn`;
    if(w) over=true;
    root.querySelectorAll('.board button').forEach(btn=>btn.onclick=()=>{
      const i=+btn.dataset.i; if(b[i]||over) return;
      b[i]=turn; turn=turn==='X'?'O':'X';
      if(vsCpu && !winner(b)) cpu();
      render();
      if(vsCpu && winner(b)==='X') celebrate();
    });
  }
  function reset(){ b=Array(9).fill(''); turn='X'; over=false; render(); }
  root.querySelectorAll('.mode button').forEach(btn=>btn.onclick=()=>{
    vsCpu=btn.dataset.m==='cpu';
    root.querySelectorAll('.mode button').forEach(x=>x.classList.toggle('on',x===btn)); reset();
  });
  $('#re',root).onclick=reset; reset();
  return ()=>{};
}

/* ---------------- HANGMAN ---------------- */
const HWORDS=['WALKMAN','TAMAGOTCHI','DOORDARSHAN','SHAKTIMAN','GAMEBOY','POKEMON','CARTOON NETWORK','CASSETTE','PAGER','FLOPPY DISK','JOYSTICK','DEXTERS LABORATORY','POWER RANGERS','MOGLI','SCOOBY DOO','TELETUBBIES','SPACE JAM','JURASSIC PARK','TITANIC','BACKSTREET BOYS','SPICE GIRLS','HOTMAIL','NOKIA','ARCADE','COMPLAN','PARLE G','CHOCOLATE','TAZOS','BLACK CAT'];
function mountHangman(root){
  let word, hit, miss, over;
  root.innerHTML=`<div class="panel center">
    <svg id="hg" viewBox="0 0 160 170" width="160" height="170" fill="none" stroke="#444" stroke-width="4" stroke-linecap="round">
      <path d="M20 160H100M40 160V15H110V32"/>
      <g stroke="#d33a3a"><circle cx="110" cy="45" r="13"/><path d="M110 58V100"/><path d="M110 68L92 88"/><path d="M110 68L128 88"/><path d="M110 100L95 130"/><path d="M110 100L125 130"/></g>
    </svg>
    <div class="word" id="w"></div>
    <div class="msg" id="m"></div>
    <div class="keys" id="k"></div>
    <p><button id="re">New word</button></p>
  </div>`;
  const parts=[...root.querySelectorAll('#hg g > *')];
  function render(){
    parts.forEach((p,i)=>p.style.display=i<miss.size?'':'none');
    const ok=[...word].every(c=>c===' '||hit.has(c));
    over=ok||miss.size>=6;
    $('#w',root).textContent=[...word].map(c=>c===' '?'  ':hit.has(c)||(over&&!ok)?c:'_').join(' ');
    $('#m',root).textContent= ok?'You got it! 🎉' : miss.size>=6?'Hanged! Better luck next time 😬' : `${6-miss.size} chance${6-miss.size>1?'s':''} left. Hint: 90s stuff.`;
    $('#k',root).innerHTML=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(c=>`<button data-c="${c}" ${hit.has(c)||miss.has(c)||over?'disabled':''}>${c}</button>`).join('');
    root.querySelectorAll('#k button').forEach(b=>b.onclick=()=>guess(b.dataset.c));
  }
  function guess(c){ if(over||hit.has(c)||miss.has(c)) return; (word.includes(c)?hit:miss).add(c); render(); if(over&&[...word].every(x=>x===' '||hit.has(x))) celebrate(); }
  function reset(){ word=pick(HWORDS); hit=new Set(); miss=new Set(); over=false; render(); }
  const onKey=e=>{ if(!root.closest('.win')?.classList.contains('active')) return; if(/^[a-z]$/i.test(e.key)&&!e.metaKey&&!e.ctrlKey) guess(e.key.toUpperCase()); };
  document.addEventListener('keydown',onKey);
  $('#re',root).onclick=reset; reset();
  return ()=>document.removeEventListener('keydown',onKey);
}

/* ---------------- STONE PAPER SCISSORS ---------------- */
function mountRPS(root){
  const H=[['🪨','Stone'],['📄','Paper'],['✂️','Scissors']];
  let w=0,l=0,d=0;
  root.innerHTML=`<div class="panel center">
    <div class="score"><span>You <b id="w">0</b></span><span>Draw <b id="d">0</b></span><span>Computer <b id="l">0</b></span></div>
    <div class="big-emoji" id="face">✊</div>
    <div class="msg" id="m">Pick one. 1…2…3…</div>
    <div class="hand">${H.map((h,i)=>`<button data-i="${i}" title="${h[1]}">${h[0]}</button>`).join('')}</div>
  </div>`;
  root.querySelectorAll('.hand button').forEach(b=>b.onclick=()=>{
    const me=+b.dataset.i, cp=rnd(3), r=(me-cp+3)%3;
    $('#face',root).textContent=H[cp][0];
    if(r===0){ d++; $('#m',root).textContent=`Both ${H[me][1]}. Draw!`; }
    else if(r===1){ w++; if(w%3===0) celebrate();$('#m',root).textContent=`${H[me][1]} beats ${H[cp][1]}. You win!`; }
    else { l++; $('#m',root).textContent=`${H[cp][1]} beats ${H[me][1]}. Computer wins!`; }
    $('#w',root).textContent=w; $('#d',root).textContent=d; $('#l',root).textContent=l;
  });
  return ()=>{};
}

/* ---------------- NAME PLACE ANIMAL THING ---------------- */
function mountNPAT(root){
  const CATS=['Name','Place','Animal','Thing'], SECS=60;
  let timer, left, letter, running;
  root.innerHTML=`<div class="panel npat">
    <div class="letterBig" id="lt">?</div>
    <div class="bar"><i id="bar"></i></div>
    <div class="msg center" id="m">Fill all four starting with the letter. Beat the clock!</div>
    <div id="f">${CATS.map(c=>`<label>${c}</label><input type="text" data-c="${c}" disabled autocomplete="off" maxlength="30">`).join('')}</div>
    <p class="center"><button class="big" id="go">Start</button> <button id="stop" disabled>STOP!</button></p>
    <div id="res" class="center"></div>
  </div>`;
  const inputs=()=>[...root.querySelectorAll('#f input')];
  function start(){
    letter=pick([...'ABCDEFGHIJKLMNOPRSTW']); left=SECS; running=true;
    $('#lt',root).textContent=letter; $('#res',root).innerHTML='';
    inputs().forEach(i=>{i.value='';i.disabled=false;}); inputs()[0].focus();
    $('#go',root).disabled=true; $('#stop',root).disabled=false;
    $('#m',root).textContent=`${left}s left`;
    clearInterval(timer);
    timer=setInterval(()=>{ left--; $('#bar',root).style.width=(left/SECS*100)+'%'; $('#m',root).textContent=`${left}s left`; if(left<=0) stop(); },1000);
    $('#bar',root).style.width='100%';
  }
  function stop(){
    if(!running) return; running=false; clearInterval(timer);
    let pts=0;
    const rows=inputs().map(i=>{
      const v=i.value.trim(), ok=v.length>=2 && v[0].toUpperCase()===letter; if(ok) pts+=10; i.disabled=true;
      const s=document.createElement('div'); s.className=ok?'ok':'bad';
      s.textContent=`${i.dataset.c}: ${v||'—'} ${ok?'✔ +10':'✘ 0'}`; return s.outerHTML;
    }).join('');
    $('#res',root).innerHTML=`${rows}<h2>${pts}/40 ${pts===40?'🏆 Topper!':pts>=20?'👍':'😅'}</h2><small>Honor system: it only checks the starting letter. Let your friends argue the rest.</small>`;
    if(pts>=30) celebrate();
    $('#m',root).textContent='Time\'s up!'; $('#go',root).disabled=false; $('#go',root).textContent='Play again'; $('#stop',root).disabled=true;
  }
  $('#go',root).onclick=start; $('#stop',root).onclick=stop;
  return ()=>clearInterval(timer);
}

/* ---------------- DOTS & BOXES ---------------- */
function mountDots(root){
  const N=4, G=60, M=20, W=N*G+2*M;
  let h,v,own,turn,busy,timer,awarded;
  root.innerHTML=`<div class="panel center">
    <div class="score"><span>You <b id="a">0</b></span><span id="t"></span><span>Computer <b id="c">0</b></span></div>
    <svg id="svg" viewBox="0 0 ${W} ${W}" width="100%" style="max-width:340px"></svg>
    <p><button id="re">New game</button></p>
  </div>`;
  const sides=(r,c)=>h[r][c]+h[r+1][c]+v[r][c]+v[r][c+1];
  const adj=e=>(e.k==='h'?[[e.r-1,e.c],[e.r,e.c]]:[[e.r,e.c-1],[e.r,e.c]]).filter(([r,c])=>r>=0&&r<N&&c>=0&&c<N);
  function claim(e,who){
    (e.k==='h'?h:v)[e.r][e.c]=1; let got=0;
    adj(e).forEach(([r,c])=>{ if(!own[r][c]&&sides(r,c)===4){ own[r][c]=who; got++; } });
    return got;
  }
  function free(){
    const o=[];
    for(let r=0;r<=N;r++)for(let c=0;c<N;c++) if(!h[r][c]) o.push({k:'h',r,c});
    for(let r=0;r<N;r++)for(let c=0;c<=N;c++) if(!v[r][c]) o.push({k:'v',r,c});
    return o;
  }
  const full=()=>own.every(r=>r.every(Boolean));
  function render(){
    const a=own.flat().filter(x=>x===1).length, c=own.flat().filter(x=>x===2).length;
    $('#a',root).textContent=a; $('#c',root).textContent=c;
    $('#t',root).textContent= full()? (a>c?'You win! 🎉':a<c?'Computer wins 🤖':'Draw!') : (turn===1?'Your turn':'Thinking…');
    if(full()&&a>c&&!awarded){ awarded=true; celebrate(); }
    let s='';
    own.forEach((row,r)=>row.forEach((o,c)=>{ if(o) s+=`<rect x="${M+c*G+4}" y="${M+r*G+4}" width="${G-8}" height="${G-8}" fill="${o===1?'#bcd0ff':'#ffc6c6'}"/><text x="${M+c*G+G/2}" y="${M+r*G+G/2+9}" text-anchor="middle" font-family="VT323" font-size="28" fill="${o===1?'#1d3fbb':'#d33a3a'}">${o===1?'Y':'C'}</text>`; }));
    for(let r=0;r<=N;r++)for(let c=0;c<N;c++){
      const x=M+c*G,y=M+r*G; s+=`<line x1="${x}" y1="${y}" x2="${x+G}" y2="${y}" stroke="${h[r][c]?'#1d3fbb':'#ccc'}" stroke-width="${h[r][c]?5:3}" stroke-linecap="round"/>`;
      if(!h[r][c]) s+=`<line data-k="h" data-r="${r}" data-c="${c}" x1="${x+8}" y1="${y}" x2="${x+G-8}" y2="${y}" stroke="transparent" stroke-width="22" style="cursor:pointer"/>`;
    }
    for(let r=0;r<N;r++)for(let c=0;c<=N;c++){
      const x=M+c*G,y=M+r*G; s+=`<line x1="${x}" y1="${y}" x2="${x}" y2="${y+G}" stroke="${v[r][c]?'#1d3fbb':'#ccc'}" stroke-width="${v[r][c]?5:3}" stroke-linecap="round"/>`;
      if(!v[r][c]) s+=`<line data-k="v" data-r="${r}" data-c="${c}" x1="${x}" y1="${y+8}" x2="${x}" y2="${y+G-8}" stroke="transparent" stroke-width="22" style="cursor:pointer"/>`;
    }
    for(let r=0;r<=N;r++)for(let c=0;c<=N;c++) s+=`<circle cx="${M+c*G}" cy="${M+r*G}" r="5" fill="#444"/>`;
    $('#svg',root).innerHTML=s;
    root.querySelectorAll('#svg [data-k]').forEach(l=>l.onclick=()=>{
      if(busy||turn!==1||full()) return;
      const got=claim({k:l.dataset.k,r:+l.dataset.r,c:+l.dataset.c},1);
      if(!got) turn=2;
      render(); if(turn===2&&!full()) cpuTurn();
    });
  }
  function cpuTurn(){
    busy=true;
    timer=setTimeout(()=>{
      const f=free();
      let m=f.find(e=>adj(e).some(([r,c])=>!own[r][c]&&sides(r,c)===3));
      if(!m){ const safe=f.filter(e=>!adj(e).some(([r,c])=>sides(r,c)===2)); m=pick(safe.length?safe:f); }
      const got=claim(m,2);
      if(!got) turn=1;
      busy=false; render();
      if(turn===2&&!full()) cpuTurn();
    },500);
  }
  function reset(){
    clearTimeout(timer);
    h=Array.from({length:N+1},()=>Array(N).fill(0)); v=Array.from({length:N},()=>Array(N+1).fill(0));
    own=Array.from({length:N},()=>Array(N).fill(0)); turn=1; busy=false; awarded=false; render();
  }
  $('#re',root).onclick=reset; reset();
  return ()=>clearTimeout(timer);
}

const GAMES=[
  {id:'flames',wh:[500,470],f:'FLAMES.EXE',e:'🔥',n:'FLAMES',d:'Names + math = your destiny. The OG.',m:mountFlames},
  {id:'book-cricket',wh:[460,430],f:'BOOKCKT.EXE',e:'🏏',n:'Book Cricket',d:'Flip pages, score runs. Last bench special.',m:mountBookCricket},
  {id:'snake',wh:[400,600],f:'SNAKE.EXE',e:'🐍',n:'Snake',d:'Nokia 3310 vibes. Do not hit the wall.',m:mountSnake},
  {id:'xo',wh:[400,490],f:'XO.EXE',e:'❌',n:'Tic-Tac-Toe (XO)',d:'Noughts & crosses. Friend or computer.',m:mountTTT},
  {id:'npat',wh:[430,560],f:'NPAT.EXE',e:'✏️',n:'Name Place Animal Thing',d:'Random letter, 60 seconds. STOP!',m:mountNPAT},
  {id:'hangman',wh:[440,560],f:'HANGMAN.EXE',e:'🪢',n:'Hangman',d:'Guess the 90s word before you hang.',m:mountHangman},
  {id:'rps',wh:[400,360],f:'STONEPSR.EXE',e:'✂️',n:'Stone Paper Scissors',d:'Settle any argument. Fairly.',m:mountRPS},
  {id:'dots',wh:[400,540],f:'DOTS.EXE',e:'🔲',n:'Dots & Boxes',d:'Join dots, steal boxes. Back-page classic.',m:mountDots},
];
