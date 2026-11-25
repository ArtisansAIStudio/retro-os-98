// Shared game rules + score verification. Runs in the browser AND on the server (Supabase Edge Function).
// Single source of truth: after editing, run `cp js/sim.js supabase/functions/_shared/sim.js`.
(function(G){
  const mulberry32=a=>()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return((t^t>>>14)>>>0)/4294967296; };
  const seedFrom=s=>{ let h=2166136261; for(const c of String(s)){ h^=c.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; };
  const GAMES=['snake','drop','turbo','maze3d','mines-b','mines-i','mines-e','cricket','dirt'];
  const DAILY_GAMES=['snake','drop','mines-i'];
  const LV={b:[9,9,10],i:[16,16,40],e:[30,16,99]};   // [cols, rows, mines]
  const SNAKE_N=15, SNAKE_TICK_MS=115;

  /* ---- Snake: inputs are one direction char per tick ---- */
  function snakeReplay(seed,dirs){
    const V={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]}, O={u:'d',d:'u',l:'r',r:'l'}, N=SNAKE_N, rng=mulberry32(seed);
    let snake=[[7,7],[6,7],[5,7]], dir='r', score=0, food;
    const place=()=>{ do{ food=[Math.floor(rng()*N),Math.floor(rng()*N)]; }while(snake.some(s=>s[0]===food[0]&&s[1]===food[1])); }; place();
    for(let t=0;t<dirs.length;t++){
      const d=dirs[t]; if(!V[d]) return {ok:false,reason:'bad input'}; if(d===O[dir]) return {ok:false,reason:'impossible turn'}; dir=d;
      const h=[snake[0][0]+V[d][0],snake[0][1]+V[d][1]];
      if(h[0]<0||h[1]<0||h[0]>=N||h[1]>=N||snake.some(s=>s[0]===h[0]&&s[1]===h[1])) return {ok:true,dead:true,score,ticks:t+1};
      snake.unshift(h); if(h[0]===food[0]&&h[1]===food[1]){ score++; place(); } else snake.pop();
    }
    return {ok:true,dead:false,score,ticks:dirs.length};
  }

  /* ---- Minesweeper: seeded layout, first click never a mine ---- */
  function mineSet(seed,total,M,first){
    const r=mulberry32(seed), m=new Uint8Array(total); let left=M;
    while(left){ const k=Math.floor(r()*total); if(!m[k]){ m[k]=1; left--; } }
    if(m[first]){ m[first]=0; for(let j=0;j<total;j++) if(!m[j]&&j!==first){ m[j]=1; break; } }
    return m;
  }
  function minesReplay(seed,level,log){
    const L=LV[level]; if(!L) return {ok:false,reason:'bad level'}; const [C,R,M]=L, total=R*C;
    const cells=Array.from({length:total},()=>({m:0,o:0,f:0,n:0}));
    const nb=i=>{ const x=i%C,y=(i/C)|0,o=[]; for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){ if(!dx&&!dy) continue; const a=x+dx,b=y+dy; if(a>=0&&b>=0&&a<C&&b<R) o.push(b*C+a); } return o; };
    let started=false, opened=0, over=false, win=false, tFirst=0, tWin=0, last=-1, tLast=0;
    const reveal=i=>{ const st=[i]; while(st.length){ const k=st.pop(), c=cells[k]; if(c.o||c.f) continue; c.o=1; opened++; if(!c.n&&!c.m) nb(k).forEach(j=>!cells[j].o&&st.push(j)); } };
    if(!Array.isArray(log)||log.length<1||log.length>5000) return {ok:false,reason:'bad log'};
    for(const ev of log){
      if(!Array.isArray(ev)||ev.length!==3) return {ok:false,reason:'bad event'};
      const [t,ty,i]=ev;
      if(!Number.isInteger(t)||!Number.isInteger(i)||i<0||i>=total) return {ok:false,reason:'bad event'};
      if(last>=0&&(t<last||t-last<20)) return {ok:false,reason:'impossible click timing'};
      last=t; tLast=t; if(over) break;
      if(ty==='f'){ if(!cells[i].o) cells[i].f^=1; continue; }
      if(ty!=='l') return {ok:false,reason:'bad event'};
      const c=cells[i];
      if(c.o&&c.n){ const fl=nb(i).filter(j=>cells[j].f).length; if(fl===c.n) nb(i).forEach(j=>{ if(!cells[j].f&&!cells[j].o){ if(cells[j].m) over=true; else reveal(j); } }); }
      else if(!c.o&&!c.f){
        if(!started){ started=true; tFirst=t; const m=mineSet(seed,total,M,i); cells.forEach((q,k)=>q.m=m[k]); cells.forEach((q,k)=>q.n=nb(k).filter(j=>cells[j].m).length); }
        if(c.m){ c.o=1; over=true; } else reveal(i);
      }
      if(!over&&opened===total-M){ over=true; win=true; tWin=t; }
    }
    return win?{ok:true,win:true,ms:tWin-tFirst,span:tLast-(log[0][0])}:{ok:true,win:false};
  }

  /* ---- server-side check of one submission ---- */
  const MIN_SECS={b:1,i:5,e:25};
  function verify({tok,body,now,today}){
    const bad=reason=>({ok:false,reason});
    if(!tok||!body||typeof body!=='object') return bad('malformed');
    const game=body.game; if(!GAMES.includes(game)) return bad('unknown game');
    if(tok.g!==game) return bad('token does not match game');
    const age=now-tok.t; if(!(age>=0)||age>3*3600e3) return bad('run expired');
    let daily=null; if(body.daily){ if(body.daily!==today||!DAILY_GAMES.includes(game)) return bad('invalid daily'); daily=body.daily; }
    const seed=daily?seedFrom(today+game):tok.s, sc=body.score; let score;
    if(game==='snake'){
      const log=typeof body.log==='string'?body.log:''; if(log.length<1||log.length>30000) return bad('missing replay');
      const r=snakeReplay(seed,log); if(!r.ok) return bad(r.reason); if(!r.dead) return bad('run not finished');
      if(r.score<1) return bad('no score'); if(sc!==r.score) return bad('score does not match replay');
      if(r.ticks*SNAKE_TICK_MS>age+800) return bad('faster than real time'); score=r.score;
    } else if(game.startsWith('mines-')){
      const lv=game.slice(6), r=minesReplay(seed,lv,body.log); if(!r.ok) return bad(r.reason); if(!r.win) return bad('not a win');
      const secs=Math.max(1,Math.floor(r.ms/1000)); if(Math.abs(sc-secs)>2) return bad('time does not match replay');
      if(r.span>age+1500) return bad('faster than real time'); if(secs<MIN_SECS[lv]) return bad('implausible time'); score=secs;
    } else if(game==='drop'){
      if(!Number.isInteger(sc)||sc<1) return bad('bad score'); const es=age/1000; if(es<3||sc>250*es) return bad('implausible score'); score=sc;
    } else if(game==='turbo'){
      if(!Number.isInteger(sc)||sc<49000) return bad('implausible time'); if(sc>age+2000) return bad('faster than real time'); score=sc;
    } else if(game==='dirt'){
      if(!Number.isInteger(sc)||sc<20000) return bad('implausible time'); if(sc>age+2000) return bad('faster than real time'); score=sc;
    } else if(game==='maze3d'){
      if(!Number.isInteger(sc)||sc<15) return bad('implausible time'); if(sc>age/1000+2) return bad('faster than real time'); score=sc;
    } else if(game==='cricket'){
      if(!Number.isInteger(sc)||sc<1||sc>72) return bad('bad score'); if(age<4000) return bad('too fast'); score=sc;
    }
    return {ok:true,score,daily};
  }

  G.SIM={mulberry32,seedFrom,GAMES,DAILY_GAMES,LV,SNAKE_TICK_MS,snakeReplay,mineSet,minesReplay,verify};
})(typeof globalThis!=='undefined'?globalThis:window);
