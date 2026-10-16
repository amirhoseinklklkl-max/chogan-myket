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

/* ---------- پرتره دیالوگ ---------- */
G.portrait=function(ctx,id,size){
  const P=CH.CHARS[id]||CH.CHARS.villager;
  const s=size/112;
  ctx.save(); ctx.scale(s,s); ctx.clearRect(0,0,112,112);
  // پس‌زمینه
  const g=ctx.createLinearGradient(0,0,0,112);
  g.addColorStop(0,'#2a4a80'); g.addColorStop(1,'#152a4d');
  ctx.fillStyle=g; ctx.fillRect(0,0,112,112);
  // هاله
  ctx.fillStyle='rgba(232,184,75,.12)'; ctx.beginPath(); ctx.arc(56,52,44,0,TAU); ctx.fill();
  const skin=P.skin||'#eab98c', hair=P.hair||'#2e2016';
  // گردن
  ctx.fillStyle=shade(skin,-20); ctx.fillRect(46,74,20,18);
  // شانه / عبا
  ctx.fillStyle=P.robe||'#7a6a4a';
  ctx.beginPath(); ctx.moveTo(14,112); ctx.quadraticCurveTo(56,72,98,112); ctx.closePath(); ctx.fill();
  // سر
  ctx.fillStyle=skin; ctx.strokeStyle=shade(skin,-60); ctx.lineWidth=2;
  ctx.beginPath(); ctx.ellipse(56,52,26,29,0,0,TAU); ctx.fill(); ctx.stroke();
  // موی زن
  if(P.female){ ctx.fillStyle=hair; ctx.beginPath(); ctx.ellipse(56,46,30,30,0,Math.PI*.9,Math.PI*2.1); ctx.fill();
    ctx.fillStyle=P.scarf||'#8a3a4a'; ctx.beginPath(); ctx.ellipse(56,52,32,33,0,Math.PI*.85,Math.PI*2.15); ctx.fill();
    ctx.fillStyle=skin; ctx.beginPath(); ctx.ellipse(56,56,20,22,0,0,TAU); ctx.fill(); }
  else { ctx.fillStyle=hair; ctx.beginPath(); ctx.ellipse(56,40,26,18,0,Math.PI,TAU); ctx.fill(); }
  // ابرو و چشم
  ctx.fillStyle='#241608';
  ctx.beginPath(); ctx.ellipse(45,48,2.6,1.4,-.15,0,TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(67,48,2.6,1.4,.15,0,TAU); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.ellipse(45,54,4.5,5,0,0,TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(67,54,4.5,5,0,0,TAU); ctx.fill();
  ctx.fillStyle='#241608'; ctx.beginPath(); ctx.arc(45,54,2.4,0,TAU); ctx.fill(); ctx.beginPath(); ctx.arc(67,54,2.4,0,TAU); ctx.fill();
  // لبخند
  ctx.strokeStyle=shade(skin,-70); ctx.lineWidth=2.4; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(56,64,9,0.2*Math.PI,0.8*Math.PI); ctx.stroke();
  if(P.beard){ ctx.strokeStyle=P.beard; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(56,62,13,0.15*Math.PI,0.85*Math.PI); ctx.stroke();
    if(P.beard==='#ddd'){ ctx.fillStyle='rgba(230,230,230,.85)'; ctx.beginPath(); ctx.ellipse(56,78,14,8,0,0,Math.PI); ctx.fill(); } }
  // کلاه
  const hat=P.hat;
  if(hat==='turban'){ ctx.fillStyle=P.hatCol||'#8a6a4a'; ctx.beginPath(); ctx.ellipse(56,26,27,14,0,0,TAU); ctx.fill(); ctx.fillStyle=shade(P.hatCol||'#8a6a4a',25); ctx.beginPath(); ctx.ellipse(56,20,20,8,0,0,TAU); ctx.fill(); }
  else if(hat==='cap'){ ctx.fillStyle=P.hatCol||'#4a3a26'; ctx.beginPath(); ctx.arc(56,32,24,Math.PI,TAU); ctx.fill(); ctx.fillRect(30,28,52,8); }
  else if(hat==='helmet'){ ctx.fillStyle='#5a5f68'; ctx.beginPath(); ctx.arc(56,42,28,Math.PI,TAU); ctx.fill(); ctx.fillStyle='#e8b84b'; ctx.fillRect(28,38,56,7); }
  else if(hat==='royal'){ ctx.fillStyle='#caa84f'; ctx.beginPath(); ctx.ellipse(56,24,29,13,0,0,TAU); ctx.fill(); ctx.fillStyle='#1c3a6e'; ctx.beginPath(); ctx.ellipse(56,20,20,8,0,0,TAU); ctx.fill(); ctx.fillStyle='#e8b84b'; ctx.beginPath(); ctx.moveTo(56,10); ctx.lineTo(60,18); ctx.lineTo(56,15); ctx.lineTo(52,18); ctx.closePath(); ctx.fill(); }
  // رخصت زن: گوشواره
  if(P.female){ ctx.fillStyle='#e8b84b'; ctx.beginPath(); ctx.arc(32,58,3,0,TAU); ctx.fill(); ctx.beginPath(); ctx.arc(80,58,3,0,TAU); ctx.fill(); }
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
    } else if(item.kind==='noads'){
      ctx.strokeStyle='#8fa8c8'; ctx.lineWidth=4;
      ctx.beginPath(); ctx.roundRect(cx-22,cy-15,44,30,7); ctx.stroke();
      ctx.fillStyle='#8fa8c8'; ctx.font='bold 13px Vazirmatn'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('آگهی',cx,cy+1);
      ctx.strokeStyle='#c8433a'; ctx.lineWidth=5; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(cx-26,cy+20); ctx.lineTo(cx+26,cy-20); ctx.stroke();
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
