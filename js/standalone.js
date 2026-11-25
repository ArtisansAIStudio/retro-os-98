/* ===== Standalone game page: opens ONE game full-size in the page (no desktop). =====
   Page sets <body data-game="dirt">. Same scripts, storage, leaderboard, music and consent as the desktop. */
GAMES.forEach(g=>{ APPS[g.id]={title:`${g.f} - ${g.n}`,icon:g.e,wh:g.wh,single:true,pad:true,mount:w=>g.m(w.body)}; });
ARCADE.forEach(g=>{ APPS[g.id]={title:g.n,icon:g.e,wh:g.wh,single:true,col:true,mount:w=>g.m(w)}; });
document.body.classList.add('standalone');
(async()=>{
  const id=document.body.dataset.game, w=openApp(id); if(!w) return;
  focusWin(w);
  document.addEventListener('pointerdown',e=>{ if(e.target.closest('#desktop')&&active!==w) focusWin(w); });
  await askName(); Consent.maybeShow();
})();
