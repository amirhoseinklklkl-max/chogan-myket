/* چوگان: میراث پارس — جهان داستانی (نقشه روستا + شهر، پیش‌رندر پس‌زمینه) */
(function(){
const G=CH.G, TAU=Math.PI*2;
const W={w:2600,h:1600};
CH.world=W;

/* دیوارها و برخوردها */
W.solids=[
  // روستا — خانه‌ها
  {x:150,y:280,w:230,h:150,name:'house_grand'},
  {x:120,y:640,w:190,h:130,name:'house_home'},
  {x:640,y:210,w:170,h:110,name:'bazaar1'},
  {x:850,y:230,w:170,h:110,name:'bazaar2'},
  {x:1060,y:230,w:170,h:110,name:'bazaar3'},
  {x:820,y:820,w:260,h:170,name:'stable'},
  {x:520,y:520,w:80,h:80,name:'well'},
  // دیوار شهر و دروازه
  {x:1450,y:0,w:60,h:640,name:'wall'},
  {x:1450,y:900,w:60,h:700,name:'wall2'},
  // شهر — آکادمی
  {x:1780,y:260,w:320,h:210,name:'academy'},
  {x:2200,y:300,w:180,h:150,name:'city1'},
  {x:2230,y:560,w:150,h:130,name:'city2'},
  {x:1800,y:1080,w:170,h:120,name:'caravan'},
];
W.isSolid=function(x,y,r){
  for(const s of W.solids){
    if(x+r>s.x&&x-r<s.x+s.w&&y+r>s.y&&y-r<s.y+s.h)return true;
  }
  return false;
};

/* محدوده‌های مهم */
W.zones={
  practiceYard:{x:180,y:470,w:330,h:330},
  villageField:{x:330,y:1010,w:420,h:220},
  royalField:{x:1800,y:850,w:560,h:230},
  cityGate:{x:1480,y:640,w:100,h:260},
};

/* ---------- پیش‌رندر پس‌زمینه ---------- */
let bgCv=null;
W.buildBG=function(){
  const scale=.5;
  bgCv=document.createElement('canvas');
  bgCv.width=W.w*scale; bgCv.height=W.h*scale;
  const c=bgCv.getContext('2d');
  c.scale(scale,scale);
  // زمین پایه
  const g=c.createLinearGradient(0,0,W.w,W.h);
  g.addColorStop(0,'#d9bd82'); g.addColorStop(.5,'#d2b476'); g.addColorStop(1,'#cbae70');
  c.fillStyle=g; c.fillRect(0,0,W.w,W.h);
  // لکه‌های خاک
  c.fillStyle='rgba(0,0,0,.045)';
  for(let i=0;i<220;i++){ c.beginPath(); c.ellipse(Math.random()*W.w,Math.random()*W.h,CH.u.rand(24,110),CH.u.rand(10,40),0,0,TAU); c.fill(); }
  // جاده اصلی روستا → شهر
  c.strokeStyle='#c3a263'; c.lineWidth=90; c.lineCap='round';
  c.beginPath(); c.moveTo(320,760); c.quadraticCurveTo(900,700,1400,760); c.lineTo(1560,770); c.stroke();
  c.strokeStyle='#b6975b'; c.lineWidth=74;
  c.beginPath(); c.moveTo(1560,770); c.quadraticCurveTo(1750,800,2050,760); c.stroke();
  // سنگ‌فرش جاده
  c.fillStyle='rgba(120,90,50,.13)';
  for(let i=0;i<40;i++){ const x=400+i*50+Math.random()*20, y=700+Math.sin(i*.4)*40+Math.random()*70; c.beginPath(); c.ellipse(x,y,16,7,Math.random(),0,TAU); c.fill(); }
  // چمن زمین دهکده
  drawPatch(c,330,1010,420,220,'#b8a55e');
  drawPatch(c,1800,850,560,230,'#a3a15c');
  // چمن حیاط تمرین
  drawPatch(c,180,470,330,330,'#b1a35f');
  // رودخانه کوچک تزئینی
  c.strokeStyle='rgba(90,150,170,.5)'; c.lineWidth=26;
  c.beginPath(); c.moveTo(0,1380); c.quadraticCurveTo(400,1330,700,1420); c.stroke();
  c.strokeStyle='rgba(140,200,220,.4)'; c.lineWidth=8;
  c.beginPath(); c.moveTo(0,1378); c.quadraticCurveTo(400,1328,700,1418); c.stroke();

  // ساختمان‌ها
  house(c,150,280,230,150,{roof:'#a04b32',dome:false,name:'house_grand'});
  house(c,120,640,190,130,{roof:'#8a5a3a',dome:false});
  bazaar(c,640,210,170,110,'#3d7a6e'); bazaar(c,850,230,170,110,'#8a3a4a'); bazaar(c,1060,230,170,110,'#3d6e8a');
  stable(c,820,820,260,170);
  well(c,520,520,80);
  cityWall(c);
  academy(c,1780,260,320,210);
  house(c,2200,300,180,150,{roof:'#b8b0a0',dome:true});
  house(c,2230,560,150,130,{roof:'#a08a6a',dome:true});
  caravan(c,1800,1080,170,120);
  // زمین چوگان دهکده (دروازه‌های کوچک)
  miniGoals(c,540,1120,420,180);
  // درخت‌ها
  const trees=[[80,180],[420,140],[1180,160],[1260,300],[1330,520],[1390,1080],[1300,1240],[90,940],[60,1200],[1660,180],[1740,420],[2600,240],[2560,560],[2520,900],[1700,960],[2380,1240],[2100,1320],[900,1180],[1150,1400],[420,1500]];
  for(const t of trees) cypress(c,t[0],t[1]);
  // بوته‌ها
  c.fillStyle='rgba(110,130,70,.5)';
  for(let i=0;i<70;i++){ c.beginPath(); c.arc(Math.random()*W.w,Math.random()*W.h,CH.u.rand(5,12),0,TAU); c.fill(); }
  return bgCv;
};
function drawPatch(c,x,y,w,h,col){
  c.fillStyle=col;
  c.beginPath(); c.roundRect(x,y,w,h,26); c.fill();
  c.strokeStyle='rgba(255,240,200,.4)'; c.lineWidth=5; c.stroke();
  c.strokeStyle='rgba(0,0,0,.12)'; c.lineWidth=2;
  c.beginPath(); c.roundRect(x+10,y+10,w-20,h-20,20); c.stroke();
}
function house(c,x,y,w,h,o){
  // سایه
  c.fillStyle='rgba(0,0,0,.16)'; c.beginPath(); c.roundRect(x+6,y+10,w,h,14); c.fill();
  // بدنه گل‌آلود
  c.fillStyle='#e0c492'; c.beginPath(); c.roundRect(x,y,w,h,12); c.fill();
  c.strokeStyle='#8a6a44'; c.lineWidth=3; c.stroke();
  if(o.dome){
    c.fillStyle=o.roof; c.beginPath(); c.arc(x+w/2,y,w*.34,Math.PI,TAU); c.fill();
    c.strokeStyle='#7a5a3a'; c.stroke();
    c.fillStyle='#caa84f'; c.beginPath(); c.moveTo(x+w/2,y-w*.34); c.lineTo(x+w/2+12,y-w*.34-16); c.lineTo(x+w/2-12,y-w*.34-16); c.closePath(); c.fill();
  } else {
    c.fillStyle=o.roof; c.beginPath(); c.roundRect(x-8,y-20,w+16,26,8); c.fill();
    c.strokeStyle='#6a4326'; c.stroke();
    // تیرهای چوبی
    c.fillStyle='rgba(90,60,30,.8)';
    for(let i=1;i<5;i++)c.fillRect(x+i*(w/5)-2,y-18,4,22);
  }
  // در گنبدی
  c.fillStyle='#6a4a2e';
  c.beginPath(); c.moveTo(x+w/2-20,y+h); c.lineTo(x+w/2-20,y+h-42); c.quadraticCurveTo(x+w/2,y+h-84,x+w/2+20,y+h-42); c.lineTo(x+w/2+20,y+h); c.closePath(); c.fill();
  // پنجره‌ها
  c.fillStyle='#7a563a';
  c.beginPath(); c.arc(x+w*.24,y+h*.45,13,0,TAU); c.fill();
  c.beginPath(); c.arc(x+w*.76,y+h*.45,13,0,TAU); c.fill();
  c.fillStyle='rgba(255,220,140,.5)';
  c.beginPath(); c.arc(x+w*.24,y+h*.45,8,0,TAU); c.fill();
  c.beginPath(); c.arc(x+w*.76,y+h*.45,8,0,TAU); c.fill();
}
function bazaar(c,x,y,w,h,col){
  c.fillStyle='rgba(0,0,0,.16)'; c.beginPath(); c.roundRect(x+6,y+10,w,h,10); c.fill();
  c.fillStyle='#d8bd8c'; c.beginPath(); c.roundRect(x,y,w,h,10); c.fill();
  c.strokeStyle='#8a6a44'; c.lineWidth=3; c.stroke();
  // سایه‌بان راه‌راه
  c.fillStyle=col; c.fillRect(x-6,y-18,w+12,22);
  c.fillStyle='rgba(255,255,255,.75)';
  for(let i=0;i<w;i+=34)c.fillRect(x+i,y-18,17,22);
  // فرش‌های آویزان
  const rugs=['#a03a3a','#3a6a8a','#8a7a2a'];
  for(let i=0;i<3;i++){
    const rx=x+16+i*(w-60)/2.4;
    c.fillStyle=rugs[i]; c.fillRect(rx,y+18,26,52);
    c.strokeStyle='rgba(255,255,255,.5)'; c.lineWidth=2; c.strokeRect(rx+4,y+24,18,40);
  }
  // کوزه‌ها
  c.fillStyle='#9a5a3a';
  c.beginPath(); c.ellipse(x+w-30,y+h+8,14,10,0,0,TAU); c.fill();
  c.beginPath(); c.ellipse(x+w-58,y+h+10,10,8,0,0,TAU); c.fill();
}
function stable(c,x,y,w,h){
  c.fillStyle='rgba(0,0,0,.16)'; c.beginPath(); c.roundRect(x+8,y+12,w,h,14); c.fill();
  c.fillStyle='#cfa878'; c.beginPath(); c.roundRect(x,y,w,h,12); c.fill();
  c.strokeStyle='#7a5636'; c.lineWidth=3; c.stroke();
  c.fillStyle='#8a5a32'; c.beginPath(); c.roundRect(x-10,y-24,w+20,30,8); c.fill();
  // علامت نعل اسب
  c.strokeStyle='#4a3a26'; c.lineWidth=6;
  c.beginPath(); c.arc(x+44,y+h*.45,17,Math.PI*.15,Math.PI*.85,true); c.stroke();
  // درهای اصطبل
  c.fillStyle='#6a4a2c';
  for(const dx of [w*.42,w*.72]){ c.fillRect(x+dx-24,y+h-66,48,66); c.strokeStyle='#4a3420'; c.lineWidth=2;
    for(let i=0;i<4;i++)c.strokeRect(x+dx-24+i*12,y+h-66,12,66); }
  // کاه
  c.fillStyle='#d8b860';
  c.beginPath(); c.ellipse(x+w*.3,y+h+14,30,12,0,0,TAU); c.fill();
  c.beginPath(); c.ellipse(x+w*.62,y+h+18,24,10,0,0,TAU); c.fill();
}
function well(c,x,y,s){
  c.fillStyle='rgba(0,0,0,.16)'; c.beginPath(); c.ellipse(x+s/2+5,y+s/2+8,s*.42,s*.2,0,0,TAU); c.fill();
  c.fillStyle='#9a9a92'; c.beginPath(); c.ellipse(x+s/2,y+s/2,s*.42,s*.28,0,0,TAU); c.fill();
  c.fillStyle='#5a5a55'; c.beginPath(); c.ellipse(x+s/2,y+s/2,s*.3,s*.18,0,0,TAU); c.fill();
  c.strokeStyle='#6a4a2c'; c.lineWidth=7;
  c.beginPath(); c.moveTo(x+s*.15,y+s*.4); c.lineTo(x+s*.15,y-s*.25); c.stroke();
  c.beginPath(); c.moveTo(x+s*.85,y+s*.4); c.lineTo(x+s*.85,y-s*.25); c.stroke();
  c.strokeStyle='#5a3a20'; c.lineWidth=4;
  c.beginPath(); c.moveTo(x+s*.15,y-s*.25); c.lineTo(x+s*.5,y-s*.05); c.lineTo(x+s*.85,y-s*.25); c.stroke();
  c.strokeStyle='#3a2a1a'; c.lineWidth=2.5;
  c.beginPath(); c.moveTo(x+s*.5,y-s*.05); c.lineTo(x+s*.5,y+s*.1); c.stroke();
  c.fillStyle='#8a5a32'; c.beginPath(); c.arc(x+s*.5,y+s*.14,7,0,TAU); c.fill();
}
function cityWall(c){
  // دیوار کاشی‌کاری
  c.fillStyle='#c8b088';
  c.fillRect(1450,0,60,640); c.fillRect(1450,900,60,700);
  c.strokeStyle='#8a7048'; c.lineWidth=4;
  c.strokeRect(1450,0,60,640); c.strokeRect(1450,900,60,700);
  c.fillStyle='rgba(120,90,55,.5)';
  for(let y=20;y<640;y+=46)c.fillRect(1456,y,48,8);
  for(let y=920;y<1600;y+=46)c.fillRect(1456,y,48,8);
  // کنگره‌ها
  c.fillStyle='#d8c098';
  for(let y=0;y<640;y+=40)c.fillRect(1442,y,76,18);
  for(let y=900;y<1600;y+=40)c.fillRect(1442,y,76,18);
  // دروازه
  c.fillStyle='#6a4a2c';
  c.beginPath(); c.moveTo(1440,640); c.lineTo(1440,790); c.quadraticCurveTo(1480,690,1520,790); c.lineTo(1520,640); c.closePath();
  c.moveTo(1440,900); c.lineTo(1440,760); c.quadraticCurveTo(1480,850,1520,760); c.lineTo(1520,900); c.closePath(); c.fill();
  c.strokeStyle='#4a3220'; c.lineWidth=4; c.stroke();
  // نقش کاشی بالای دروازه
  c.fillStyle='#1ba894'; c.beginPath(); c.arc(1480,660,26,0,TAU); c.fill();
  c.fillStyle='#e8b84b'; c.beginPath(); c.arc(1480,660,16,0,TAU); c.fill();
  c.fillStyle='#1c3a6e'; c.font='bold 20px Vazirmatn'; c.textAlign='center'; c.textBaseline='middle';
  c.fillText('چ',1480,662);
}
function academy(c,x,y,w,h){
  c.fillStyle='rgba(0,0,0,.18)'; c.beginPath(); c.roundRect(x+10,y+14,w,h,14); c.fill();
  c.fillStyle='#e8d5a8'; c.beginPath(); c.roundRect(x,y,w,h,14); c.fill();
  c.strokeStyle='#9a7a48'; c.lineWidth=4; c.stroke();
  // دو گنبد فیروزه‌ای
  for(const dx of [w*.28,w*.72]){
    c.fillStyle='#1ba894'; c.beginPath(); c.arc(x+dx,y+6,44,Math.PI,TAU); c.fill();
    c.strokeStyle='#0e6e60'; c.stroke();
    c.fillStyle='#e8b84b'; c.beginPath(); c.moveTo(x+dx,y-38); c.lineTo(x+dx+9,y-52); c.lineTo(x+dx-9,y-52); c.closePath(); c.fill();
  }
  // ایوان و ستون‌ها
  c.fillStyle='#caa84f';
  for(let i=0;i<5;i++)c.fillRect(x+30+i*(w-60)/4,y+h*.4,10,h*.6);
  c.fillStyle='#5a3a22';
  c.beginPath(); c.moveTo(x+w/2-34,y+h); c.lineTo(x+w/2-34,y+h-50); c.quadraticCurveTo(x+w/2,y+h-100,x+w/2+34,y+h-50); c.lineTo(x+w/2+34,y+h); c.closePath(); c.fill();
  // کاشی‌کاری بالای در
  c.fillStyle='#1c3a6e'; c.fillRect(x+w/2-34,y+h-64,68,14);
  c.fillStyle='#f0dcae'; c.font='bold 17px Vazirmatn'; c.textAlign='center';
  c.fillText('آکادمی سلطنتی چوگان',x+w/2,y+h-51);
  // پرچم‌ها
  for(const px of [x-16,x+w+16]){
    c.strokeStyle='#6a4a2c'; c.lineWidth=4;
    c.beginPath(); c.moveTo(px,y+20); c.lineTo(px,y-40); c.stroke();
    c.fillStyle='#c8433a'; c.beginPath(); c.moveTo(px,y-40); c.quadraticCurveTo(px+26,y-36,px+34,y-28); c.lineTo(px,y-16); c.closePath(); c.fill();
  }
}
function caravan(c,x,y,w,h){
  // چادرهای کاروان فروشندگان
  c.fillStyle='rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(x+w/2,y+h+6,w*.55,16,0,0,TAU); c.fill();
  for(let i=0;i<3;i++){
    const cx2=x+30+i*(w-60)/2;
    c.fillStyle=['#a03a3a','#3a6a8a','#a07a2a'][i];
    c.beginPath(); c.moveTo(cx2-38,y+h); c.quadraticCurveTo(cx2,y-40,cx2+38,y+h); c.closePath(); c.fill();
    c.strokeStyle='rgba(0,0,0,.3)'; c.lineWidth=2; c.stroke();
    c.fillStyle='rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(cx2-8,y+h); c.lineTo(cx2,y-34); c.lineTo(cx2+8,y+h); c.closePath(); c.fill();
  }
  c.fillStyle='#5a3a22'; c.font='bold 15px Vazirmatn'; c.textAlign='center';
  c.fillText('کاروان بازار',x+w/2,y+h+24);
}
function miniGoals(c,cx,cy,w,h){
  c.strokeStyle='rgba(90,60,25,.55)'; c.lineWidth=4;
  c.strokeRect(cx-w/2,cy-h/2,w,h);
  for(const gx of [cx-w/2,cx+w/2]){
    c.fillStyle='#6b4a2a';
    c.beginPath(); c.arc(gx,cy-h/2,8,0,TAU); c.fill();
    c.beginPath(); c.arc(gx,cy+h/2,8,0,TAU); c.fill();
  }
}
function cypress(c,x,y){
  const s=CH.u.rand(.8,1.25);
  c.save(); c.translate(x,y); c.scale(s,s);
  c.fillStyle='rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(4,6,18,7,0,0,TAU); c.fill();
  c.fillStyle='#4a3520'; c.fillRect(-3,-6,6,16);
  c.fillStyle='#2e5a3c';
  c.beginPath(); c.moveTo(0,-95); c.quadraticCurveTo(22,-55,14,-8); c.lineTo(-14,-8); c.quadraticCurveTo(-22,-55,0,-95); c.closePath(); c.fill();
  c.fillStyle='rgba(255,255,255,.12)';
  c.beginPath(); c.moveTo(0,-90); c.quadraticCurveTo(9,-55,5,-10); c.lineTo(-2,-10); c.quadraticCurveTo(-6,-55,0,-90); c.closePath(); c.fill();
  c.restore();
}

W.bg=function(){ if(!bgCv)W.buildBG(); return bgCv; };
W.BG_SCALE=.5;
})();
