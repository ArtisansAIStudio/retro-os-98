/* ===== Retro cartridge look for every game =====
   Canvas games: chunky pixels + scanlines, applied after each frame by the shared loop().
   Other games: a dark cartridge frame and pixel font (CSS class "cart" on the window). */
const Retro=(()=>{
  let on=store.get('retro98')!=='0';
  const line=document.createElement('canvas'); line.width=1; line.height=3; { const l=line.getContext('2d'); l.fillStyle='rgba(0,0,0,.2)'; l.fillRect(0,2,1,1); }
  function setup(w){
    const cv=w.body.querySelector('canvas'); let c=null;
    try{ const g=cv&&cv.getContext('2d'); if(g){ c={cv,g,o:document.createElement('canvas'),w:0,h:0}; c.og=c.o.getContext('2d'); c.pat=g.createPattern(line,'repeat'); } }catch(e){ c=null; }
    return c; }
  function post(w){
    if(!on) return; if(w._rc===undefined) w._rc=setup(w); const c=w._rc; if(!c) return;
    const {cv,g}=c, W=cv.width, H=cv.height, f=W>=400?2:1;
    if(c.w!==W||c.h!==H){ c.w=W; c.h=H; c.o.width=Math.ceil(W/f); c.o.height=Math.ceil(H/f); c.pat=g.createPattern(line,'repeat'); }
    if(f>1){ c.og.drawImage(cv,0,0,c.o.width,c.o.height); g.imageSmoothingEnabled=false; g.drawImage(c.o,0,0,W,H); }
    g.fillStyle=c.pat; g.fillRect(0,0,W,H);
  }
  const ids=()=>new Set([...GAMES.map(g=>g.id),...ARCADE.map(g=>g.id),'mines','sol']);
  function tag(){ const s=ids(); wins.forEach(w=>{ if(w.el) w.el.classList.toggle('cart',on&&s.has(w.id)); }); }
  function toggle(){ on=!on; store.set('retro98',on?'1':'0'); wins.forEach(w=>{ w._rc=undefined; }); tag(); }
  setInterval(tag,400);
  return {post,toggle,get on(){return on;}};
})();
