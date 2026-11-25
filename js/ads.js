/* ===== Ads: one vertical rail on the right edge of wide screens. Off until ADS.enabled is true. =====
   The rail shrinks the desktop (never overlaps windows or games). Hidden on narrow screens.
   Loads Google's script ONLY if the visitor accepted ads (Consent.allows('ads')); removes the rail if they change their mind.
   To switch on after AdSense approval: set client + slot below, enabled:true. */
const ADS={enabled:false,client:'ca-pub-6986502229939809',slot:'',minWidth:1100,railW:180};
(()=>{
  let loaded=false;
  const css=document.createElement('style');
  css.textContent=`body.ads-on #desktop{right:${ADS.railW}px}#adrail{position:fixed;right:0;top:0;bottom:var(--tray);width:${ADS.railW}px;background:#c0c0c0;box-shadow:inset 1px 0 #fff,inset 2px 0 #dfdfdf;z-index:50;display:none;flex-direction:column;align-items:center;padding:6px 0;overflow:hidden}body.ads-on #adrail{display:flex}#adrail small{font:10px Tahoma,sans-serif;color:#555;margin-bottom:4px}#adrail ins{display:block;width:160px;height:600px}`;
  document.head.appendChild(css);
  function sync(){
    const want=ADS.enabled&&ADS.slot&&Consent.allows('ads')&&innerWidth>=ADS.minWidth;
    let rail=document.getElementById('adrail');
    if(!want){ document.body.classList.remove('ads-on'); if(rail) rail.remove(); return; }
    if(!rail){ rail=document.createElement('div'); rail.id='adrail'; rail.innerHTML=`<small>Advertisement</small><ins class="adsbygoogle" data-ad-client="${ADS.client}" data-ad-slot="${ADS.slot}"></ins>`; document.body.appendChild(rail); }
    document.body.classList.add('ads-on');
    if(!loaded){ loaded=true; const s=document.createElement('script'); s.async=true; s.crossOrigin='anonymous'; s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+ADS.client; s.onload=()=>{ try{ (window.adsbygoogle=window.adsbygoogle||[]).push({}); }catch(e){} }; document.head.appendChild(s); }
  }
  Consent.onChange(sync); addEventListener('resize',sync); sync();
})();
