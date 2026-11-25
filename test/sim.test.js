// Run: node test/sim.test.js
const fs=require('fs'), assert=require('assert');
require('../js/sim.js'); const S=globalThis.SIM;
let n=0; const t=(name,fn)=>{ try{ fn(); n++; console.log('ok  ',name); }catch(e){ console.error('FAIL',name,'\n    ',e.message); process.exitCode=1; } };
const NOW=1_800_000_000_000, TODAY=new Date(NOW).toISOString().slice(0,10);
const tok=(g,age,seed=12345)=>({g,s:seed,t:NOW-age,n:'x'});
const V=(game,age,body,seed)=>S.verify({tok:tok(game,age,seed),body:{game,...body},now:NOW,today:TODAY});

t('both Edge Functions embed the current sim.js (run node scripts/build-functions.js if this fails)',()=>{ const sim=fs.readFileSync('js/sim.js','utf8'); for(const n of ['start-run','submit-score']) assert(fs.readFileSync(`supabase/functions/${n}/index.ts`,'utf8').includes(sim),n); });

/* ---- snake: a simple legal run (loop around, eat what it can, then hit the wall) ---- */
function playSnake(seed){
  let dirs='', best=null;
  // greedy bot: head toward food each tick, avoid reversing, stop when it dies
  const rng=S.mulberry32(seed); let snake=[[7,7],[6,7],[5,7]],dir='r',food,score=0;
  const V4={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]},O={u:'d',d:'u',l:'r',r:'l'};
  const place=()=>{ do{ food=[Math.floor(rng()*15),Math.floor(rng()*15)]; }while(snake.some(s=>s[0]===food[0]&&s[1]===food[1])); }; place();
  for(let i=0;i<400;i++){
    const h=snake[0], opts=['u','d','l','r'].filter(d=>d!==O[dir]).map(d=>{ const x=h[0]+V4[d][0],y=h[1]+V4[d][1]; const safe=x>=0&&y>=0&&x<15&&y<15&&!snake.some(s=>s[0]===x&&s[1]===y); return {d,x,y,safe,dist:Math.abs(x-food[0])+Math.abs(y-food[1])}; });
    const ok=opts.filter(o=>o.safe).sort((a,b)=>a.dist-b.dist); const m=i>=150?opts.find(o=>o.d===dir):(ok[0]||opts[0]); dirs+=m.d; dir=m.d;
    if(!m.safe) break; snake.unshift([m.x,m.y]); if(m.x===food[0]&&m.y===food[1]){ score++; place(); } else snake.pop();
  }
  return {dirs,score};
}
const run=playSnake(777), rep=S.snakeReplay(777,run.dirs);
t('snake replay agrees with an independent simulation',()=>{ assert(rep.ok&&rep.dead); assert.strictEqual(rep.score,run.score); assert(rep.score>=3); });
const age=rep.ticks*S.SNAKE_TICK_MS+5000;
t('snake: legit run accepted',()=>{ const r=V('snake',age,{score:rep.score,log:run.dirs},777); assert(r.ok,r.reason); assert.strictEqual(r.score,rep.score); });
t('snake: inflated score rejected',()=>assert(!V('snake',age,{score:rep.score+5,log:run.dirs},777).ok));
t('snake: console-faked score with no replay rejected',()=>assert(!V('snake',age,{score:200}).ok));
t('snake: replay for the wrong seed rejected',()=>assert(!V('snake',age,{score:rep.score,log:run.dirs},778).ok||rep.score===S.snakeReplay(778,run.dirs).score&&false));
t('snake: faster-than-real-time rejected',()=>assert(!V('snake',1000,{score:rep.score,log:run.dirs},777).ok));
t('snake: 180-degree turn rejected',()=>assert(!V('snake',99999,{score:1,log:'rl'},1).ok));
t('snake: unfinished run rejected',()=>{ const r=S.snakeReplay(1,'r'); assert(r.ok&&!r.dead); assert(!V('snake',99999,{score:0,log:'r'},1).ok); });
t('token for another game rejected',()=>assert(!S.verify({tok:tok('drop',9e4),body:{game:'snake',score:5,log:run.dirs},now:NOW,today:TODAY}).ok));
t('expired token rejected',()=>assert(!V('snake',4*3600e3,{score:rep.score,log:run.dirs},777).ok));
t('future-dated token rejected',()=>assert(!V('snake',-5000,{score:rep.score,log:run.dirs},777).ok));
t('daily uses the public date seed, not the token seed',()=>{
  const ds=S.seedFrom(TODAY+'snake'), rr=playSnake(ds), rp=S.snakeReplay(ds,rr.dirs);
  const r=V('snake',rp.ticks*S.SNAKE_TICK_MS+5000,{score:rp.score,log:rr.dirs,daily:TODAY},999); assert(r.ok,r.reason); assert.strictEqual(r.daily,TODAY);
  assert(!V('snake',9e5,{score:rp.score,log:rr.dirs,daily:'2020-01-01'},999).ok,'wrong date');
});

/* ---- minesweeper: a perfect-knowledge player (cheats by peeking at the layout, but plays legit moves) ---- */
function winMines(seed,lv,gap){
  const [C,R,M]=S.LV[lv], total=C*R, first=0, m=S.mineSet(seed,total,M,first), log=[]; let t0=100000;
  // click the safe cells in order; flood fill reveals most, we simply click every safe cell
  for(let i=0;i<total;i++) if(!m[i]){ log.push([t0,'l',i]); t0+=gap; }
  return log;
}
const mlog=winMines(4242,'b',400);
t('mines: legit win accepted, server computes the time',()=>{ const r=S.minesReplay(4242,'b',mlog); assert(r.win); const secs=Math.max(1,Math.floor(r.ms/1000)); const v=V('mines-b',r.span+3000,{score:secs,log:mlog},4242); assert(v.ok,v.reason); assert.strictEqual(v.score,secs); });
t('mines: faked time rejected',()=>{ const r=S.minesReplay(4242,'b',mlog); const secs=Math.max(1,Math.floor(r.ms/1000)); assert(!V('mines-b',r.span+3000,{score:Math.max(1,secs-30),log:mlog},4242).ok); });
t('mines: a log with no win rejected',()=>assert(!V('mines-b',99999,{score:5,log:mlog.slice(0,5)},4242).ok));
t('mines: auto-clicker (<20ms between clicks) rejected',()=>assert(!V('mines-b',99999,{score:1,log:winMines(4242,'b',5)},4242).ok));
t('mines: layout differs for another seed so a recycled log fails',()=>assert(!V('mines-b',99999,{score:3,log:mlog},4243).ok));
t('mines: blowing up is not a win',()=>{ const m=S.mineSet(4242,81,10,0); const bomb=m.findIndex((x,i)=>x&&i!==0); const r=S.minesReplay(4242,'b',[[1000,'l',0],[1500,'l',bomb]]); assert(!r.win); });
t('mines: expert faster than the world record rejected',()=>{ const lg=winMines(9,'e',50); const r=S.minesReplay(9,'e',lg); assert(r.win&&r.ms<25000); assert(!V('mines-e',r.span+3000,{score:Math.max(1,Math.floor(r.ms/1000)),log:lg},9).ok); });

/* ---- time/score bounded games ---- */
t('drop: believable score accepted',()=>assert(V('drop',120e3,{score:8000}).ok));
t('drop: absurd score rejected',()=>assert(!V('drop',30e3,{score:900000}).ok));
t('drop: score with no play time rejected',()=>assert(!V('drop',1000,{score:50}).ok));
t('turbo: real 3-lap time accepted',()=>assert(V('turbo',70e3,{score:62000}).ok));
t('turbo: impossible time rejected',()=>assert(!V('turbo',70e3,{score:30000}).ok));
t('turbo: claiming longer than elapsed rejected',()=>assert(!V('turbo',20e3,{score:60000}).ok));
t('maze: believable clear time accepted',()=>assert(V('maze3d',90e3,{score:60}).ok));
t('maze: 5-second "clear" rejected',()=>assert(!V('maze3d',90e3,{score:5}).ok));
t('cricket: >72 runs rejected',()=>assert(!V('cricket',60e3,{score:99}).ok));
t('cricket: instant submit rejected',()=>assert(!V('cricket',1000,{score:20}).ok));
t('unknown game rejected',()=>assert(!S.verify({tok:tok('hack',9e4),body:{game:'hack',score:1},now:NOW,today:TODAY}).ok));
console.log(`\n${n} checks passed`);
