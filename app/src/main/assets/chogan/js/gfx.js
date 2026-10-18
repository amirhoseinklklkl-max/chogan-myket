/* چوگان: میراث پارس — موتور گرافیک دوبعدی (رسم برداری اسب، سوار، زمین، پرتره) */
(function(){
const G={};
CH.G=G;
const TAU=Math.PI*2;

function rr(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.roundRect(x,y,w,h,r); }

/* ---------- اسب (نمای بالا) ----------
   opt: coat، mane (یال)، bard (جلوش)، size، blaze (شبل)، spots (لکه‌های بدن)، socks (پای سفید) */
G.horse=function(ctx,x,y,ang,gallop,opt){
  opt=opt||{};
  const coat=opt.coat||'#6e4a2f', mane=opt.mane||'#3c2717', bard=opt.bard;
  const sz=opt.size||1;
  ctx.save(); ctx.translate(x,y); ctx.rotate(ang); ctx.scale(sz,sz);
  // سایه
  if(CH.Q.shadow){ ctx.fillStyle='rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(2,4,46,20,0,0,TAU); ctx.fill(); }
  // دم
  ctx.strokeStyle=mane; ctx.lineWidth=7; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(-44,0);
  ctx.quadraticCurveTo(-58,Math.sin(gallop*7)*6,-66,Math.sin(gallop*7+1)*10); ctx.stroke();
  // پاها (چرخه چهارضلعی گالوپ)
  const legs=[[-30,-12],[-30,12],[26,-12],[26,12]];
  for(let i=0;i<4;i++){
    const ph=gallop*10+i*(i<2?0.5:2.4);
    const swing=Math.sin(ph)*(Math.abs(opt.speed||0)>10?0.55:0.12);
    ctx.strokeStyle=coat; ctx.lineWidth=7;
    ctx.beginPath(); ctx.moveTo(legs[i][0],legs[i][1]);
    const lx=legs[i][0]+Math.cos(swing)*10, ly=legs[i][1]+Math.abs(Math.sin(swing))*6*Math.sign(legs[i][1]);
    ctx.lineTo(lx,ly); ctx.stroke();
    ctx.fillStyle=opt.socks||mane; ctx.beginPath(); ctx.arc(lx,ly,3.4,0,TAU); ctx.fill();
  }
  // بدن
  const grd=ctx.createLinearGradient(0,-16,0,16);
  grd.addColorStop(0,coat); grd.addColorStop(1,shade(coat,-28));
  ctx.fillStyle=grd; ctx.strokeStyle=shade(coat,-45); ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.ellipse(0,0,45,16,0,0,TAU); ctx.fill();
  // لکه‌های بدن (قبل از خط دور)
  if(opt.spots){ ctx.fillStyle=opt.spots; for(const sp of [[-20,-3],[0,7],[16,-5],[-8,-8],[8,3]]){ ctx.beginPath(); ctx.ellipse(sp[0],sp[1],5.5,3.6,0.3,0,TAU); ctx.fill(); } }
  ctx.strokeStyle=shade(coat,-45); ctx.stroke();
  // گردن و سر
  ctx.beginPath(); ctx.moveTo(30,-6); ctx.quadraticCurveTo(52,-14,60,-4); ctx.quadraticCurveTo(64,2,58,8); ctx.quadraticCurveTo(44,10,32,8); ctx.closePath();
  ctx.fillStyle=coat; ctx.fill(); ctx.stroke();
  // یال
  ctx.strokeStyle=mane; ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(34,-8); ctx.quadraticCurveTo(48,-16,58,-6); ctx.stroke();
  // گوش‌ها
  ctx.fillStyle=coat; ctx.beginPath(); ctx.moveTo(56,-8); ctx.lineTo(60,-16); ctx.lineTo(63,-7); ctx.closePath(); ctx.fill();
  // شبل (نوار روشن روی پیشانی)
  if(opt.blaze){ ctx.fillStyle=opt.blaze; ctx.beginPath(); ctx.ellipse(61,0,4.6,2.4,-0.15,0,TAU); ctx.fill(); }
  // پوزه
  ctx.fillStyle=shade(coat,18); ctx.beginPath(); ctx.ellipse(62,2,7,5,-.2,0,TAU); ctx.fill();
  // جلوآلافته (جلوش)
  if(bard){ ctx.fillStyle=bard; rr(ctx,-16,-14,34,28,9); ctx.fill(); ctx.strokeStyle=shade(bard,-40); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.25)'; rr(ctx,-16,-14,34,10,9); ctx.fill(); }
  ctx.restore();
};
function shade(hex,amt){
  const n=parseInt(hex.slice(1),16);
  let r=(n>>16)+amt,g=((n>>8)&255)+amt,b=(n&255)+amt;
  r=CH.u.clamp(r,0,255);g=CH.u.clamp(g,0,255);b=CH.u.clamp(b,0,255);
  return 'rgb('+r+','+g+','+b+')';
}
G.shade=shade;

/* ---------- سوار چوگان‌باز ---------- */
G.rider=function(ctx,e,time){
  // e: {x,y,ang,gallop,team,outfit,horse,swing(0..1),speed,controlled,me}
  const oc=CH.OUTFITS[e.outfit||'rustic']||CH.OUTFITS.rustic;
  const hc=e.horse||null;
  G.horse(ctx,e.x,e.y,e.ang,e.gallop,{
    coat:(hc&&hc.coat)||'#7a5233',
    mane:(hc&&hc.mane)||undefined,
    bard:(hc&&hc.bard)||oc.bard,
    size:hc&&hc.size, blaze:hc&&hc.blaze, spots:hc&&hc.spots, socks:hc&&hc.socks,
    speed:e.speed
  });
  ctx.save(); ctx.translate(e.x,e.y); ctx.rotate(e.ang);
  // پاها به رکاب
  ctx.strokeStyle='#3a2a1c'; ctx.lineWidth=5;
  ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(-2,-16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,6); ctx.lineTo(-2,16); ctx.stroke();
  // تن
  ctx.fillStyle=oc.robe; ctx.strokeStyle=shade(oc.robe,-50); ctx.lineWidth=2;
  ctx.beginPath(); ctx.ellipse(-2,0,13,11,0,0,TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(-4,-3,7,4,0,0,TAU); ctx.fill();
  // کمربند
  ctx.fillStyle=oc.belt; rr(ctx,-10,-10,7,20,3); ctx.fill();
  // سر و کلاه
  ctx.fillStyle='#eab98c'; ctx.beginPath(); ctx.arc(2,0,7,0,TAU); ctx.fill();
  ctx.fillStyle=oc.hat; ctx.beginPath(); ctx.ellipse(1,0,7.5,6.5,0,0,TAU); ctx.fill();
  ctx.fillStyle=shade(oc.hat,25); ctx.beginPath(); ctx.ellipse(1,0,4.5,2.5,0,0,TAU); ctx.fill();
  // بازو و چوب چوگان
  const sw=e.swing||0; // 0 آرام — 1 اوج ضربه
  const armA=-0.5+Math.sin(sw*Math.PI)*1.5+Math.sin(time*3)*0.04;
  ctx.save(); ctx.translate(8,0); ctx.rotate(armA);
  ctx.strokeStyle=oc.robe; ctx.lineWidth=5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(14,-4); ctx.stroke();
  // چوب
  ctx.strokeStyle='#8a5f34'; ctx.lineWidth=3.4;
  ctx.beginPath(); ctx.moveTo(14,-4); ctx.lineTo(30,-14); ctx.stroke();
  ctx.strokeStyle='#5f3d1e'; ctx.lineWidth=4.5;
  ctx.beginPath(); ctx.moveTo(30,-14); ctx.lineTo(37,-19); ctx.stroke();
  if(CH.Q.glow&&sw>0.15&&sw<0.95){ ctx.strokeStyle='rgba(255,230,150,'+(0.5*(1-Math.abs(sw-0.5)*2)).toFixed(2)+')'; ctx.lineWidth=8; ctx.beginPath(); ctx.arc(0,0,46,-1.1+armA,0.6+armA); ctx.stroke(); }
  ctx.restore();
  ctx.restore();
  // حلقه انتخاب بازیکن
  if(e.controlled){
    ctx.save(); ctx.translate(e.x,e.y);
    ctx.strokeStyle='rgba(232,184,75,.9)'; ctx.lineWidth=2.5; ctx.setLineDash([9,7]);
    ctx.lineDashOffset=-time*30;
    ctx.beginPath(); ctx.ellipse(0,0,52,30,0,0,TAU); ctx.stroke(); ctx.setLineDash([]);
    // فلش کوچک بالای سر
    ctx.fillStyle='#e8b84b'; ctx.beginPath();
    const by=-40+Math.sin(time*4)*3;
    ctx.moveTo(0,by+8); ctx.lineTo(-7,by-2); ctx.lineTo(7,by-2); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
};

/* ---------- توپ ---------- */
G.ball=function(ctx,x,y,r,time,trailPts){
  if(CH.Q.trail&&trailPts&&trailPts.length>1){
    ctx.strokeStyle='rgba(255,235,180,.4)'; ctx.lineWidth=r*1.2; ctx.lineCap='round';
    ctx.beginPath();
    for(let i=0;i<trailPts.length;i++){ const p=trailPts[i]; i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y); }
    ctx.stroke();
  }
  if(CH.Q.shadow){ ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x+3,y+4,r,r*.8,0,0,TAU); ctx.fill(); }
  const g=ctx.createRadialGradient(x-r*.35,y-r*.35,1,x,y,r);
  g.addColorStop(0,'#fff6e0'); g.addColorStop(.55,'#f3e2b3'); g.addColorStop(1,'#c9a86a');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,TAU); ctx.fill();
  ctx.strokeStyle='rgba(120,90,40,.5)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(x,y,r*.55,Math.sin(time*5)*2,Math.sin(time*5)*2+4); ctx.stroke();
};

/* ---------- زمین چوگان ---------- */
G.field=function(ctx,w,h,env,time){
  const pal={
    village:{base:'#d8b878',alt:'#d0af6e',line:'#8a6a3a',board:'#5f4126'},
    plain:{base:'#cfae6c',alt:'#c8a764',line:'#82643a',board:'#57402a'},
    royal:{base:'#4a5d3a',alt:'#445734',line:'#c9b06a',board:'#2e3d24'},
    night:{base:'#3c5238',alt:'#364b33',line:'#d0b678',board:'#26351f'}
  }[env||'village'];
  ctx.fillStyle=pal.base; ctx.fillRect(-w/2-50,-h/2-50,w+100,h+100);
  if(CH.Q.detail){
    // بافت خاکی
    ctx.fillStyle='rgba(0,0,0,.04)';
    const R=CH._fldSeed||(CH._fldSeed=[]);
    for(let i=0;i<130;i++){
      if(!R[i])R[i]=[CH.u.rand(-w/2,w/2),CH.u.rand(-h/2,h/2),CH.u.rand(20,90)];
      const s=R[i];
      ctx.beginPath(); ctx.ellipse(s[0],s[1],s[2],s[2]*.4,0,0,TAU); ctx.fill();
    }
    if(env==='royal'||env==='night'){ // چمن‌های کوتاه
      ctx.strokeStyle='rgba(255,255,255,.05)'; ctx.lineWidth=1.5;
      for(let i=0;i<60;i++){ if(!R[200+i])R[200+i]=[CH.u.rand(-w/2,w/2),CH.u.rand(-h/2,h/2)]; const s=R[200+i];
        ctx.beginPath(); ctx.moveTo(s[0],s[1]); ctx.lineTo(s[0]+3,s[1]-7); ctx.stroke(); }
    }
  }
  // خطوط زمین
  ctx.strokeStyle=pal.line; ctx.lineWidth=4; ctx.globalAlpha=.55;
  ctx.strokeRect(-w/2+14,-h/2+14,w-28,h-28);
  ctx.globalAlpha=1;
  // نوار میانی و مرکز
  ctx.globalAlpha=.4; ctx.beginPath(); ctx.moveTo(0,-h/2+14); ctx.lineTo(0,h/2-14); ctx.stroke(); ctx.globalAlpha=1;
  G.medallion(ctx,0,0,86,time);
  // تخته‌های دور زمین
  ctx.fillStyle=pal.board;
  ctx.fillRect(-w/2-6,-h/2-16,w+12,12); ctx.fillRect(-w/2-6,h/2+4,w+12,12);
  ctx.fillRect(-w/2-16,-h/2-6,12,h+12); ctx.fillRect(w/2+4,-h/2-6,12,h+12);
  // دروازه‌ها
  G.goal(ctx,-w/2+6,0,1,time); G.goal(ctx,w/2-6,0,-1,time);
};
G.medallion=function(ctx,x,y,r,time){
  ctx.save(); ctx.translate(x,y);
  ctx.fillStyle='rgba(140,100,45,.30)'; ctx.beginPath(); ctx.arc(0,0,r,0,TAU); ctx.fill();
  ctx.strokeStyle='rgba(90,60,25,.5)'; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.arc(0,0,r,0,TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,r*.62,0,TAU); ctx.stroke();
  // ستاره هشت‌پر ایرانی
  ctx.fillStyle='rgba(90,60,25,.45)';
  ctx.save(); ctx.rotate(time*.1);
  ctx.beginPath();
  for(let i=0;i<16;i++){ const a=i*TAU/16; const rad=i%2?r*.3:r*.55; const px=Math.cos(a)*rad, py=Math.sin(a)*rad; i?ctx.lineTo(px,py):ctx.moveTo(px,py); }
  ctx.closePath(); ctx.fill();
  ctx.restore(); ctx.restore();
};
G.goal=function(ctx,x,side,time){
  const gw=110; // دهانه دروازه
  ctx.save(); ctx.translate(x,0);
  // پرچم‌ها
  for(const sy of [-gw/2,gw/2]){
    ctx.fillStyle='#6b4a2a'; ctx.beginPath(); ctx.arc(0,sy,7,0,TAU); ctx.fill();
    ctx.fillStyle='#caa84f'; ctx.beginPath(); ctx.arc(0,sy,3.5,0,TAU); ctx.fill();
    // پارچه پرچم موج‌دار
    const wob=Math.sin(time*4+sy)*6;
    ctx.fillStyle='#c8433a';
    ctx.beginPath(); ctx.moveTo(-side*2,sy);
    ctx.quadraticCurveTo(side*22,sy-8+wob,side*40,sy-4+wob*1.4);
    ctx.lineTo(side*40,sy+10+wob*1.4); ctx.quadraticCurveTo(side*22,sy+8+wob,-side*2,sy+13);
    ctx.closePath(); ctx.fill();
  }
  // دهانه
  ctx.strokeStyle='rgba(255,240,200,.85)'; ctx.lineWidth=3;
  ctx.setLineDash([10,7]); ctx.beginPath(); ctx.moveTo(0,-gw/2); ctx.lineTo(0,gw/2); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
};

/* ---------- آدم‌های داستان (راست ایستاده، نمای بالا-کمی سه‌رخ) ---------- */
G.person=function(ctx,p,time,moving){
  // p:{x,y,dir,look,walk,outfit}
  const look=p.look||{};
  const robe=look.robe||'#7a6a4a', hat=look.hat||'#5a4632', skin=look.skin||'#eab98c';
  const hair=look.hair||'#2e2016', beard=look.beard;
  const bob=moving?Math.sin(time*10)*2:Math.sin(time*2)*1;
  ctx.save(); ctx.translate(p.x,p.y);
  if(CH.Q.shadow){ ctx.fillStyle='rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0,26,15,6,0,0,TAU); ctx.fill(); }
  // پاها
  if(moving){ const s=Math.sin(time*11)*5;
    ctx.strokeStyle='#3a2c20'; ctx.lineWidth=6; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-5,12); ctx.lineTo(-5+s,26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5,12); ctx.lineTo(5-s,26); ctx.stroke();
  } else {
    ctx.strokeStyle='#3a2c20'; ctx.lineWidth=6; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-5,12); ctx.lineTo(-5,26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5,12); ctx.lineTo(5,26); ctx.stroke();
  }
  // عبای بلند
  ctx.fillStyle=robe; ctx.strokeStyle=shade(robe,-45); ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(-12,14+bob*0.3); ctx.quadraticCurveTo(-14,-10,0,-12+bob); ctx.quadraticCurveTo(14,-10,12,14+bob*0.3);
  ctx.quadraticCurveTo(0,19+bob*0.3,-12,14+bob*0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
  // کمربند
  ctx.fillStyle=shade(robe,-60); ctx.fillRect(-11,2+bob*0.4,22,4);
  // دست‌ها
  ctx.strokeStyle=robe; ctx.lineWidth=5; ctx.lineCap='round';
  const armS=moving?Math.sin(time*11)*4:Math.sin(time*2)*1;
  ctx.beginPath(); ctx.moveTo(-10,-4+bob); ctx.lineTo(-15,8+bob+armS); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10,-4+bob); ctx.lineTo(15,8+bob-armS); ctx.stroke();
  // سر
  ctx.fillStyle=skin; ctx.strokeStyle=shade(skin,-60); ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.arc(0,-20+bob,9,0,TAU); ctx.fill(); ctx.stroke();
  // مو و ریش
  if(look.female){ ctx.fillStyle=hair; ctx.beginPath(); ctx.arc(0,-22+bob,9.5,Math.PI*.95,Math.PI*2.05); ctx.fill(); }
  else { ctx.fillStyle=hair; ctx.beginPath(); ctx.arc(0,-23+bob,9,Math.PI,TAU); ctx.fill(); }
  if(beard){ ctx.strokeStyle=beard; ctx.lineWidth=2.6; ctx.beginPath(); ctx.arc(0,-16+bob,6.5,0.15*Math.PI,0.85*Math.PI); ctx.stroke(); }
  // چشم‌ها (به سمت dir)
  const dx=Math.cos(p.dir||0)*2, dy=Math.sin(p.dir||0)*1;
  ctx.fillStyle='#201408';
  ctx.beginPath(); ctx.arc(-3+dx,-20+bob+dy,1.3,0,TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(3+dx,-20+bob+dy,1.3,0,TAU); ctx.fill();
  // کلاه/عمامه/روسری
  if(look.head==='turban'){ ctx.fillStyle=hat; ctx.beginPath(); ctx.ellipse(0,-27+bob,10,6,0,0,TAU); ctx.fill(); ctx.fillStyle=shade(hat,22); ctx.beginPath(); ctx.ellipse(0,-29+bob,7,3.6,0,0,TAU); ctx.fill(); }
  else if(look.head==='cap'){ ctx.fillStyle=hat; ctx.beginPath(); ctx.arc(0,-26+bob,8,Math.PI,TAU); ctx.fill(); ctx.fillRect(-8,-27+bob,16,3); }
  else if(look.head==='scarf'){ ctx.fillStyle=hat; ctx.beginPath(); ctx.arc(0,-19+bob,10.5,0,TAU); ctx.fill(); ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(1,-18+bob,5.5,0,TAU); ctx.fill(); ctx.fillStyle=shade(hat,-25); ctx.beginPath(); ctx.arc(0,-19+bob,10.5,Math.PI*1.75,Math.PI*2.25); ctx.lineTo(0,-19+bob); ctx.fill(); }
  else if(look.head==='hat'){ ctx.fillStyle=hat; ctx.beginPath(); ctx.ellipse(0,-25+bob,11,4,0,0,TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(0,-30+bob,6.5,6,0,0,TAU); ctx.fill(); }
  ctx.restore();
};

/* ---------- پرتره دیالوگ (کیفیت بالا — رسم در ۱۱۲ واحد منطقی، هر اندازه بوم) ----------
   پالت شخصیت: CH.CHARS — حالت چهره: exp = grin|calm|worry|smirk|strict */
G.portrait=function(ctx,id,size){
  const P=CH.CHARS[id]||CH.CHARS.villager;
  const s=size/112;
  ctx.save(); ctx.scale(s,s); ctx.clearRect(0,0,112,112);
  const skin=P.skin||'#eab98c', hair=P.hair||'#2e2016', exp=P.exp||'calm';
  const eyeCol=P.eye||'#332415';

  /* پس‌زمینه: شب دربار + موتیف کاشی */
  const bg=ctx.createLinearGradient(0,0,0,112);
  bg.addColorStop(0,'#2a4a80'); bg.addColorStop(.6,'#1a2f56'); bg.addColorStop(1,'#0e1c33');
  ctx.fillStyle=bg; ctx.fillRect(0,0,112,112);
  // ستارهٔ هشت‌پر کم‌رنگ پشت سر
  ctx.save(); ctx.translate(56,54); ctx.globalAlpha=.14;
  ctx.fillStyle='#e8b84b'; ctx.beginPath();
  for(let i=0;i<16;i++){ const a=i*TAU/16, r=i%2?14:30; const px=Math.cos(a)*r, py=Math.sin(a)*r; i?ctx.lineTo(px,py):ctx.moveTo(px,py); }
  ctx.closePath(); ctx.fill(); ctx.restore();
  // هالهٔ نور پشت سر
  const halo=ctx.createRadialGradient(56,50,6,56,50,50);
  halo.addColorStop(0,'rgba(255,236,180,.30)'); halo.addColorStop(1,'rgba(255,236,180,0)');
  ctx.fillStyle=halo; ctx.fillRect(0,0,112,112);

  /* شانه‌ها و عبا */
  const robe=P.robe||'#7a6a4a';
  const robeG=ctx.createLinearGradient(0,74,0,112);
  robeG.addColorStop(0,shade(robe,14)); robeG.addColorStop(1,shade(robe,-36));
  ctx.fillStyle=robeG; ctx.strokeStyle=shade(robe,-58); ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(6,112); ctx.quadraticCurveTo(20,80,42,74);
  ctx.lineTo(70,74); ctx.quadraticCurveTo(92,80,106,112); ctx.closePath(); ctx.fill(); ctx.stroke();
  // یقهٔ باز (پیراهن زیرین)
  ctx.fillStyle='#f0dcae';
  ctx.beginPath(); ctx.moveTo(47,74); ctx.lineTo(56,88); ctx.lineTo(65,74); ctx.closePath(); ctx.fill();
  ctx.strokeStyle=shade(robe,-58); ctx.lineWidth=1.2; ctx.stroke();
  // گلدوزی سینه
  ctx.fillStyle='rgba(232,184,75,.9)';
  ctx.beginPath(); ctx.arc(38,94,1.7,0,TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(74,94,1.7,0,TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(30,104,1.5,0,TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(82,104,1.5,0,TAU); ctx.fill();

  /* گردن */
  const neck=ctx.createLinearGradient(0,64,0,78);
  neck.addColorStop(0,skin); neck.addColorStop(1,shade(skin,-34));
  ctx.fillStyle=neck; ctx.fillRect(47,62,18,14);
  ctx.fillStyle='rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(56,68,10,4,0,0,TAU); ctx.fill();

  /* گوش‌ها */
  if(!P.female||P.hat==='scarf'){ /* زنان با روسری، گوش پیداست */ }
  ctx.fillStyle=shade(skin,-8);
  ctx.beginPath(); ctx.ellipse(30,54,4,6,0,0,TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(82,54,4,6,0,0,TAU); ctx.fill();

  /* سر با گرادیان پوست */
  const face=ctx.createRadialGradient(50,42,6,56,54,36);
  face.addColorStop(0,shade(skin,20)); face.addColorStop(.65,skin); face.addColorStop(1,shade(skin,-24));
  ctx.fillStyle=face; ctx.strokeStyle=shade(skin,-64); ctx.lineWidth=1.8;
  ctx.beginPath(); ctx.ellipse(56,52,26,29,0,0,TAU); ctx.fill(); ctx.stroke();
  // سایهٔ پیشانی زیر کلاه
  ctx.fillStyle='rgba(0,0,0,.10)'; ctx.beginPath(); ctx.ellipse(56,34,24,10,0,0,TAU); ctx.fill();

  /* مو */
  if(P.female){
    ctx.fillStyle=hair; ctx.beginPath(); ctx.ellipse(56,46,30,31,0,Math.PI*.88,Math.PI*2.12); ctx.fill();
  } else {
    ctx.fillStyle=hair; ctx.beginPath(); ctx.ellipse(56,40,26,19,0,Math.PI,TAU); ctx.fill();
    // خط ریشِ کنار صورت
    ctx.beginPath(); ctx.ellipse(32,48,4,10,0.2,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(80,48,4,10,-0.2,0,TAU); ctx.fill();
  }
  // برقِ مو
  ctx.strokeStyle='rgba(255,255,255,.28)'; ctx.lineWidth=2; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(56,44,22,Math.PI*1.15,Math.PI*1.5); ctx.stroke();

  /* ریش */
  if(P.beard){
    const bc=P.beard;
    // ریش کامل: از شقیقه‌ها تا زیر چانه
    ctx.fillStyle=bc; ctx.strokeStyle=shade(bc,-30); ctx.lineWidth=1.4;
      ctx.beginPath();
      ctx.moveTo(34,52);
      ctx.quadraticCurveTo(30,72,40,82);
      ctx.quadraticCurveTo(48,90,56,90);
      ctx.quadraticCurveTo(64,90,72,82);
      ctx.quadraticCurveTo(82,72,78,52);
      ctx.quadraticCurveTo(72,66,56,68);
      ctx.quadraticCurveTo(40,66,34,52);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // خط باریکِ سبیل
      ctx.strokeStyle=shade(bc,-18); ctx.lineWidth=2.6;
      ctx.beginPath(); ctx.moveTo(46,64); ctx.quadraticCurveTo(56,68,66,64); ctx.stroke();
  }

  /* ابروها بر اساس حالت */
  ctx.save();
  const tilt={strict:-.35,worry:.3,smirk:-.15,grin:0,calm:.05}[exp]||0;
  ctx.fillStyle='#241608';
  // چپ
  ctx.save(); ctx.translate(45,45); ctx.rotate(tilt); ctx.beginPath(); ctx.ellipse(0,0,5.4,1.7,0,0,TAU); ctx.fill(); ctx.restore();
  // راست (قرینه)
  ctx.save(); ctx.translate(67,45); ctx.rotate(-tilt); ctx.beginPath(); ctx.ellipse(0,0,5.4,1.7,0,0,TAU); ctx.fill(); ctx.restore();
  ctx.restore();

  /* چشم‌ها: سفید، عنبیه، مردمک، برق */
  for(const ex of [45,67]){
    ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.ellipse(ex,54,4.6,5,0,0,TAU); ctx.fill();
    ctx.strokeStyle='rgba(70,50,30,.55)'; ctx.lineWidth=1.1; ctx.stroke();
    ctx.fillStyle=eyeCol; ctx.beginPath(); ctx.arc(ex,54.6,2.7,0,TAU); ctx.fill();
    ctx.fillStyle='#100a05'; ctx.beginPath(); ctx.arc(ex,54.6,1.4,0,TAU); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(ex-1.1,53.3,.9,0,TAU); ctx.fill();
    // پلک بالا
    ctx.strokeStyle='rgba(40,26,12,.8)'; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.arc(ex,54.4,4.7,Math.PI*1.12,Math.PI*1.88); ctx.stroke();
    if(P.female){ // مژه
      ctx.beginPath(); ctx.moveTo(ex-4.4,51.4); ctx.lineTo(ex-6,50.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex+4.4,51.4); ctx.lineTo(ex+6,50.2); ctx.stroke();
    }
  }

  /* بینی */
  ctx.strokeStyle=shade(skin,-52); ctx.lineWidth=1.7; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(56,55); ctx.quadraticCurveTo(58,59,55.4,61); ctx.stroke();
  ctx.fillStyle='rgba(0,0,0,.14)'; ctx.beginPath(); ctx.arc(53.6,61.4,1,0,TAU); ctx.fill(); ctx.beginPath(); ctx.arc(57.8,61.4,1,0,TAU); ctx.fill();

  /* لپ‌های سرخ جوان‌ها */
  if(exp==='grin'){ ctx.fillStyle='rgba(224,110,90,.22)';
    ctx.beginPath(); ctx.ellipse(42,61,4.4,3,-.2,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(70,61,4.4,3,.2,0,TAU); ctx.fill(); }

  /* دهان بر اساس حالت */
  ctx.strokeStyle=shade(skin,-70); ctx.lineWidth=2.1;
  if(exp==='grin'){
    ctx.fillStyle='#7a3a30';
    ctx.beginPath(); ctx.moveTo(48,67); ctx.quadraticCurveTo(56,75,64,67); ctx.quadraticCurveTo(56,70,48,67); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.moveTo(50.5,67.6); ctx.quadraticCurveTo(56,69.4,61.5,67.6); ctx.quadraticCurveTo(56,68.6,50.5,67.6); ctx.closePath(); ctx.fill();
  } else if(exp==='smirk'){
    ctx.beginPath(); ctx.moveTo(49,68); ctx.quadraticCurveTo(57,70,64,65.6); ctx.stroke();
  } else if(exp==='worry'){
    ctx.beginPath(); ctx.moveTo(51,69); ctx.quadraticCurveTo(56,66.8,61,69); ctx.stroke();
  } else if(exp==='strict'){
    ctx.beginPath(); ctx.moveTo(50,68); ctx.lineTo(62,68); ctx.stroke();
  } else { // calm — لبخند آرام
    ctx.beginPath(); ctx.arc(56,64,8,Math.PI*.2,Math.PI*.8); ctx.stroke();
  }

  /* کلاه‌ها */
  const hat=P.hat;
  if(hat==='turban'){
    const hc=P.hatCol||'#8a6a4a';
    ctx.fillStyle=hc; ctx.strokeStyle=shade(hc,-42); ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.ellipse(56,25,28,15,0,0,TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle=shade(hc,24);
    ctx.beginPath(); ctx.ellipse(56,19,20,8.5,0,0,TAU); ctx.fill();
    ctx.strokeStyle=shade(hc,-30); ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.arc(48,26,9,Math.PI*.9,Math.PI*1.7); ctx.stroke();
    ctx.beginPath(); ctx.arc(64,25,8,Math.PI*.8,Math.PI*1.9); ctx.stroke();
  } else if(hat==='cap'){
    const hc=P.hatCol||'#4a3a26';
    ctx.fillStyle=hc; ctx.beginPath(); ctx.arc(56,31,24,Math.PI,TAU); ctx.fill();
    ctx.fillRect(30,28,52,8);
    ctx.fillStyle=shade(hc,26); ctx.beginPath(); ctx.ellipse(50,20,13,6,-.3,0,TAU); ctx.fill();
    ctx.strokeStyle=shade(hc,-40); ctx.lineWidth=1.4; ctx.beginPath(); ctx.arc(56,31,24,Math.PI,TAU); ctx.stroke();
  } else if(hat==='helmet'){
    const m=ctx.createLinearGradient(30,14,80,42);
    m.addColorStop(0,'#8a92a0'); m.addColorStop(.5,'#5a5f68'); m.addColorStop(1,'#3c4048');
    ctx.fillStyle=m; ctx.beginPath(); ctx.arc(56,40,29,Math.PI,TAU); ctx.fill();
    ctx.fillStyle='#e8b84b'; ctx.fillRect(27,36,58,7);
    ctx.fillStyle='#b9862a';
    for(const rx of [36,56,76]){ ctx.beginPath(); ctx.arc(rx,39.5,2,0,TAU); ctx.fill(); }
    ctx.fillStyle='rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(48,22,10,5,-.4,0,TAU); ctx.fill();
  } else if(hat==='royal'){
    ctx.fillStyle='#caa84f'; ctx.beginPath(); ctx.ellipse(56,22,29,13,0,0,TAU); ctx.fill();
    ctx.fillStyle='#1c3a6e'; ctx.beginPath(); ctx.ellipse(56,18,20,8,0,0,TAU); ctx.fill();
    ctx.fillStyle='#e8b84b'; ctx.beginPath(); ctx.moveTo(56,4); ctx.lineTo(61,14); ctx.lineTo(56,10.6); ctx.lineTo(51,14); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#c8433a'; ctx.beginPath(); ctx.arc(56,9,2.6,0,TAU); ctx.fill();
  } else if(hat==='hat'){
    const hc=P.hatCol||'#8a5a2a';
    ctx.fillStyle=hc; ctx.beginPath(); ctx.ellipse(56,26,27,7,0,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(56,18,15,10,0,0,TAU); ctx.fill();
    ctx.fillStyle=shade(hc,-30); ctx.fillRect(41,22,30,5);
  } else if(hat==='scarf'){
    const sc=P.hatCol||'#8a3a4a';
    // روسری کامل دور صورت
    ctx.fillStyle=sc;
    ctx.beginPath(); ctx.ellipse(56,50,33,35,0,0,TAU); ctx.fill();
    ctx.fillStyle=skin;
    ctx.beginPath(); ctx.ellipse(56,54,22.5,25,0,0,TAU); ctx.fill();
    // چین‌های روسری
    ctx.strokeStyle=shade(sc,-26); ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(56,50,33,Math.PI*1.15,Math.PI*1.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30,62); ctx.quadraticCurveTo(26,74,32,86); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(82,62); ctx.quadraticCurveTo(86,74,80,86); ctx.stroke();
    // خط مو روی پیشانی
    ctx.fillStyle=hair; ctx.beginPath(); ctx.ellipse(56,36,17,7,0,Math.PI,TAU); ctx.fill();
  }

  /* گوشوارهٔ زنان */
  if(P.female&&hat!=='scarf'){ ctx.fillStyle='#e8b84b';
    ctx.beginPath(); ctx.arc(30,60,2.6,0,TAU); ctx.fill(); ctx.beginPath(); ctx.arc(82,60,2.6,0,TAU); ctx.fill(); }
  else if(P.female){ ctx.fillStyle='#e8b84b';
    ctx.beginPath(); ctx.arc(31,66,2.4,0,TAU); ctx.fill(); ctx.beginPath(); ctx.arc(81,66,2.4,0,TAU); ctx.fill(); }

  /* وینیت و قاب تزئینی */
  const vin=ctx.createRadialGradient(56,56,34,56,56,74);
  vin.addColorStop(0,'rgba(0,0,0,0)'); vin.addColorStop(1,'rgba(0,0,0,.30)');
  ctx.fillStyle=vin; ctx.fillRect(0,0,112,112);
  ctx.strokeStyle='rgba(232,184,75,.65)'; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.roundRect(3,3,106,106,14); ctx.stroke();
  ctx.strokeStyle='rgba(232,184,75,.25)'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.roundRect(6.5,6.5,99,99,11); ctx.stroke();
  // نگین‌های گوشه
  ctx.fillStyle='rgba(232,184,75,.9)';
  for(const [cx,cy] of [[8,8],[104,8],[8,104],[104,104]]){
    ctx.beginPath(); ctx.arc(cx,cy,2.2,0,TAU); ctx.fill();
  }
  ctx.restore();
};

/* ---------- نماد آیتم‌های فروشگاه (کاملاً داخل بوم، وسط‌چین) ---------- */
G.itemIcon=function(cv,type,item){
  item=item||{};
  const ctx=cv.getContext('2d'); const w=cv.width,h=cv.height;
  ctx.clearRect(0,0,w,h);
  const cx=w/2, cy=h/2;
  if(type==='mallet'){
    ctx.save(); ctx.translate(cx,cy+3);
    // دسته
    ctx.strokeStyle='#8a5f34'; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-27,25); ctx.lineTo(16,-14); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(-24,21); ctx.lineTo(13,-13); ctx.stroke();
    // سر چوب
    ctx.strokeStyle=item.col||'#5f3d1e'; ctx.lineWidth=11;
    ctx.beginPath(); ctx.moveTo(16,-14); ctx.lineTo(28,-25); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.28)'; ctx.lineWidth=2.4;
    ctx.beginPath(); ctx.moveTo(14,-17); ctx.lineTo(25,-27); ctx.stroke();
    // درخشش ویژه
    if(item.gem){ ctx.fillStyle='rgba(120,210,255,.5)'; ctx.beginPath(); ctx.arc(28,-25,12,0,TAU); ctx.fill(); }
    if(item.gold){ ctx.fillStyle='rgba(255,215,100,.5)'; ctx.beginPath(); ctx.arc(28,-25,12,0,TAU); ctx.fill(); }
    ctx.restore();
  } else if(type==='horse'){
    const sc=Math.min(.58,.58*(item.size||1));
    ctx.save(); ctx.translate(cx,cy+5); ctx.scale(sc,sc);
    G.horse(ctx,0,0,0,0,{coat:item.coat,bard:item.bard,mane:item.mane,blaze:item.blaze,spots:item.spots,socks:item.socks,size:1});
    ctx.restore();
  } else if(type==='outfit'){
    ctx.save(); ctx.translate(cx,cy+7);
    // عبا
    ctx.fillStyle=item.robe||'#7a6a4a';
    ctx.beginPath(); ctx.moveTo(-24,26); ctx.quadraticCurveTo(-27,-26,0,-28);
    ctx.quadraticCurveTo(27,-26,24,26); ctx.closePath(); ctx.fill();
    ctx.strokeStyle=G.shade(item.robe||'#7a6a4a',-50); ctx.lineWidth=2; ctx.stroke();
    // یالِ جامه
    ctx.fillStyle='rgba(255,255,255,.18)';
    ctx.beginPath(); ctx.moveTo(-14,22); ctx.quadraticCurveTo(-15,-20,0,-22); ctx.quadraticCurveTo(-4,0,-8,22); ctx.closePath(); ctx.fill();
    // کمربند
    ctx.fillStyle=item.belt||'#4a3a24'; ctx.fillRect(-22,0,44,7);
    // کلاه
    ctx.fillStyle=item.hat||'#5a4632';
    ctx.beginPath(); ctx.ellipse(0,-33,16,7.5,0,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0,-39,9,6,0,0,TAU); ctx.fill();
    ctx.restore();
  } else if(type==='iap'){
    if(item.kind==='coins'){ 
      const g=ctx.createRadialGradient(cx-6,cy-8,2,cx,cy,26);
      g.addColorStop(0,'#ffe9a8'); g.addColorStop(1,'#b9862a');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,25,0,TAU); ctx.fill();
      ctx.strokeStyle='#7a5410'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,17,0,TAU); ctx.stroke();
      ctx.fillStyle='#7a5410'; ctx.font='bold 23px Vazirmatn'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('س',cx,cy+1); 
    } else if(item.kind==='gems'){ 
      ctx.fillStyle='#37b6ff'; ctx.beginPath(); ctx.moveTo(cx,cy-26); ctx.lineTo(cx+23,cy-3); ctx.lineTo(cx,cy+26); ctx.lineTo(cx-23,cy-3); ctx.closePath(); ctx.fill(); 
      ctx.fillStyle='rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(cx,cy-26); ctx.lineTo(cx+23,cy-3); ctx.lineTo(cx,cy-2); ctx.closePath(); ctx.fill(); 
    } else if(item.kind==='bundle'){
      // پیشنهاد شگفت‌انگیز: صندوق + سکه + الماس
      ctx.save(); ctx.translate(cx,cy+4);
      ctx.fillStyle='#a0662e'; ctx.beginPath(); ctx.roundRect(-24,-6,48,26,5); ctx.fill();
      ctx.strokeStyle='#6a4418'; ctx.lineWidth=2.5; ctx.stroke();
      ctx.fillStyle='#c98a3e'; ctx.beginPath(); ctx.roundRect(-27,-14,54,12,4); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#e8b84b'; ctx.fillRect(-4,-14,8,34);
      ctx.strokeStyle='#6a4418'; ctx.strokeRect(-4,-14,8,34);
      ctx.fillStyle='#7a5410'; ctx.beginPath(); ctx.arc(0,-1,3.6,0,TAU); ctx.fill();
      ctx.restore();
      // الماس و سکه‌های اطراف
      ctx.fillStyle='#37b6ff'; ctx.beginPath(); ctx.moveTo(cx-26,cy-24); ctx.lineTo(cx-16,cy-15); ctx.lineTo(cx-26,cy-6); ctx.lineTo(cx-36,cy-15); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(cx-26,cy-24); ctx.lineTo(cx-16,cy-15); ctx.lineTo(cx-26,cy-16); ctx.closePath(); ctx.fill();
      const cg=ctx.createRadialGradient(cx+22,cy-20,1,cx+24,cy-18,10);
      cg.addColorStop(0,'#ffe9a8'); cg.addColorStop(1,'#b9862a');
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx+24,cy-18,9,0,TAU); ctx.fill();
      ctx.strokeStyle='#7a5410'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(cx+24,cy-18,6,0,TAU); ctx.stroke();
      // درخشش
      ctx.fillStyle='rgba(255,230,150,.9)';
      for(const st of [[-34,14],[34,12],[0,-32]]){ ctx.beginPath(); ctx.arc(cx+st[0],cy+st[1],2.4,0,TAU); ctx.fill(); }
    }
  } else if(type==='reward'){
    // جعبهٔ جایزهٔ تبلیغ
    ctx.save(); ctx.translate(cx,cy+2);
    ctx.fillStyle='#e8b84b'; rr(ctx,-19,-4,38,24,4); ctx.fill();
    ctx.strokeStyle='#b9862a'; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='#f3d98a'; rr(ctx,-22,-12,44,10,3); ctx.fill(); ctx.stroke();
    // روبان
    ctx.fillStyle='#c8433a'; ctx.fillRect(-3.5,-12,7,32);
    // پاپیون
    ctx.strokeStyle='#c8433a'; ctx.lineWidth=3; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(0,-12); ctx.quadraticCurveTo(-11,-20,-6,-12); ctx.quadraticCurveTo(-2,-9,0,-12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-12); ctx.quadraticCurveTo(11,-20,6,-12); ctx.quadraticCurveTo(2,-9,0,-12); ctx.stroke();
    ctx.restore();
    // ستاره‌های اطراف
    ctx.fillStyle='rgba(255,230,150,.85)';
    for(const st of [[-30,-18],[30,-14],[26,18],[-26,20]]){
      ctx.beginPath(); ctx.arc(cx+st[0],cy+st[1],2.6,0,TAU); ctx.fill();
    }
  }
};

/* ---------- پس‌زمینه منو (شب کویر) ---------- */
G.menuBG=function(ctx,t){
  const w=CH.view.w,h=CH.view.h;
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'#0d1b2e'); g.addColorStop(.55,'#1c3a6e'); g.addColorStop(.8,'#3a2a4e'); g.addColorStop(1,'#241a2e');
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  // ستاره‌ها
  if(!CH._stars){ CH._stars=[]; for(let i=0;i<90;i++)CH._stars.push([Math.random(),Math.random(),Math.random()*Math.PI*2]); }
  for(const s of CH._stars){
    const tw=.5+.5*Math.sin(t*2+s[2]);
    ctx.fillStyle='rgba(255,244,214,'+(0.25+tw*0.6).toFixed(2)+')';
    ctx.fillRect(s[0]*w,s[1]*h*0.6,2,2);
  }
  // ماه
  const mg=ctx.createRadialGradient(w*.78,h*.18,4,w*.78,h*.18,60);
  mg.addColorStop(0,'rgba(255,244,200,.95)'); mg.addColorStop(.35,'rgba(255,238,180,.5)'); mg.addColorStop(1,'rgba(255,238,180,0)');
  ctx.fillStyle=mg; ctx.beginPath(); ctx.arc(w*.78,h*.18,60,0,TAU); ctx.fill();
  ctx.fillStyle='#ffedbe'; ctx.beginPath(); ctx.arc(w*.78,h*.18,26,0,TAU); ctx.fill();
  ctx.fillStyle='rgba(180,160,110,.35)'; ctx.beginPath(); ctx.arc(w*.78-8,h*.18-5,5,0,TAU); ctx.fill(); ctx.beginPath(); ctx.arc(w*.78+9,h*.18+8,4,0,TAU); ctx.fill();
  // کوه‌ها و گنبدها (سیلوئت)
  const base=h*.72;
  ctx.fillStyle='#141f38';
  ctx.beginPath(); ctx.moveTo(0,base);
  for(let x=0;x<=w;x+=40){ ctx.lineTo(x,base-Math.abs(Math.sin(x*.008+2))*h*.12); }
  ctx.lineTo(w,base); ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.fill();
  // گنبد و بادگیر
  G.silhouetteDome(ctx,w*.16,base,46,'#101a30');
  G.silhouetteDome(ctx,w*.3,base,30,'#101a30');
  G.windTower(ctx,w*.55,base,'#101a30');
  G.silhouetteDome(ctx,w*.9,base,38,'#101a30');
  // تپه شنی جلو
  ctx.fillStyle='#2a2038';
  ctx.beginPath(); ctx.moveTo(0,h);
  ctx.quadraticCurveTo(w*.25,h*.78,w*.5,h*.86);
  ctx.quadraticCurveTo(w*.78,h*.94,w,h*.82); ctx.lineTo(w,h); ctx.fill();
  // سواران در حال گالوپ (سایه‌ها)
  const t2=(t*.05)%1.3;
  const rx=w*(1.15-t2*1.3), ry=h*.87;
  ctx.save(); ctx.globalAlpha=.5; ctx.translate(rx,ry); ctx.scale(1.4,1.4);
  ctx.fillStyle='#0a0f1c';
  G.horse(ctx,0,0,0,t*10,{coat:'#0a0f1c',bard:'#0a0f1c'});
  ctx.beginPath(); ctx.ellipse(2,-8,9,10,0,0,TAU); ctx.fill();
  ctx.restore();
  // ذرات شن معلق
  if(CH.Q.detail){
    if(!CH._dust){ CH._dust=[]; for(let i=0;i<26;i++)CH._dust.push([Math.random(),Math.random(),CH.u.rand(.4,1)]); }
    for(const d of CH._dust){
      const x=(d[0]+t*.01*d[2])%1, y=d[1];
      ctx.fillStyle='rgba(232,184,75,'+(.14*d[2]).toFixed(2)+')';
      ctx.beginPath(); ctx.arc(x*w,y*h,d[2]*2.2,0,TAU); ctx.fill();
    }
  }
};
G.silhouetteDome=function(ctx,x,base,r,col){
  ctx.fillStyle=col;
  ctx.beginPath(); ctx.moveTo(x-r,base); ctx.lineTo(x-r,base-r*.4);
  ctx.quadraticCurveTo(x-r,base-r*1.6,x,base-r*1.6);
  ctx.quadraticCurveTo(x+r,base-r*1.6,x+r,base-r*.4); ctx.lineTo(x+r,base); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x,base-r*1.6-r*.5); ctx.lineTo(x+r*.22,base-r*1.5); ctx.lineTo(x-r*.22,base-r*1.5); ctx.closePath(); ctx.fill();
};
G.windTower=function(ctx,x,base,col){
  ctx.fillStyle=col;
  ctx.fillRect(x-14,base-84,28,84);
  ctx.fillStyle='rgba(255,220,140,.25)';
  for(let i=0;i<3;i++){ ctx.fillRect(x-14,base-76+i*24,6,14); ctx.fillRect(x+8,base-76+i*24,6,14); }
};

/* ---------- آیکون بوت ---------- */
G.emblem=function(cv){
  const ctx=cv.getContext('2d'); const s=cv.width;
  ctx.clearRect(0,0,s,s);
  ctx.save(); ctx.translate(s/2,s/2);
  ctx.strokeStyle='#e8b84b'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.arc(0,0,s*.46,0,TAU); ctx.stroke();
  ctx.strokeStyle='rgba(232,184,75,.4)'; ctx.beginPath(); ctx.arc(0,0,s*.4,0,TAU); ctx.stroke();
  ctx.rotate(-.65);
  ctx.strokeStyle='#f3d98a'; ctx.lineWidth=s*.045; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(-s*.22,s*.3); ctx.lineTo(s*.14,-s*.14); ctx.stroke();
  ctx.strokeStyle='#e8b84b'; ctx.lineWidth=s*.09;
  ctx.beginPath(); ctx.moveTo(s*.14,-s*.14); ctx.lineTo(s*.26,-s*.24); ctx.stroke();
  ctx.rotate(1.3);
  ctx.strokeStyle='#f3d98a'; ctx.lineWidth=s*.045;
  ctx.beginPath(); ctx.moveTo(-s*.22,s*.3); ctx.lineTo(s*.14,-s*.14); ctx.stroke();
  ctx.strokeStyle='#e8b84b'; ctx.lineWidth=s*.09;
  ctx.beginPath(); ctx.moveTo(s*.14,-s*.14); ctx.lineTo(s*.26,-s*.24); ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#fff6e0'; ctx.beginPath(); ctx.arc(s/2,s*.62,s*.07,0,TAU); ctx.fill();
};
})();
