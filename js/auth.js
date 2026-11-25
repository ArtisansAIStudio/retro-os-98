/* ===== Google sign-in through Supabase Auth (popup). Tokens stay in this browser only. ===== */
const Auth={
  base(){ return CFG.supabaseUrl.replace(/\/$/,''); },
  get(){ try{ return JSON.parse(store.get('auth98')||'null'); }catch(e){ return null; } },
  put(s){ store.set('auth98',s?JSON.stringify(s):''); },
  user(){ const s=this.get(); return s&&s.access_token?s:null; },
  /* a valid access token, refreshed when it is about to expire; null when logged out */
  async token(){
    const s=this.user(); if(!s) return null;
    if(s.expires_at*1000-Date.now()>60000) return s.access_token;
    try{
      const r=await fetch(this.base()+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{...keyHeaders(),'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});
      if(!r.ok) throw new Error('refresh failed');
      const j=await r.json(), n={...s,access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at||Math.floor(Date.now()/1000)+j.expires_in};
      this.put(n); return n.access_token;
    }catch(e){ this.put(null); return null; }
  },
  /* opens the Google sign-in popup; resolves with the session, or null if closed without signing in */
  login(){
    return new Promise(resolve=>{
      const rt=location.origin+location.pathname.replace(/[^/]*$/,'')+'auth.html';
      const w=window.open(this.base()+'/auth/v1/authorize?provider=google&redirect_to='+encodeURIComponent(rt),'b98login','width=480,height=640');
      if(!w){ resolve(null); return; }
      const t=setInterval(()=>{ const u=this.user(); if(u||w.closed){ clearInterval(t); try{ w.close(); }catch(e){} resolve(this.user()); } },400);
    });
  },
  logout(){ this.put(null); }
};
