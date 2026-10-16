/* چوگان: میراث پارس — بخش داستانی (جهان، دیالوگ، مأموریت) */
(function(){
const U=CH.u, TAU=Math.PI*2;
const S={active:false};
CH.story=S;

S.player={x:340,y:640,ang:0,gallop:0,speed:0,swing:0,swingHit:false,vx:0,vy:0};
S.cam={x:340,y:640};

/* ---------- NPC ها ---------- */
S.npcs=[
  {id:'grand',x:300,y:452,look:{head:'turban',robe:'#7a5a3e',hat:'#8a6a4a',skin:'#e0b088',hair:'#555',beard:'#dcdcdc'}},
  {id:'mother',x:225,y:812,look:{head:'scarf',robe:'#8a4a5a',hat:'#8a3a4a',skin:'#f0c098',hair:'#241608',female:true}},
  {id:'amir',x:700,y:640,look:{head:'cap',robe:'#b8452a',hat:'#b8452a',skin:'#eab98c',hair:'#1a1008'}},
  {id:'tahmineh',x:910,y:1024,look:{head:'scarf',robe:'#2e5a3c',hat:'#2e5a3c',skin:'#dca878',hair:'#1a1008',female:true}},
  {id:'villager1',x:760,y:360,look:{head:'cap',robe:'#3d7a6e',hat:'#6a5a3a',skin:'#e0b088',hair:'#241608'}},
  {id:'villager2',x:390,y:950,look:{head:'turban',robe:'#7a6a4a',hat:'#6a5a3a',skin:'#d8a878',hair:'#241608',beard:'#333'}},
  {id:'khosrow',x:1955,y:545,look:{head:'turban',robe:'#3a4a6a',hat:'#3a4a6a',skin:'#d8a878',hair:'#333',beard:'#4a4a4a'}},
  {id:'golnar',x:2140,y:660,look:{head:'scarf',robe:'#b8862a',hat:'#b8862a',skin:'#f0c098',hair:'#2a1a0c',female:true}},
  {id:'sassan',x:2040,y:760,look:{head:'cap',robe:'#2a2a3e',hat:'#1c1c28',skin:'#e8c0a0',hair:'#101018'}},
];
S.hay=[]; // یونجه‌های مأموریت
S.practice=null; // تمرین فعال

/* ---------- ورود به داستان ---------- */
S.enter=function(){
  CH.ui.hudZone='story';
  CH.scenes.set('story');
};
S.sceneStart=function(){
  S.active=true;
  const s=CH.save.d;
  CH.ui.showHud('hud-story');
  CH.ui.setBtnA('صحبت');
  CH.input.enable(true);
  CH.input.refreshSide();
  if(!s.name){ CH.ui.nameModal(()=>{ s.name=CH.ui.tempName||'آرش'; CH.save.write(); S.beginQuestFlow(); }); }
  else S.beginQuestFlow();
};
S.beginQuestFlow=function(){
  const s=CH.save.d;
  if(s.story.introSeen){ S.applyStep(); }
  else {
    s.story.introSeen=true; CH.save.write();
    // کارت فصل ۱ و شروع
    CH.ui.chapterCard('فصل ۱','رویای چوگان',()=>{ S.applyStep(); });
  }
  S.updateStoryState();
};

S.updateStoryState=function(){
  const st=CH.save.d.story;
  document.getElementById('story-state').textContent=st.done?'پایان (بازدید آزاد)':('فصل '+U.toFa(CH.QUESTS[st.ch].ch)+' — '+CH.QUESTS[st.ch].title);
};

/* ---------- اجرای مرحله مأموریت ---------- */
S.cur=function(){ const st=CH.save.d.story; const q=CH.QUESTS[st.ch]; return q?q.steps[st.step]:null; };

S.applyStep=function(){
  const st=CH.save.d.story;
  const q=CH.QUESTS[st.ch];
  if(!q){ S.freeRoam(); return; }
  const step=q.steps[st.step];
  S.clearPractice(); S.hay=[];
  if(!step){ S.nextStep(); return; }
  switch(step.type){
    case 'dialog':
      S.setObj('…');
      setTimeout(()=>S.say(step.lines,()=>{
        if(step.after==='finish')S.finishStory();
        else S.nextStep();
      }),420);
      break;
    case 'talk':
      S.setObj(step.obj);
      break;
    case 'collect':
      S.setObj(step.obj);
      S.hay=[
        {x:690,y:1180,got:false},{x:1010,y:1260,got:false},{x:560,y:1330,got:false}
      ];
      CH.toast('یونجه‌ها را در دشت پایین دهکده پیدا کن!');
      break;
    case 'targets':
      S.setObj(step.obj);
      S.startPractice(step);
      break;
    case 'match':
      S.setObj(step.obj);
      S.pendingMatch=step;
      CH.toast('برای مسابقه، روی زمین طلایی بایست و ضربه بزن!');
      break;
    case 'reach':
      S.setObj(step.obj);
      break;
  }
};

S.nextStep=function(){
  const st=CH.save.d.story;
  const q=CH.QUESTS[st.ch];
  st.step++;
  if(st.step>=q.steps.length){
    st.ch++; st.step=0;
    if(st.ch>=CH.QUESTS.length){ S.finishStory(); return; }
    const nq=CH.QUESTS[st.ch];
    CH.ui.chapterCard('فصل '+U.toFa(nq.ch),nq.title,()=>{});
    S.player.x=340; S.player.y=640;
  }
  CH.save.write();
  S.updateStoryState();
  S.applyStep();
};

S.finishStory=function(){
  const st=CH.save.d.story;
  st.done=true; CH.save.write();
  CH.fx.confetti(120);
  CH.audio.play('quest');
  CH.ui.chapterCard('پایان','چوگان‌باز حرفه‌ای پارس',()=>{});
  S.updateStoryState();
  S.freeRoam();
};

S.freeRoam=function(){
  S.setObj('داستان به پایان رسید — آزادانه بگرد و با همه صحبت کن!');
};

S.setObj=function(t){ const el=document.getElementById('obj-text'); if(el)el.textContent=t; };

/* ---------- تمرین‌ها ---------- */
S.startPractice=function(step){
  const area=CH.world.zones[step.area];
  const mode=step.goal?'goal':(step.onFoot?'ball':'ride');
  const rings=[];
  const n=step.n;
  for(let i=0;i<n;i++){
    const t=(i+1)/(n+1);
    rings.push({
      x:U.clamp(area.x+area.w*(0.18+0.64*t),area.x+60,area.x+area.w-60),
      y:U.clamp(area.y+area.h*(0.35+0.3*Math.sin(i*2.1)),area.y+60,area.y+area.h-60),
      r:44,hit:false,pop:0
    });
  }
  S.practice={
    step,area,mode,n,count:0,
    rings,
    ball:{x:area.x+area.w/2,y:area.y+area.h/2,vx:0,vy:0},
    time:step.time||0,elapsed:0,failed:false
  };
  if(mode==='goal'){
    // دروازهٔ تمرین سمت شرق زمین
    S.practice.goal={x:area.x+area.w-6,y:area.y+area.h/2,w:150};
    rings.length=0;
  }
  if(step.lines)setTimeout(()=>S.say(step.lines,()=>{}),300);
};

S.clearPractice=function(){ S.practice=null; };

S.updatePractice=function(dt){
  const P=S.practice; if(!P)return;
  const b=P.ball, pl=S.player;
  if(P.time>0){
    P.elapsed+=dt;
    const left=P.time-P.elapsed;
    S.setObj('در '+U.toFa(Math.ceil(Math.max(0,left)))+' ثانیه '+U.toFa(P.n)+' گل بزن ('+U.toFa(P.count)+')');
    if(left<=0&&P.count<P.n){ P.failed=true; S.failPractice(); return; }
  }
  // فیزیک توپ تمرین
  if(P.mode!=='ride'){
    b.x+=b.vx*dt; b.y+=b.vy*dt;
    const fr=Math.exp(-1.3*dt); b.vx*=fr; b.vy*=fr;
    // دیواره ناحیه
    const m=26;
    if(b.x<P.area.x+m){b.x=P.area.x+m;b.vx=Math.abs(b.vx)*.7;}
    if(b.x>P.area.x+P.area.w-m){b.x=P.area.x+P.area.w-m;b.vx=-Math.abs(b.vx)*.7;
      if(P.mode==='goal'&&Math.abs(b.y-P.goal.y)<P.goal.w/2){ S.scoreGoal(); }
    }
    if(b.y<P.area.y+m){b.y=P.area.y+m;b.vy=Math.abs(b.vy)*.7;}
    if(b.y>P.area.y+P.area.h-m){b.y=P.area.y+P.area.h-m;b.vy=-Math.abs(b.vy)*.7;}
    // دریبل
    const d=U.dist(pl.x,pl.y,b.x,b.y);
    if(d<34&&pl.speed<40){ b.vx=pl.vx*1.05; b.vy=pl.vy*1.05; }
    // حلقه‌ها
    if(P.mode==='ball'){
      for(const rg of P.rings){
        if(!rg.hit&&Math.hypot(b.x-rg.x,b.y-rg.y)<rg.r*0.7&&Math.hypot(b.vx,b.vy)>60){
          rg.hit=true; rg.pop=1; P.count++;
          CH.audio.play('pop'); CH.fx.burst(rg.x,rg.y,'#8ff0dd',14);
          S.checkPracticeDone();
        }
      }
    }
  } else {
    // سواری از میان حلقه‌ها
    for(const rg of P.rings){
      if(!rg.hit&&U.dist(pl.x,pl.y,rg.x,rg.y)<rg.r*0.75){
        rg.hit=true; rg.pop=1; P.count++;
        CH.audio.play('pop'); CH.fx.burst(rg.x,rg.y,'#8ff0dd',14);
        S.checkPracticeDone();
      }
    }
  }
  for(const rg of P.rings)rg.pop=Math.max(0,rg.pop-dt*1.4);
};
S.scoreGoal=function(){
  const P=S.practice;
  P.count++;
  CH.audio.play('goal'); CH.fx.burst(P.goal.x,P.goal.y,'#ffd97a',18);
  CH.bigNote('گل! ('+U.toFa(P.count)+' از '+U.toFa(P.n)+')',900);
  P.ball={x:P.area.x+P.area.w/2,y:P.area.y+P.area.h/2,vx:0,vy:0};
  S.checkPracticeDone();
};
S.checkPracticeDone=function(){
  const P=S.practice; if(!P)return;
  if(P.count>=P.n){
    const st=CH.save.d.story;
    const rw=P.step.reward||{coins:50};
    st.targetsHit=(st.targetsHit||0)+P.n;
    CH.save.d.coins+=rw.coins||0;
    CH.audio.play('quest');
    CH.toast('مأموریت انجام شد! +'+U.toFa(rw.coins||0)+' سکه');
    CH.ui.refreshCoins();
    CH.save.write();
    S.practice=null;
    S.nextStep();
  }
};
S.failPractice=function(){
  S.clearPractice();
  CH.audio.play('fail');
  CH.bigNote('وقت تمام شد!',1200);
  const st=CH.save.d.story;
  CH.save.write();
  setTimeout(()=>{
    CH.confirm('دوباره تلاش کن!','استاد خسرو منتظر نمی‌ماند. آماده‌ای?',()=>{
      S.applyStep();
    });
  },900);
};

/* ---------- دیالوگ ---------- */
S.say=function(lines,cb){
  if(!lines||!lines.length){ cb&&cb(); return; }
  CH.ui.dialog(lines,0,cb);
};

/* ---------- به‌روزرسانی ---------- */
S.update=function(dt){
  if(!S.active)return;
  const P=S.player, s=CH.save.d;
  if(CH.ui.isDialogOpen()){ CH.fx.update(dt); return; }
  const mv=CH.input.move();
  const sprint=CH.input.held.b;
  const sp=(s.story.hasHorse?300:190)*(sprint?1.25:1);
  P.vx=U.lerp(P.vx,mv.x*sp,1-Math.exp(-8*dt));
  P.vy=U.lerp(P.vy,mv.y*sp,1-Math.exp(-8*dt));
  P.x+=P.vx*dt; P.y+=P.vy*dt;
  P.speed=Math.hypot(P.vx,P.vy);
  if(P.speed>15)P.ang+=U.angDiff(P.ang,Math.atan2(P.vy,P.vx))*Math.min(1,12*dt);
  P.gallop+=dt*(1+P.speed/(s.story.hasHorse?110:70));
  // برخورد با ساختمان‌ها
  const r=16;
  for(const sol of CH.world.solids){
    const cx=U.clamp(P.x,sol.x,sol.x+sol.w), cy=U.clamp(P.y,sol.y,sol.y+sol.h);
    const dx=P.x-cx, dy=P.y-cy, d=Math.hypot(dx,dy);
    if(d<r){
      if(d>0.01){ P.x=cx+dx/d*r; P.y=cy+dy/d*r; }
      else P.y=sol.y-r;
      P.vx*=.6; P.vy*=.6;
    }
  }
  P.x=U.clamp(P.x,30,CH.world.w-30);
  P.y=U.clamp(P.y,30,CH.world.h-30);
  // صدای گالوپ
  CH.audio.gallop(s.story.hasHorse&&P.speed>200);
  CH.audio.updateGallop(dt);
  // swing
  if(P.swing>0){ P.swing+=dt/0.3; if(P.swing>=1)P.swing=0; }
  // تمرین
  S.updatePractice(dt);
  // دوربین
  S.cam.x=U.lerp(S.cam.x,P.x,1-Math.exp(-5*dt));
  S.cam.y=U.lerp(S.cam.y,P.y,1-Math.exp(-5*dt));
  S.cam.x=U.clamp(S.cam.x,CH.view.w/2-60,CH.world.w-CH.view.w/2+60);
  S.cam.y=U.clamp(S.cam.y,CH.view.h/2-60,CH.world.h-CH.view.h/2+60);
  CH.fx.update(dt);
  // نشانگر مرحله
  S.marker=S.markerTarget();
};

S.markerTarget=function(){
  const st=CH.save.d.story, q=CH.QUESTS[st.ch], step=q&&q.steps[st.step];
  if(!step)return null;
  switch(step.type){
    case 'talk':{ const npc=S.npcs.find(n=>n.id===step.npc); return npc?{x:npc.x,y:npc.y}:null; }
    case 'collect':{ const h=S.hay.find(h=>!h.got); return h?{x:h.x,y:h.y}:null; }
    case 'targets':{ const a=CH.world.zones[step.area]; return {x:a.x+a.w/2,y:a.y+a.h/2}; }
    case 'match': return {x:540,y:1120};
    case 'reach': return {x:step.x,y:step.y};
    default: return null;
  }
};

/* ---------- تعامل ---------- */
S.nearest=function(){
  const P=S.player; let best=null,bd=95;
  for(const n of S.npcs){
    if(n.id==='sassan'&&!(CH.save.d.story.ch>=3))continue;
    const d=U.dist(P.x,P.y,n.x,n.y);
    if(d<bd){bd=d;best={type:'npc',ref:n};}
  }
  for(const h of S.hay){
    if(h.got)continue;
    const d=U.dist(P.x,P.y,h.x,h.y);
    if(d<bd){bd=d;best={type:'hay',ref:h};}
  }
  return best;
};

S.interact=function(){
  if(S.practice&&S.practice.mode==='goal')return; // در تمرین دروازه تعامل نداریم
  const st=CH.save.d.story, q=CH.QUESTS[st.ch], step=q&&q.steps[st.step];
  // مسابقه از نشانگر زمین (قبل از جستجوی نزدیک‌ترین)
  if(step&&step.type==='match'&&U.dist(S.player.x,S.player.y,540,1120)<130){
    S.startPendingMatch(); return;
  }
  const t=S.nearest(); if(!t)return;
  if(t.type==='hay'){
    t.ref.got=true;
    CH.audio.play('coin'); CH.fx.burst(t.ref.x,t.ref.y,'#d8b860',12);
    const left=S.hay.filter(h=>!h.got).length;
    if(left>0)CH.toast('یونجه برداشته شد! '+U.toFa(left)+' تای دیگر مانده');
    else { CH.toast('همهٔ یونجه‌ها آماده است — ببر پیش تهمینه!'); S.nextStep(); }
    return;
  }
  const n=t.ref;
  if(step&&step.type==='talk'&&step.npc===n.id){
    S.say(step.lines,()=>{
      if(step.give==='horse'&&!CH.save.d.story.hasHorse){
        CH.save.d.story.hasHorse=true;
        if(!CH.save.d.owned.horses.includes('badba'))CH.save.d.owned.horses.push('badba');
        CH.save.d.equipped.horse='badba';
        CH.save.write();
        CH.fx.burst(S.player.x,S.player.y-30,'#8ff0dd',20);
      }
      S.nextStep();
    });
    return;
  }
  // محاوره محیطی
  const amb=CH_STORY_DATA.ambient[n.id];
  const lines=amb?[{s:n.id,t:U.pick(amb)}]:null;
  if(n.id==='grand'&&st.ch===0){ S.say(CH_STORY_DATA.ch1_grand.slice(6,8),()=>{}); return; }
  if(lines)S.say(lines,()=>{});
};

S.startPendingMatch=function(){
  const pm=S.pendingMatch; if(!pm)return;
  S.setObj(pm.obj);
  CH.confirm('زمین چوگان آماده است!',pm.cfg.title+' — آماده‌ای؟',()=>{
    CH.match.start(Object.assign({},pm.cfg,{
      context:'story',
      reward:pm.reward,
      onEnd:(res)=>{ S.storyMatchEnd(res); }
    }));
  });
};

S.storyMatchEnd=function(res){
  const st=CH.save.d.story;
  const cfg=res.cfg||{};
  const rw=cfg.reward||{};
  if(res.win){
    CH.save.d.coins+=rw.coins||0;
    if(rw.gems)CH.save.d.gems+=rw.gems;
    CH.save.write(); CH.ui.refreshCoins();
    CH.audio.play('quest');
    if(st.ch===2)S.say(CH_STORY_DATA.ch3_win,()=>S.nextStep());
    else if(st.ch===3)S.say(CH_STORY_DATA.ch4_duel_win,()=>S.nextStep());
    else if(st.ch===4)S.say(CH_STORY_DATA.ch5_win,()=>S.nextStep());
    else S.nextStep();
  } else {
    if(st.ch===4)S.say(CH_STORY_DATA.ch5_lose,()=>{});
    CH.toast('باختی! از نشانگر زمین، دوباره شروع کن');
  }
};

/* ---------- ضربه (تمرین و زمین) ---------- */
S.trySwing=function(){
  const P=S.player;
  if(P.swing>0)return;
  P.swing=0.001;
  CH.audio.play('swing');
  const pr=S.practice;
  setTimeout(()=>{
    if(pr&&pr.mode!=='ride'){
      const b=pr.ball;
      if(U.dist(P.x,P.y,b.x,b.y)<64){
        const goal=pr.goal;
        let dir=P.ang;
        if(goal){
          const ga=Math.atan2(goal.y+U.rand(-40,40)-b.y,goal.x-b.x);
          const mallet=CH.SHOP.mallets.find(m=>m.id===CH.save.d.equipped.mallet);
          const acc=(mallet?mallet.acc:1);
          if(Math.abs(U.angDiff(dir,ga))<1.2)dir=U.lerp(dir,dir+U.angDiff(dir,ga),U.clamp((acc-0.8)*0.5,0,0.4));
        }
        const mallet2=CH.SHOP.mallets.find(m=>m.id===CH.save.d.equipped.mallet);
        const pow=480*(mallet2?mallet2.pow:1);
        b.vx=Math.cos(dir)*pow+P.vx*.4; b.vy=Math.sin(dir)*pow+P.vy*.4;
        CH.audio.play('hit'); CH.fx.burst(b.x,b.y,'#ffe9a8',10);
      }
    }
  },110);
};

/* ---------- رندر ---------- */
S.render=function(ctx){
  const bg=CH.world.bg();
  const sc=CH.world.BG_SCALE;
  // پس‌زمینه
  ctx.drawImage(bg,
    (S.cam.x-CH.view.w/2)*sc,(S.cam.y-CH.view.h/2)*sc,CH.view.w*sc,CH.view.h*sc,
    0,0,CH.view.w,CH.view.h);
  ctx.save();
  ctx.translate(CH.view.w/2-S.cam.x,CH.view.h/2-S.cam.y);
  const t=CH.now;
  // محدودهٔ دید
  const vx0=S.cam.x-CH.view.w/2-80, vx1=S.cam.x+CH.view.w/2+80;
  const vy0=S.cam.y-CH.view.h/2-80, vy1=S.cam.y+CH.view.h/2+80;
  const vis=(x,y)=>x>vx0&&x<vx1&&y>vy0&&y<vy1;

  // یونجه
  for(const h of S.hay){
    if(h.got||!vis(h.x,h.y))continue;
    ctx.fillStyle='#d8b860';
    ctx.save(); ctx.translate(h.x,h.y);
    ctx.rotate(Math.sin(t*2+h.x)*0.08);
    ctx.beginPath(); ctx.ellipse(0,0,16,11,0.3,0,TAU); ctx.fill();
    ctx.strokeStyle='rgba(140,100,30,.7)'; ctx.lineWidth=2; ctx.stroke();
    ctx.restore();
    const pu=(Math.sin(t*4)+1)/2;
    ctx.strokeStyle='rgba(232,184,75,'+(0.4+pu*0.4).toFixed(2)+')'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(h.x,h.y,26+pu*5,0,TAU); ctx.stroke();
  }

  // تمرین: حلقه‌ها و توپ و دروازه
  const pr=S.practice;
  if(pr){
    for(const rg of pr.rings){
      if(!vis(rg.x,rg.y))continue;
      ctx.save(); ctx.translate(rg.x,rg.y);
      const rr2=rg.r*(1+rg.pop*0.35);
      ctx.strokeStyle=rg.hit?'rgba(232,184,75,.9)':'rgba(143,240,221,.85)';
      ctx.lineWidth=rg.hit?6:4;
      ctx.beginPath(); ctx.arc(0,0,rr2,0,TAU); ctx.stroke();
      if(!rg.hit){ ctx.rotate(t); ctx.strokeStyle='rgba(143,240,221,.4)'; ctx.setLineDash([12,10]);
        ctx.beginPath(); ctx.arc(0,0,rr2-9,0,TAU); ctx.stroke(); ctx.setLineDash([]); }
      else { ctx.fillStyle='rgba(232,184,75,.25)'; ctx.beginPath(); ctx.arc(0,0,rr2*0.8,0,TAU); ctx.fill(); }
      ctx.restore();
    }
    if(pr.mode!=='ride'){
      CH.G.ball(ctx,pr.ball.x,pr.ball.y,13,t,null);
      if(pr.goal){
        const g=pr.goal;
        ctx.save(); ctx.translate(g.x,g.y);
        for(const sy of [-g.w/2,g.w/2]){
          ctx.fillStyle='#6b4a2a'; ctx.beginPath(); ctx.arc(0,sy,8,0,TAU); ctx.fill();
          ctx.fillStyle='#c8433a';
          const wob=Math.sin(t*4+sy)*5;
          ctx.beginPath(); ctx.moveTo(14,sy); ctx.quadraticCurveTo(34,sy-6+wob,50,sy-2+wob); ctx.lineTo(50,sy+10+wob); ctx.quadraticCurveTo(34,sy+8+wob,14,sy+12); ctx.closePath(); ctx.fill();
        }
        ctx.strokeStyle='rgba(255,240,200,.8)'; ctx.lineWidth=3; ctx.setLineDash([10,7]);
        ctx.beginPath(); ctx.moveTo(0,-g.w/2); ctx.lineTo(0,g.w/2); ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
      }
    }
  }

  // نشانگر مأموریت
  if(S.marker&&!CH.ui.isDialogOpen()){
    const m=S.marker, pu=(Math.sin(t*3.4)+1)/2;
    if(vis(m.x,m.y)){
      ctx.strokeStyle='rgba(232,184,75,'+(0.5+pu*0.4).toFixed(2)+')'; ctx.lineWidth=4;
      ctx.beginPath(); ctx.arc(m.x,m.y,30+pu*10,0,TAU); ctx.stroke();
      ctx.fillStyle='rgba(232,184,75,.95)';
      const by=m.y-46-Math.abs(Math.sin(t*3.4))*10;
      ctx.beginPath(); ctx.arc(m.x,by,13,0,TAU); ctx.fill();
      ctx.fillStyle='#3d2a00'; ctx.font='bold 17px Vazirmatn'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('!',m.x,by+1);
    }
  }

  // NPC ها
  for(const n of S.npcs){
    if(n.id==='sassan'&&!(CH.save.d.story.ch>=3||CH.save.d.story.done))continue;
    if(!vis(n.x,n.y))continue;
    const moving=n.id==='amir'&&Math.sin(t*0.7+n.x)>0.3;
    const px=n.x+(moving?Math.sin(t*0.5)*46:0);
    CH.G.person(ctx,{x:px,y:n.y,dir:Math.atan2(S.player.y-n.y,S.player.x-px),look:n.look},t,false);
    // حباب گفت‌وگو
    const d=U.dist(S.player.x,S.player.y,px,n.y);
    if(d<110){
      ctx.fillStyle='rgba(10,18,33,.9)';
      ctx.beginPath(); ctx.roundRect(px-14,n.y-78,28,22,7); ctx.fill();
      ctx.strokeStyle='rgba(232,184,75,.7)'; ctx.stroke();
      ctx.fillStyle='#e8b84b'; ctx.font='bold 15px Vazirmatn'; ctx.textAlign='center';
      ctx.fillText('…',px,n.y-62);
    }
  }

  // بازیکن
  const P=S.player;
  if(CH.save.d.story.hasHorse){
    const mallet=CH.save.d.equipped.mallet;
    CH.G.rider(ctx,{x:P.x,y:P.y,ang:P.ang,gallop:P.gallop,speed:P.speed,swing:P.swing,outfit:CH.save.d.equipped.outfit,controlled:false},t);
  } else {
    CH.G.person(ctx,{x:P.x,y:P.y,dir:P.ang,look:{head:'cap',robe:'#1ba894',hat:'#1c3a6e',skin:'#eab98c',hair:'#241608'}},t,P.speed>25);
    if(P.swing>0){
      ctx.save(); ctx.translate(P.x,P.y); ctx.rotate(P.ang);
      const a=-1.2+P.swing*2.4;
      ctx.rotate(a);
      ctx.strokeStyle='#8a5f34'; ctx.lineWidth=4; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(34,0); ctx.stroke();
      ctx.strokeStyle='#5f3d1e'; ctx.lineWidth=5;
      ctx.beginPath(); ctx.moveTo(34,0); ctx.lineTo(44,-6); ctx.stroke();
      ctx.restore();
    }
  }
  CH.fx.draw(ctx);
  ctx.restore();

  // فلش راهنما لبه صفحه
  if(S.marker&&!CH.ui.isDialogOpen()){
    const sx=S.marker.x-S.cam.x+CH.view.w/2, sy=S.marker.y-S.cam.y+CH.view.h/2;
    if(sx<30||sx>CH.view.w-30||sy<30||sy>CH.view.h-30){
      const a=Math.atan2(sy-CH.view.h/2,sx-CH.view.w/2);
      const ex=CH.view.w/2+Math.cos(a)*(Math.min(CH.view.w,CH.view.h)/2-56);
      const ey=CH.view.h/2+Math.sin(a)*(Math.min(CH.view.w,CH.view.h)/2-56);
      ctx.save(); ctx.translate(ex,ey); ctx.rotate(a);
      const pu=(Math.sin(t*5)+1)/2;
      ctx.fillStyle='rgba(232,184,75,'+(0.65+pu*0.35).toFixed(2)+')';
      ctx.beginPath(); ctx.moveTo(20,0); ctx.lineTo(-12,-14); ctx.lineTo(-12,14); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.4)'; ctx.lineWidth=2; ctx.stroke();
      ctx.restore();
      // فاصله
      const dm=Math.round(U.dist(S.player.x,S.player.y,S.marker.x,S.marker.y)/10);
      ctx.fillStyle='rgba(240,220,174,.9)'; ctx.font='bold 13px Vazirmatn'; ctx.textAlign='center';
      ctx.fillText(U.toFa(dm)+' قدم',ex-Math.cos(a)*26,ey-Math.sin(a)*26+4);
    }
  }
};

/* ---------- رویداد ضربه ---------- */
CH.input.on('a',()=>{
  if(!S.active||CH.scenes.name!=='story')return;
  if(CH.ui.isDialogOpen())return;
  S.interact();
  S.trySwing();
});
})();
