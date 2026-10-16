/* چوگان: میراث پارس — رابط کاربری (منو، فروشگاه، تنظیمات، دیالوگ) */
(function(){
const U=CH.u;
const UI={hudZone:'story'};
CH.ui=UI;

UI.show=function(id){
  for(const s of document.querySelectorAll('.screen'))s.classList.add('hidden');
  document.getElementById(id).classList.remove('hidden');
};
UI.hideAll=function(){ for(const s of document.querySelectorAll('.screen'))s.classList.add('hidden'); };
UI.showModal=function(id){ document.getElementById(id).classList.remove('hidden'); };
UI.hideModal=function(id){ document.getElementById(id).classList.add('hidden'); };
UI.showHud=function(id){
  for(const h of document.querySelectorAll('.hud'))h.classList.add('hidden');
  document.getElementById(id).classList.remove('hidden');
};
UI.hideHud=function(){ for(const h of document.querySelectorAll('.hud'))h.classList.add('hidden'); };

UI.refreshCoins=function(){
  const c=U.fmt(CH.save.d.coins), g=U.fmt(CH.save.d.gems);
  document.getElementById('menu-coins').textContent=c;
  document.getElementById('menu-gems').textContent=g;
  document.getElementById('shop-coins').textContent=c;
  document.getElementById('shop-gems').textContent=g;
};

UI.setBtnA=function(label){
  const el=document.getElementById('btn-a-label');
  if(el)el.textContent=label;
};

/* ================= دیالوگ ================= */
let dlg={lines:null,i:0,cb:null,typing:false,charI:0,timer:null,done:false,last:null};
UI.isDialogOpen=function(){ return !document.getElementById('dlg').classList.contains('hidden'); };
/* آخرین انتخاب بازیکن در دیالوگ (برای چالش‌ها) */
UI.lastChoice=function(){ return dlg.last; };
UI.clearChoice=function(){ dlg.last=null; };
UI.forceCloseDialog=function(){
  clearInterval(dlg.timer);
  dlg.lines=null; dlg.cb=null; dlg.typing=false; dlg.last=null;
  document.getElementById('dlg').classList.add('hidden');
  document.getElementById('dlg-choices').classList.add('hidden');
  document.body.classList.remove('in-dialog');
};

UI.dialog=function(lines,i,cb){
  dlg.lines=lines; dlg.i=i||0; dlg.cb=cb; dlg.last=null;
  document.body.classList.add('in-dialog');
  const line=lines[dlg.i];
  document.getElementById('dlg').classList.remove('hidden');
  renderLine(line);
};
function renderLine(line){
  const nameEl=document.getElementById('dlg-name');
  const textEl=document.getElementById('dlg-text');
  const faceCv=document.getElementById('dlg-face');
  const nextEl=document.getElementById('dlg-next');
  // پاک‌سازی انتخاب‌های قدیمی (جلوگیری از کلیک فانتوم)
  const oldChoices=document.getElementById('dlg-choices');
  oldChoices.innerHTML=''; oldChoices.classList.add('hidden');
  const ch=CH.CHARS[line.s]||CH.CHARS.villager;
  // اسم
  if(line.s==='narr'||line.s==='sys'){ nameEl.textContent=line.s==='sys'?'':'روایت'; nameEl.classList.add('narr'); }
  else { nameEl.textContent=(line.s==='me'?(CH.save.d.name||'آرش'):ch.name); nameEl.classList.remove('narr'); }
  // پرتره
  if(line.s==='narr'||line.s==='sys'){ faceCv.parentElement.style.visibility='hidden'; }
  else { faceCv.parentElement.style.visibility='visible'; CH.G.portrait(faceCv.getContext('2d'),line.s==='me'?'me':line.s,224); }
  // متن با افکت تایپ
  const text=(line.t||'').replace(/\{name\}/g,CH.save.d.name||'آرش');
  textEl.textContent='';
  dlg.typing=true; dlg.charI=0; nextEl.style.opacity=0;
  if(line.s!=='narr'&&line.s!=='sys')CH.audio.vo(line.id);
  clearInterval(dlg.timer);
  dlg.timer=setInterval(()=>{
    dlg.charI+=1;
    textEl.textContent=text.slice(0,dlg.charI);
    if(dlg.charI%3===0)CH.audio.play('blip');
    if(dlg.charI>=text.length){ clearInterval(dlg.timer); dlg.typing=false; nextEl.style.opacity=1; showChoices(line); }
  },24);
  document.getElementById('dlg-choices').classList.add('hidden');
}
function showChoices(line){
  if(!line.choice)return;
  const box=document.getElementById('dlg-choices');
  box.innerHTML='';
  box.classList.remove('hidden');
  for(const opt of line.choice){
    const b=document.createElement('button');
    b.textContent=opt.t;
    b.onclick=(e)=>{
      e.stopPropagation();
      CH.audio.play('click');
      dlg.last=opt;
      box.classList.add('hidden');
      if(opt.fx&&opt.fx.coins){ CH.save.d.coins+=opt.fx.coins; CH.save.write(); UI.refreshCoins(); CH.audio.play('coin'); }
      // پاسخ انتخاب به عنوان خط بعدی
      const reply=[{s:line.s,t:opt.reply}];
      const rest=dlg.lines.slice(dlg.i+1);
      dlg.lines=reply.concat(rest); dlg.i=0;
      renderLine(dlg.lines[0]);
    };
    box.appendChild(b);
  }
}
UI.dialogAdvance=function(){
  if(!UI.isDialogOpen())return;
  if(dlg.typing){
    // پرش تایپ
    clearInterval(dlg.timer);
    const line=dlg.lines[dlg.i];
    const text=(line.t||'').replace(/\{name\}/g,CH.save.d.name||'آرش');
    document.getElementById('dlg-text').textContent=text;
    dlg.typing=false; document.getElementById('dlg-next').style.opacity=1;
    showChoices(line);
    return;
  }
  const line=dlg.lines[dlg.i];
  if(!line)return;
  if(line.choice&&!document.getElementById('dlg-choices').classList.contains('hidden'))return;
  dlg.i++;
  if(dlg.i>=dlg.lines.length){
    document.getElementById('dlg').classList.add('hidden');
    document.body.classList.remove('in-dialog');
    const cb=dlg.cb; dlg.cb=null;
    cb&&cb();
  } else renderLine(dlg.lines[dlg.i]);
};

/* ================= اسم بازیکن ================= */
UI.tempName='';
UI.nameModal=function(cb){
  UI.showModal('name-modal');
  const inp=document.getElementById('name-input');
  inp.value='';
  setTimeout(()=>inp.focus(),120);
  document.getElementById('name-ok').onclick=()=>{
    const v=inp.value.trim();
    if(v.length<2){ CH.toast('اسم باید حداقل ۲ حرف باشد!'); return; }
    UI.tempName=v;
    UI.hideModal('name-modal');
    CH.audio.play('quest');
    cb&&cb();
  };
  inp.onkeydown=(e)=>{ if(e.key==='Enter')document.getElementById('name-ok').click(); };
};

/* ================= کارت فصل ================= */
UI.chapterCard=function(ch,title,cb){
  const el=document.getElementById('chapter-card');
  document.getElementById('cc-ch').textContent=ch;
  document.getElementById('cc-title').textContent=title;
  el.classList.remove('hidden');
  CH.audio.play('quest');
  let closed=false;
  const close=()=>{ if(closed)return; closed=true; el.classList.add('hidden'); el.onclick=null; cb&&cb(); };
  el.onclick=close;
  setTimeout(close,2600);
};

/* ================= HUD مسابقه ================= */
UI.matchHud=function(on,cfg){
  if(on){
    UI.showHud('hud-match');
    UI.hudZone='match';
    document.getElementById('mt-a-name').textContent=cfg.myTeam||'تیم تو';
    document.getElementById('mt-b-name').textContent=cfg.team;
    document.getElementById('mt-a-dot').style.background='#1ba894';
    document.getElementById('mt-b-dot').style.background=cfg.col||'#c0603a';
    document.getElementById('mt-env').textContent=cfg.title||cfg.env;
    UI.updateMatchHud();
  } else {
    UI.hideHud();
  }
};
UI.updateMatchHud=function(){
  const M=CH.match; if(!M.cfg)return;
  document.getElementById('mt-a-score').textContent=U.toFa(M.score.a);
  document.getElementById('mt-b-score').textContent=U.toFa(M.score.b);
  const t=Math.max(0,Math.ceil(M.time));
  document.getElementById('mt-timer').textContent=U.toFa(Math.floor(t/60))+':'+U.toFa(String(t%60).padStart(2,'0'));
};

/* ================= نتیجه ================= */
UI.showResult=function(res){
  const stars=res.win?res.stars:0;
  document.getElementById('res-title').textContent=res.draw?'مساوی!':(res.win?'پیروزی!':'باختی!');
  document.getElementById('res-title').classList.toggle('lose',!res.win&&!res.draw);
  document.getElementById('res-score').textContent=U.toFa(res.scoreA)+' — '+U.toFa(res.scoreB);
  const se=document.getElementById('res-stars');
  se.innerHTML=stars?('<b>'+'★'.repeat(stars)+'</b>'+'<span>'+'★'.repeat(3-stars)+'</span>'):'<span>★ ★ ★</span>';
  // پاداش
  let coins=0, extra='';
  if(res.cfg.context==='arcade'){
    if(res.win){ coins=80+res.cfg.n*22+stars*30;
      const a=CH.save.d.arcade;
      a.stars[res.cfg.n]=Math.max(a.stars[res.cfg.n]||0,stars);
      if(res.cfg.n>=a.unlocked&&res.cfg.n<CH.LEVELS.length)a.unlocked=res.cfg.n+1;
      CH.save.write();
    }
  }
  document.getElementById('res-reward').textContent=coins?('+'+U.fmt(coins)+' سکه'):(res.win?'مأموریت داستانی':'دوباره تلاش کن!');
  if(coins){ CH.save.d.coins+=coins; CH.save.write(); CH.audio.play('coin'); }
  UI.show('scr-result');
  UI.hideHud();
  CH.input.enable(false);
  document.getElementById('res-ok').onclick=()=>{
    CH.audio.play('click');
    const cfg=res.cfg;
    if(cfg.context==='story'){
      UI.hideAll();
      CH.scenes.set('story');
      CH.ui.showHud('hud-story');
      CH.ui.hudZone='story';
      CH.input.enable(true);
      CH.ui.setBtnA('صحبت');
      if(res.win)CH.story.storyMatchEnd({win:true,cfg});
      else { CH.toast('باختی! برای تلاش دوباره به زمین طلایی برگرد'); }
    } else {
      UI.show('scr-levels');
      UI.renderLevels();
    }
  };
};

/* ================= مراحل ================= */
UI.renderLevels=function(){
  const grid=document.getElementById('levels-grid');
  grid.innerHTML='';
  const a=CH.save.d.arcade;
  for(const L of CH.LEVELS){
    const locked=L.n>a.unlocked;
    const card=document.createElement('div');
    card.className='lvl-card'+(locked?' locked':'');
    const stars=a.stars[L.n]||0;
    card.innerHTML=`
      <div class="lvl-num">مرحلهٔ ${U.toFa(L.n)}</div>
      <div class="lvl-name">${L.name}</div>
      <div class="lvl-stars">${'<b>★</b>'.repeat(stars)}${`<span class="off">★</span>`.repeat(3-stars)}</div>
      <div class="lvl-badge">.vs ${L.team}</div>
      ${locked?'<div class="lvl-lock">🔒</div>':''}`;
    if(!locked)card.onclick=()=>{
      CH.audio.play('click');
      UI.hideAll();
      CH.match.start(Object.assign({},L,{context:'arcade',myTeam:'تیم تو'}));
    };
    grid.appendChild(card);
  }
};

/* ================= فروشگاه ================= */
UI.shopTab='mallets';
UI.renderShop=function(){
  const grid=document.getElementById('shop-grid');
  grid.innerHTML='';
  const s=CH.save.d;
  const tab=UI.shopTab;
  if(tab==='mallets'||tab==='horses'||tab==='outfits'){
    const items=tab==='mallets'?CH.SHOP.mallets:(tab==='horses'?CH.SHOP.horses:Object.entries(CH.SHOP.outfits).map(([id,o])=>Object.assign({id},o)));
    const ownedList=tab==='mallets'?s.owned.mallets:(tab==='horses'?s.owned.horses:s.owned.outfits);
    const eqKey=tab==='mallets'?'mallet':(tab==='horses'?'horse':'outfit');
    for(const it of items){
      const owned=ownedList.includes(it.id);
      const equipped=s.equipped[eqKey]===it.id;
      const card=document.createElement('div');
      card.className='shop-card'+(equipped?' equipped':'');
      const th=document.createElement('div'); th.className='shop-thumb';
      const cv=document.createElement('canvas'); cv.width=120; cv.height=86;
      th.appendChild(cv); card.appendChild(th);
      if(tab==='mallets')CH.G.itemIcon(cv,'mallet',it);
      else if(tab==='horses')CH.G.itemIcon(cv,'horse',it);
      else CH.G.itemIcon(cv,'outfit',it);
      const nm=document.createElement('div'); nm.className='shop-name'; nm.textContent=it.name; card.appendChild(nm);
      // آمار
      const st=document.createElement('div'); st.className='shop-stats';
      if(it.pow)st.innerHTML=`<span class="stat-chip">قدرت ×${U.toFa(it.pow.toFixed(2))}</span><span class="stat-chip">دقت ×${U.toFa(it.acc.toFixed(2))}</span>`;
      if(it.spd)st.innerHTML=`<span class="stat-chip">سرعت ×${U.toFa(it.spd.toFixed(2))}</span><span class="stat-chip">استقامت ×${U.toFa((it.stam||1).toFixed(2))}</span>`;
      if(it.robe)st.innerHTML=`<span class="stat-chip">${it.desc}</span>`;
      card.appendChild(st);
      // دکمه
      const btn=document.createElement('button');
      btn.className='shop-buy';
      if(equipped){ btn.classList.add('equipped'); btn.textContent='✓ سوار است'; btn.disabled=true; }
      else if(owned){ btn.classList.add('equip'); btn.textContent='انتخاب'; btn.onclick=()=>{
        s.equipped[eqKey]=it.id; CH.save.write(); CH.audio.play('pop');
        if(eqKey==='horse'){ CH.bigNote('سوار بر '+it.name+'!',1300); }
        else CH.toast('«'+it.name+'» انتخاب شد');
        UI.renderShop();
      }; }
      else {
        const gem=it.gem;
        btn.classList.add('buy'); if(gem)btn.classList.add('gem');
        btn.innerHTML=(gem?(U.toFa(it.price)+' <span style="font-size:11px">الماس</span>'):(U.fmt(it.price)+' <span style="font-size:11px">سکه</span>'));
        btn.onclick=()=>UI.buyItem(it,eqKey);
      }
      card.appendChild(btn);
      grid.appendChild(card);
    }
  } else if(tab==='iap'){
    // کارت تبلیغ جایزه‌دار — تماشای تبلیغ، گرفتن سکه
    const adCard=document.createElement('div');
    adCard.className='shop-card ad-card';
    const aic=document.createElement('div'); aic.className='ad-ic';
    const acv=document.createElement('canvas'); acv.width=64; acv.height=64;
    aic.appendChild(acv); adCard.appendChild(aic);
    CH.G.itemIcon(acv,'reward',{});
    const atx=document.createElement('div'); atx.className='ad-txt';
    atx.innerHTML='<div class="shop-name">تبلیغ جایزه‌دار 🎁</div><div class="ad-desc">یک آگهی کوتاه ببین و ۱۰۰ سکه بگیر — هر ۳ دقیقه یک‌بار!</div>';
    adCard.appendChild(atx);
    const abtn=document.createElement('button');
    abtn.className='shop-buy buy';
    abtn.textContent='▶ تماشای تبلیغ';
    abtn.onclick=()=>UI.rewardedAd();
    adCard.appendChild(abtn);
    grid.appendChild(adCard);
    for(const it of CH.SHOP.iap){
      const card=document.createElement('div');
      card.className='shop-card';
      const th=document.createElement('div'); th.className='shop-thumb';
      const cv=document.createElement('canvas'); cv.width=120; cv.height=86;
      th.appendChild(cv); card.appendChild(th);
      CH.G.itemIcon(cv,'iap',it);
      const nm=document.createElement('div'); nm.className='shop-name'; nm.textContent=it.name; card.appendChild(nm);
      const ds=document.createElement('div'); ds.className='hint'; ds.style.textAlign='center'; ds.textContent=it.desc; card.appendChild(ds);
      const btn=document.createElement('button');
      btn.className='shop-buy buy gem demo';
      btn.textContent=it.priceLabel+' — خرید آزمایشی';
      btn.onclick=()=>UI.iapBuy(it);
      card.appendChild(btn);
      grid.appendChild(card);
    }
    const note=document.createElement('p');
    note.className='hint'; note.style.gridColumn='1/-1'; note.style.textAlign='center';
    note.textContent='⚡ خرید درون‌برنامه‌ای در نسخهٔ اندروید پس از اتصال درگاه پرداخت (بازار/پلی) فعال می‌شود — فعلاً حالت آزمایشی است و آیتم‌ها را رایگان می‌دهد. تبلیغ جایزه‌دار هم فعلاً شبیه‌سازی شده است.';
    grid.appendChild(note);
  }
};

/* ---------- تبلیغ جایزه‌دار ---------- */
UI.adBusy=false; UI._adIv=null;
UI.rewardedAd=function(){
  if(UI.adBusy)return;
  const s=CH.save.d;
  const left=Math.ceil((180000-(Date.now()-(s.adT||0)))/1000);
  if(left>0){ CH.toast('هر ۳ دقیقه یک‌بار! ('+U.toFa(left)+' ثانیه دیگر)'); CH.audio.play('fail'); return; }
  UI.adBusy=true;
  UI.showModal('ad-modal');
  document.getElementById('ad-reward').classList.add('hidden');
  document.getElementById('ad-cancel').classList.remove('hidden');
  let n=5;
  const cnt=document.getElementById('ad-count');
  cnt.textContent=U.toFa(n);
  clearInterval(UI._adIv);
  UI._adIv=setInterval(()=>{
    n--;
    if(n<=0){
      clearInterval(UI._adIv); UI._adIv=null;
      cnt.textContent='✓';
      document.getElementById('ad-reward').classList.remove('hidden');
      document.getElementById('ad-cancel').classList.add('hidden');
    } else cnt.textContent=U.toFa(n);
  },1000);
};
UI.adGrant=function(){
  clearInterval(UI._adIv); UI._adIv=null;
  UI.hideModal('ad-modal'); UI.adBusy=false;
  CH.save.d.coins+=100; CH.save.d.adT=Date.now(); CH.save.write();
  UI.refreshCoins(); CH.audio.play('coin'); CH.fx.confetti(40);
  CH.toast('+۱۰۰ سکه از تبلیغ جایزه‌دار!');
};
UI.adCancel=function(){
  clearInterval(UI._adIv); UI._adIv=null;
  UI.hideModal('ad-modal'); UI.adBusy=false;
  CH.audio.play('click');
};

UI.buyItem=function(it,eqKey){
  const s=CH.save.d;
  const gem=it.gem;
  const balance=gem?s.gems:s.coins;
  if(balance<it.price){ CH.toast(gem?'الماس کافی نداری! از تب خرید الماس بگیر':'سکه کافی نداری! مسابقه ببر و سکه جمع کن'); CH.audio.play('fail'); return; }
  CH.confirm('خرید '+it.name,'با '+(gem?U.toFa(it.price)+' الماس':U.fmt(it.price)+' سکه')+' خریده می‌شود. مطمئنی؟',()=>{
    if(gem)s.gems-=it.price; else s.coins-=it.price;
    if(eqKey==='mallet')s.owned.mallets.push(it.id);
    else if(eqKey==='horse')s.owned.horses.push(it.id);
    else s.owned.outfits.push(it.id);
    s.equipped[eqKey]=it.id;
    CH.save.write(); UI.refreshCoins(); CH.audio.play(gem?'gem':'coin'); CH.toast('«'+it.name+'» خریدی و سوار شد!');
    UI.renderShop();
  });
};

/* خرید درون‌برنامه‌ای (آزمایشی — آماده اتصال به درگاه) */
UI.iapBuy=function(it){
  CH.confirm('خرید درون‌برنامه‌ای',it.name+' — '+it.priceLabel+(CH.isAndroid?' (پرداخت واقعی)':' (حالت آزمایشی)'),()=>{
    const grant=()=>{
      if(it.kind==='coins'){ CH.save.d.coins+=it.amount; CH.audio.play('coin'); }
      else if(it.kind==='gems'){ CH.save.d.gems+=it.amount; CH.audio.play('gem'); }
      else if(it.kind==='noads'){ CH.toast('تبلیغات حذف شد (آزمایشی)'); }
      if(it.bonus&&!CH.save.d.owned.outfits.includes(it.bonus)){ CH.save.d.owned.outfits.push(it.bonus); }
      CH.save.write(); UI.refreshCoins();
      CH.toast('✓ '+it.name+' اهدا شد'+(CH.isAndroid?'':' (آزمایشی)'));
    };
    if(CH.bridge&&CH.bridge.purchase){
      try{ CH.bridge.purchase(it.id); }catch(e){}
      grant();
    } else grant();
  });
};

/* ================= اتصال منوها ================= */
UI.bind=function(){
  const $=id=>document.getElementById(id);
  $('btn-story').onclick=()=>{ CH.audio.play('click'); CH.story.enter(); };
  $('btn-arcade').onclick=()=>{ CH.audio.play('click'); UI.show('scr-levels'); UI.renderLevels(); };
  $('btn-shop').onclick=()=>{ CH.audio.play('click'); UI.show('scr-shop'); UI.refreshCoins(); UI.renderShop(); };
  $('btn-settings').onclick=()=>{ CH.audio.play('click'); UI.show('scr-settings'); UI.syncSettings(); };
  $('btn-about').onclick=()=>{ CH.audio.play('click'); UI.show('scr-about'); };

  for(const el of document.querySelectorAll('[data-close]')){
    el.onclick=()=>{ CH.audio.play('click'); CH.scenes.set('menu'); };
  }

  // تب‌ها
  const bindTabs=(tabId,renderFn)=>{
    const tabs=document.getElementById(tabId);
    tabs.querySelectorAll('button').forEach(b=>{
      b.onclick=()=>{
        tabs.querySelectorAll('button').forEach(x=>x.classList.remove('on'));
        b.classList.add('on');
        CH.audio.play('click');
        if(renderFn)renderFn(b.dataset.tab);
        else {
          const page=b.dataset.tab;
          document.querySelectorAll('#about-body .tab-page').forEach(p=>p.classList.toggle('hidden',p.dataset.page!==page));
        }
      };
    });
  };
  bindTabs('about-tabs');
  bindTabs('shop-tabs',(t)=>{ UI.shopTab=t; UI.renderShop(); });

  // تنظیمات
  $('seg-gfx').querySelectorAll('button').forEach(b=>b.onclick=()=>{
    CH.save.d.set.gfx=b.dataset.v; CH.save.write();
    CH.applyGfx(b.dataset.v); UI.syncSettings(); CH.audio.play('click');
  });
  $('rng-music').oninput=(e)=>{ CH.save.d.set.music=e.target.value/100; CH.audio.applyVol(); CH.save.write(); };
  $('rng-sfx').oninput=(e)=>{ CH.save.d.set.sfx=e.target.value/100; CH.audio.applyVol(); CH.save.write(); CH.audio.play('click'); };
  $('seg-vib').querySelectorAll('button').forEach(b=>b.onclick=()=>{ CH.save.d.set.vibrate=b.dataset.v==='1'; CH.save.write(); UI.syncSettings(); CH.vibrateTap(); });
  $('seg-joy').querySelectorAll('button').forEach(b=>b.onclick=()=>{ CH.save.d.set.joySide=b.dataset.v; CH.save.write(); CH.input.refreshSide(); UI.syncSettings(); });
  $('btn-reset').onclick=()=>CH.confirm('پاک کردن پیشرفت','همهٔ سکه‌ها، خریدها و پیشرفت داستان پاک می‌شود. مطمئنی؟',()=>{
    CH.save.reset(); CH.toast('پیشرفت پاک شد'); UI.refreshCoins(); UI.updateStoryBtn();
  });

  // دیالوگ: کلیک برای ادامه
  document.getElementById('dlg').onclick=(e)=>{
    if(e.target.closest('.dlg-choices'))return;
    UI.dialogAdvance();
  };
  window.addEventListener('keydown',(e)=>{
    if(e.code==='Space'||e.code==='Enter')UI.dialogAdvance();
  });

  // توقف مسابقه / بخش داستانی
  $('btn-pause').onclick=()=>{ CH.audio.play('click'); CH.match.paused=true; $('pause-title').textContent='توقف مسابقه'; $('btn-restart').style.display=''; UI.showModal('scr-pause'); };
  $('btn-story-pause').onclick=()=>{ CH.audio.play('click'); CH.storyPaused=true; $('pause-title').textContent='بخش داستانی'; $('btn-restart').style.display='none'; UI.showModal('scr-pause'); };
  $('btn-resume').onclick=()=>{ CH.audio.play('click'); UI.hideModal('scr-pause'); CH.match.paused=false; CH.storyPaused=false; };
  $('btn-restart').onclick=()=>{
    CH.audio.play('click'); UI.hideModal('scr-pause');
    if(CH.match.cfg){ const c=Object.assign({},CH.match.cfg); CH.match.stop(); CH.match.start(c); }
  };
  $('btn-quit').onclick=()=>{
    CH.audio.play('click'); UI.hideModal('scr-pause');
    CH.match.stop(); CH.storyPaused=false;
    if(CH.story&&CH.story.abortAll)CH.story.abortAll();
    UI.forceCloseDialog();
    UI.hideModal('confirm-modal');
    UI.hideHud(); UI.hideAll();
    CH.input.enable(false);
    CH.scenes.set('menu');
  };

  // لینک کانال روبیکا (در اندروید از پل استفاده کن)
  const rb=document.getElementById('rubika-link');
  if(rb)rb.addEventListener('click',(e)=>{
    if(CH.isAndroid&&CH.bridge&&CH.bridge.openUrl){
      e.preventDefault();
      try{ CH.bridge.openUrl('https://rubika.ir/Amirhosin_studio'); }catch(err){ window.open('https://rubika.ir/Amirhosin_studio','_blank'); }
    }
    CH.audio.play('click');
  });

  // تبلیغ جایزه‌دار
  $('ad-reward').onclick=()=>{ UI.adGrant(); };
  $('ad-cancel').onclick=()=>{ UI.adCancel(); };
};

/* ================= تنظیمات sync ================= */
UI.syncSettings=function(){
  const s=CH.save.d.set;
  document.querySelectorAll('#seg-gfx button').forEach(b=>b.classList.toggle('on',b.dataset.v===s.gfx));
  document.getElementById('rng-music').value=Math.round(s.music*100);
  document.getElementById('rng-sfx').value=Math.round(s.sfx*100);
  document.querySelectorAll('#seg-vib button').forEach(b=>b.classList.toggle('on',(b.dataset.v==='1')===s.vibrate));
  document.querySelectorAll('#seg-joy button').forEach(b=>b.classList.toggle('on',b.dataset.v===s.joySide));
};

UI.updateStoryBtn=function(){
  const st=CH.save.d.story;
  const el=document.getElementById('story-state');
  if(!el)return;
  el.textContent=st.done?'پایان — بازدید آزاد':(st.introSeen?('ادامه: فصل '+U.toFa(CH.QUESTS[st.ch].ch)):'شروع ماجرا');
};
})();
