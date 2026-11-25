// ===== Wire everything together and power on =====
GAMES.forEach(g=>{ APPS[g.id]={title:`${g.f} - ${g.n}`,icon:g.e,wh:g.wh,single:true,pad:true,mount:w=>g.m(w.body)}; });
ARCADE.forEach(g=>{ APPS[g.id]={title:g.n,icon:g.e,wh:g.wh,single:true,col:true,mount:w=>g.m(w)}; });
initFS(); initShell(); initDesktop(); initSecrets();
const deep=location.hash.slice(1);
boot(!deep).then(async()=>{ await askName(); Consent.maybeShow(); if(!deep) return; if(deep==='hof') openApp('halloffame'); else if(deep.startsWith('daily:')) openDaily(deep.slice(6)); else if(APPS[deep]) openApp(deep); });
