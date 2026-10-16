/* چوگان: میراث پارس — موتور مسابقه چوگان (فیزیک توپ، اسب، هوش مصنوعی) */
(function(){
const TAU=Math.PI*2, U=CH.u;
const FW=1700, FH=660, GOAL_W=150, BALL_R=13;
const M={active:false};
CH.match=M;

M.start=function(cfg){
  const s=CH.save.d;
  M.cfg=cfg; M.active=true;
  CH.scenes.set('match');
  M.score={a:0,b:0};
  M.time=cfg.dur; M.phase='kickoff'; M.phaseT=1.2;
  M.cam={x:0,y:0}; M.shake=0; M.time065=false;
  M.trail=[];
  const horse=CH.SHOP.horses.find(h=>h.id===s.equipped.horse);
  const mallet=CH.SHOP.mallets.find(m=>m.id===s.equipped.mallet);
  M.stats={
    spd:(horse?horse.spd:0.92),
    stam:(horse?horse.stam:0.95),
    pow:(mallet?mallet.pow:1),
    acc:(mallet?mallet.acc:1)
  };
  const nPer=(cfg.small===2)?2:3;
  M.riders=[];
  // تیم ما (a) سمت چپ — به دروازه راست حمله
  const myNames=['me','amir','golnar'];
  for(let i=0;i<nPer;i++){
    M.riders.push(M.mkRider('a',i,nPer,{spd:M.stats.spd,stam:M.stats.stam,pow:M.stats.pow,acc:M.stats.acc},myNames[i]));
  }
  const diff=cfg.diff||0.7;
  const enNames=['حریف ۱','حریف ۲','حریف ۳'];
  for(let i=0;i<nPer;i++){
    M.riders.push(M.mkRider('b',i,nPer,{spd:U.clamp(0.86*diff,0.7,1.15),stam:0.9,pow:U.clamp(0.9*diff,0.75,1.15),acc:U.clamp(0.85*diff,0.6,1.1)},enNames[i]));
  }
  M.ctl=0; // ایندکس بازیکن کنترلی تیم a
  M.resetPositions(true);
  CH.audio.play('whistle');
  CH.ui.matchHud(true,cfg);
  CH.input.enable(true);
};

M.mkRider=function(team,i,n,stats,name){
  return {
    team,i,name,stats,
    x:0,y:0,vx:0,vy:0,ang:team==='a'?0:Math.PI,
    gallop:Math.random()*6,speed:0,
    stamina:1,swing:0,swingHit:false,cool:0,
    aiT:Math.random()*.4,role:'attack',tx:0,ty:0,
    controlled:false
  };
};

M.home=function(r){
  const dir=(r.team==='a'?-1:1);
  const colX=dir*FW*0.18, colX2=dir*FW*0.34;
  const colY=[0,-160,160,0][r.i]||0;
  if(r.role==='keeper')r.x=dir*FW*0.42, r.y=0;
  else if(r.i===0)r.x=colX, r.y=colY;
  else r.x=colX2, r.y=colY*0.6+((r.i%2)?120:-120);
  r.vx=r.vy=0;
  r.ang=(r.team==='a'?0:Math.PI);
};

M.resetPositions=function(full){
  M.ball={x:0,y:0,vx:0,vy:0};
  M.trail.length=0;
  for(const r of M.riders){ r.role=r.i===2?'keeper':'attack'; M.home(r); }
  if(full){ M.ctl=0; }
};

/* ---------- ورودی بازیکن ---------- */
M.playerControl=function(r,dt){
  const mv=CH.input.move();
  const sprint=CH.input.held.b&&r.stamina>0.05;
  let sp=250*r.stats.spd*(sprint?1.42:1);
  if(sprint){ r.stamina=Math.max(0,r.stamina-0.26*dt); if(Math.random()<.4)CH.fx.dust(r.x,r.y+8,1); }
  else r.stamina=Math.min(1,r.stamina+0.13*dt);
  const ax=mv.x*sp, ay=mv.y*sp;
  r.vx=U.lerp(r.vx,ax,1-Math.exp(-6*dt));
  r.vy=U.lerp(r.vy,ay,1-Math.exp(-6*dt));
  if(Math.hypot(r.vx,r.vy)>20){
    const ta=Math.atan2(r.vy,r.vx);
    r.ang+=U.angDiff(r.ang,ta)*Math.min(1,10*dt);
  }
  if(CH.input.held.a&&r.cool<=0&&r.swing<=0){ r.swing=0.001; r.swingHit=false; CH.audio.play('swing'); }
  r.speed=Math.hypot(r.vx,r.vy);
};

/* ---------- هوش مصنوعی ---------- */
M.aiControl=function(r,dt){
  const st=r.stats;
  r.aiT-=dt;
  if(r.aiT<=0){
    r.aiT=U.rand(.25,.5);
    // تعیین نقش
    const mates=M.riders.filter(o=>o.team===r.team);
    const sorted=mates.slice().sort((a,b)=>U.dist2(a)-U.dist2(b));
    const closest=sorted[0]===r;
    r.role=(r.i===2)?'keeper':(closest?'attack':'support');
  }
  const goalX=(r.team==='a'?FW/2:-FW/2);
  const ownGoalX=(r.team==='a'?-FW/2:FW/2);
  let tx,ty,sprint=false;
  const b=M.ball;
  const skill=M.cfg.diff||0.7;

  if(r.role==='keeper'){
    tx=ownGoalX*0.93; ty=U.clamp(b.y*0.7,-GOAL_W*0.7,GOAL_W*0.7);
    if(Math.abs(b.x-ownGoalX)<220&&Math.abs(b.y)<GOAL_W){ tx=ownGoalX+Math.sign(-ownGoalX)*30; ty=b.y; }
  } else if(r.role==='attack'){
    const pred=0.25;
    tx=b.x+b.vx*pred; ty=b.y+b.vy*pred;
    if(U.dist(r.x,r.y,tx,ty)<70){
      sprint=Math.random()<0.5;
      // ضربه زدن
      if(r.cool<=0&&r.swing<=0&&Math.random()<0.85){
        r.swing=0.001; r.swingHit=false;
        // جهت‌گیری به سمت دروازه قبل از ضربه
        const ga=Math.atan2((Math.random()-.5)*GOAL_W*.8-goalOffsetY(r),goalX-r.x);
        const err=(1-st.acc*skill)*U.rand(-.9,.9);
        r.ang=ga+err;
        CH.audio.play('swing');
      }
    }
  } else {
    // پشتیبان — موقعیت کمکی
    tx=b.x-Math.sign(goalX)*260;
    ty=b.y+(r.i===1?170:-170)+Math.sin(r.gallop*3)*30;
    tx=U.clamp(tx,-FW/2+60,FW/2-60);
    ty=U.clamp(ty,-FH/2+40,FH/2-40);
  }
  const dx=tx-r.x, dy=ty-r.y, d=Math.hypot(dx,dy)||1;
  let sp=250*st.spd*(sprint?1.35:1)*U.clamp(skill,0.6,1.1);
  if(d<26)sp*=0.3;
  r.vx=U.lerp(r.vx,dx/d*sp,1-Math.exp(-5*dt));
  r.vy=U.lerp(r.vy,dy/d*sp,1-Math.exp(-5*dt));
  if(Math.hypot(r.vx,r.vy)>20){
    const ta=Math.atan2(r.vy,r.vx);
    r.ang+=U.angDiff(r.ang,ta)*Math.min(1,8*dt);
  }
  r.speed=Math.hypot(r.vx,r.vy);
};
function goalOffsetY(r){ return (r.y*0.2); }
U.dist2=function(o){ return U.dist(o.x,o.y,M.ball.x,M.ball.y); };

/* ---------- فیزیک ---------- */
M.physics=function(dt){
  const b=M.ball;
  for(const r of M.riders){
    if(r.swing>0){
      r.swing+=dt/0.34;
      if(r.swing>=0.34)r.swing=0;
    }
    r.cool=Math.max(0,r.cool-dt);
    r.x+=r.vx*dt; r.y+=r.vy*dt;
    r.gallop+=dt*(1+r.speed/120);
    r.x=U.clamp(r.x,-FW/2+40,FW/2-40);
    r.y=U.clamp(r.y,-FH/2+34,FH/2-34);
    if(r.speed>140&&Math.random()<.25&&CH.Q.particles>0.4)CH.fx.dust(r.x-Math.cos(r.ang)*30,r.y+6,1);
  }
  // جدایی سواران
  for(let i=0;i<M.riders.length;i++)for(let j=i+1;j<M.riders.length;j++){
    const a=M.riders[i],c=M.riders[j];
    const dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy);
    if(d<52&&d>0.01){ const push=(52-d)/2; const nx=dx/d,ny=dy/d;
      a.x-=nx*push;a.y-=ny*push;c.x+=nx*push;c.y+=ny*push; }
  }
  // توپ
  b.x+=b.vx*dt; b.y+=b.vy*dt;
  const fr=Math.exp(-1.15*dt);
  b.vx*=fr; b.vy*=fr;
  if(CH.Q.trail&&Math.hypot(b.vx,b.vy)>120){ M.trail.push({x:b.x,y:b.y}); if(M.trail.length>10)M.trail.shift(); }
  else if(M.trail.length&&Math.hypot(b.vx,b.vy)<=120)M.trail.shift();
  // دیواره‌ها
  if(b.y<-FH/2+BALL_R){b.y=-FH/2+BALL_R;b.vy=Math.abs(b.vy)*.72;CH.audio.play('hitWall');}
  if(b.y>FH/2-BALL_R){b.y=FH/2-BALL_R;b.vy=-Math.abs(b.vy)*.72;CH.audio.play('hitWall');}
  if(Math.abs(b.x)>FW/2-BALL_R&&Math.abs(b.y)>GOAL_W/2+BALL_R){
    b.x=U.clamp(b.x,-FW/2+BALL_R,FW/2-BALL_R); b.vx=-b.vx*.72; CH.audio.play('hitWall');
  }
  // برخورد سوار-توپ (دریبل)
  for(const r of M.riders){
    const d=U.dist(r.x,r.y,b.x,b.y);
    if(d<30){
      const bs=Math.hypot(b.vx,b.vy);
      if(bs<r.speed*1.15+40){
        b.vx=r.vx*1.12+Math.cos(r.ang)*40;
        b.vy=r.vy*1.12+Math.sin(r.ang)*40;
      }
    }
  }
  // ضربه چوب
  for(const r of M.riders){
    if(r.swing>0.3&&r.swing<0.75&&!r.swingHit){
      const d=U.dist(r.x,r.y,b.x,b.y);
      if(d<64){
        r.swingHit=true;
        let dir=r.ang;
        // کمک هدف‌گیری بر اساس دقت
        const goalX=(r.team==='a'?FW/2:-FW/2);
        const ga=Math.atan2(U.rand(-GOAL_W*.35,GOAL_W*.35)-b.y*0.15,goalX-b.x);
        const assist=U.clamp((r.stats.acc-0.8)*0.55,0,0.45);
        if(U.angDiff(dir,ga)>-1.4&&U.angDiff(dir,ga)<1.4){
          dir=U.lerp(dir,dir+U.angDiff(dir,ga),assist);
        }
        const power=540*r.stats.pow;
        b.vx=Math.cos(dir)*power+r.vx*.4;
        b.vy=Math.sin(dir)*power+r.vy*.4;
        CH.audio.play('hit');
        CH.fx.burst(b.x,b.y,'#ffe9a8',10);
        CH.vibrate(18);
        if(r.controlled)M.shake=Math.min(8,M.shake+3);
      }
    }
  }
};

/* ---------- گل و جریان مسابقه ---------- */
M.checkGoal=function(){
  const b=M.ball;
  if(Math.abs(b.x)>FW/2-6&&Math.abs(b.y)<GOAL_W/2){
    const scorer=b.x>0?'a':'b';
    M.score[scorer]++;
    M.phase='goal'; M.phaseT=2.2;
    M.shake=12;
    CH.audio.play(scorer==='a'?'goal':'concede');
    CH.fx.burst(b.x,b.y,scorer==='a'?'#ffd97a':'#ff9d96',26);
    CH.fx.confetti(scorer==='a'?70:24);
    CH.vibrate(scorer==='a'?120:40);
    if(scorer==='a'){ CH.bigNote(U.pick(CH_STORY_DATA.sys.goal),1400); CH.save.d.stats.goals++; }
    else CH.bigNote(U.pick(CH_STORY_DATA.sys.concede),1200);
    CH.ui.updateMatchHud();
  }
};

M.update=function(dt){
  if(!M.active)return;
  const b=M.ball;
  if(M.phase==='kickoff'){
    M.phaseT-=dt;
    if(M.phaseT<=0)M.phase='play';
  } else if(M.phase==='play'){
    M.time-=dt;
    if(M.time<=10&&!M.time065){ M.time065=true; CH.audio.play('whistle'); CH.bigNote('آخرین ثانیه‌ها!',1200); }
    if(M.time<=0){ M.end(); return; }
    M.checkGoal();
    if(M.phase==='goal'){ M.phaseT=2.2; }
  } else if(M.phase==='goal'){
    M.phaseT-=dt;
    b.vx*=Math.exp(-3*dt); b.vy*=Math.exp(-3*dt);
    if(M.phaseT<=0){
      M.resetPositions(false);
      M.phase='play';
      CH.audio.play('whistle');
    }
  }
  // کنترل
  for(const r of M.riders){
    if(r.team==='a'&&M.riders.indexOf(r)===M.ctl)r.controlled=true; else r.controlled=false;
  }
  // تعویض خودکار
  if(M.phase!=='goal'){
    let best=M.ctl,bd=U.dist(M.riders[M.ctl].x,M.riders[M.ctl].y,b.x,b.y);
    for(let i=0;i<M.riders.length;i++){ const r=M.riders[i]; if(r.team!=='a')continue;
      const d=U.dist(r.x,r.y,b.x,b.y);
      if(d+70<bd){bd=d;best=i;}
    }
    M.ctl=best;
  }
  for(const r of M.riders){
    if(r.controlled&&M.phase!=='goal')M.playerControl(r,dt);
    else M.aiControl(r,dt);
  }
  M.physics(dt);
  // دوربین
  const tx=U.clamp(b.x*.75,-FW/2+CH.view.w/2,FW/2-CH.view.w/2);
  const ty=0;
  M.cam.x=U.lerp(M.cam.x,tx,1-Math.exp(-4*dt));
  M.cam.y=U.lerp(M.cam.y,ty,1-Math.exp(-4*dt));
  M.shake=Math.max(0,M.shake-30*dt);
  CH.audio.updateGallop(dt);
  const me=M.riders[M.ctl];
  CH.audio.gallop(M.phase==='play'&&me.speed>200);
};

M.render=function(ctx){
  const ctx2=ctx;
  ctx2.save();
  const shx=(Math.random()-.5)*M.shake, shy=(Math.random()-.5)*M.shake;
  ctx2.translate(CH.view.w/2-M.cam.x+shx, CH.view.h/2-M.cam.y+shy);
  CH.G.field(ctx2,FW,FH,M.cfg.env,CH.now);
  // اسب‌ها با ترتیب y
  const all=M.riders.slice().sort((a,b)=>a.y-b.y);
  for(const r of all)CH.G.rider(ctx2,r,CH.now);
  CH.G.ball(ctx2,M.ball.x,M.ball.y,BALL_R,CH.now,M.trail);
  CH.fx.draw(ctx2);
  ctx2.restore();
  // گلولهٔ جهت (نشانگر توپ بیرون از دید)
  const b=M.ball;
  const sx=b.x-M.cam.x+CH.view.w/2, sy=b.y-M.cam.y+CH.view.h/2;
  if(sx<0||sx>CH.view.w||sy<0||sy>CH.view.h){
    const a=Math.atan2(sy-CH.view.h/2,sx-CH.view.w/2);
    const ex=CH.view.w/2+Math.cos(a)*(CH.view.w/2-36), ey=CH.view.h/2+Math.sin(a)*(CH.view.h/2-36);
    ctx2.save(); ctx2.translate(ex,ey); ctx2.rotate(a);
    ctx2.fillStyle='rgba(232,184,75,.9)';
    ctx2.beginPath(); ctx2.moveTo(16,0); ctx2.lineTo(-8,-10); ctx2.lineTo(-8,10); ctx2.closePath(); ctx2.fill();
    ctx2.restore();
  }
};

M.end=function(){
  M.phase='end';
  CH.audio.play('whistle'); CH.audio.gallop(false);
  const win=M.score.a>M.score.b, draw=M.score.a===M.score.b;
  CH.save.d.stats.matches++;
  if(win)CH.save.d.stats.wins++;
  const stars=win?(M.score.a-M.score.b>=3?3:(M.score.a-M.score.b>=2?2:1)):0;
  M.active=false;
  setTimeout(()=>{
    CH.ui.showResult({
      win,draw,stars,
      scoreA:M.score.a,scoreB:M.score.b,
      cfg:M.cfg
    });
  },700);
};

M.stop=function(){
  M.active=false;
  CH.audio.gallop(false);
};
M.FIELD={FW,FH,GOAL_W,BALL_R};
})();
