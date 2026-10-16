/* چوگان: میراث پارس — راه‌اندازی اصلی بازی */
(function(){
const U=CH.u;

/* صحنه منو */
CH.scenes.def.menu={
  enter(){
    CH.ui.show('scr-menu');
    CH.ui.hideHud();
    CH.ui.forceCloseDialog();
    CH.ui.hideModal('confirm-modal');
    CH.ui.hideModal('name-modal');
    CH.ui.hideModal('ad-modal');
    CH.ui.hideModal('scr-pause');
    CH.input.enable(false);
    CH.ui.refreshCoins();
    CH.ui.updateStoryBtn();
    CH.audio.music(true);
  },
  exit(){},
  update(dt){},
  render(ctx){ CH.G.menuBG(ctx,CH.now); }
};

/* صحنه داستان */
CH.scenes.def.story={
  enter(){
    CH.ui.hideAll();
    CH.story.sceneStart();
    CH.audio.music(true);
  },
  exit(){ CH.story.active=false; CH.audio.gallop(false); },
  update(dt){ if(!CH.storyPaused)CH.story.update(dt); },
  render(ctx){ if(CH.story.active)CH.story.render(ctx); }
};

/* صحنه مسابقه */
CH.scenes.def.match={
  enter(){},
  exit(){},
  update(dt){
    if(CH.match.active&&!CH.match.paused)CH.match.update(dt);
    CH.fx.update(dt);
    CH.ui.updateMatchHud();
  },
  render(ctx){ if(CH.match.active)CH.match.render(ctx); }
};

/* ---------- بوت ---------- */
function boot(){
  CH.cv=document.getElementById('cv');
  CH.ctx=CH.cv.getContext('2d');
  CH.save.load();
  CH.applyGfx(CH.save.d.set.gfx);
  CH.fit();
  window.addEventListener('resize',()=>{ CH.fit(); });
  CH.input.setup();
  CH.ui.bind();
  CH.world.buildBG();

  // آیکون بوت
  CH.G.emblem(document.getElementById('boot-cv'));

  // حلقه اصلی
  let last=performance.now();
  CH.now=0;
  function loop(t){
    let dt=(t-last)/1000; last=t;
    dt=Math.min(dt,0.05);
    CH.now=t/1000;
    const ctx=CH.ctx;
    const k=CH.view.k;
    ctx.setTransform(k,0,0,k,0,0);
    CH.scenes.update(dt);
    CH.scenes.render(ctx);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ورود به منو بعد از لود فونت (فقط یک‌بار!)
  let _bootDone=false;
  const toMenu=()=>{
    if(_bootDone)return;
    _bootDone=true;
    document.getElementById('scr-boot').classList.add('hidden');
    CH.scenes.set('menu');
  };
  if(document.fonts&&document.fonts.ready){
    document.fonts.ready.then(()=>setTimeout(toMenu,650));
    setTimeout(toMenu,2600); // مهلت اطمینان
  } else setTimeout(toMenu,900);

  // توقف هنگام خروج از تب
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){ CH.match.paused=true; }
    else if(CH.scenes.name==='match'){ CH.match.paused=false; }
  });

  // جلوگیری از اسکرول لمسی
  document.addEventListener('touchmove',(e)=>{ if(e.target.closest('.panel-body')===null)e.preventDefault(); },{passive:false});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();
})();
