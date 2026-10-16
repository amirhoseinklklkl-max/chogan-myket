/* چوگان: میراث پارس — جهان داستانی (نقشه بزرگ: روستا، شهر، باغ شاهی، بازار، کاروان‌سرا) */
(function(){
const G=CH.G, TAU=Math.PI*2;
const W={w:3400,h:2000};
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
  {x:1450,y:900,w:60,h:1100,name:'wall2'},
  // شهر — آکادمی
  {x:1780,y:260,w:320,h:210,name:'academy'},
  {x:2200,y:300,w:180,h:150,name:'city1'},
  {x:2230,y:560,w:150,h:130,name:'city2'},
  // میدان بازار شهر (جنوبِ زمین آکادمی — بدون تداخل با حلقه‌های تمرین)
  {x:2420,y:1120,w:90,h:90,name:'fountain'},
  {x:2020,y:1120,w:110,h:70,name:'stall1'},
  {x:2200,y:1120,w:110,h:70,name:'stall2'},
  // کاروان‌سرای شهر
  {x:1830,y:1200,w:300,h:190,name:'inn'},
  // خانه‌های شرقی
  {x:2520,y:900,w:170,h:130,name:'city3'},
  {x:2570,y:1160,w:150,h:120,name:'city4'},
  {x:2920,y:1000,w:180,h:140,name:'city5'},
  // باغ شاهی — کوشک و حوض
  {x:2660,y:240,w:180,h:120,name:'pavilion'},
  {x:2930,y:470,w:220,h:120,name:'pond'},
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
  garden:{x:2620,y:210,w:660,h:420},
  citySquare:{x:2000,y:1080,w:480,h:260},
  innYard:{x:1800,y:1180,w:360,h:250},
  riverbank:{x:560,y:1300,w:340,h:220},
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
  for(let i=0;i<300;i++){ c.beginPath(); c.ellipse(Math.random()*W.w,Math.random()*W.h,CH.u.rand(24,110),CH.u.rand(10,40),0,0,TAU); c.fill(); }
  // جاده اصلی روستا → شهر → باغ
  c.strokeStyle='#c3a263'; c.lineWidth=90; c.lineCap='round';
  c.beginPath(); c.moveTo(320,760); c.quadraticCurveTo(900,700,1400,760); c.lineTo(1560,770); c.stroke();
  c.strokeStyle='#b6975b'; c.lineWidth=74;
  c.beginPath(); c.moveTo(1560,770); c.quadraticCurveTo(1750,800,2050,760); c.stroke();
  // شاخه جاده به باغ شاهی
  c.strokeStyle='#b6975b'; c.lineWidth=56;
  c.beginPath(); c.moveTo(2380,700); c.quadraticCurveTo(2500,600,2760,560); c.stroke();
  // سنگ‌فرش جاده
  c.fillStyle='rgba(120,90,50,.13)';
  for(let i=0;i<48;i++){ const x=400+i*54+Math.random()*20, y=700+Math.sin(i*.4)*40+Math.random()*70; c.beginPath(); c.ellipse(x,y,16,7,Math.random(),0,TAU); c.fill(); }
  // چمن زمین دهکده
  drawPatch(c,330,1010,420,220,'#b8a55e');
  drawPatch(c,1800,850,560,230,'#a3a15c');
  // چمن حیاط تمرین
  drawPatch(c,180,470,330,330,'#b1a35f');
  // گندمزار جنوب دهکده
  wheatField(c,470,1560,560,290);
  // رودخانه کوچک + پل
  c.strokeStyle='rgba(90,150,170,.5)'; c.lineWidth=26;
  c.beginPath(); c.moveTo(0,1380); c.quadraticCurveTo(400,1330,760,1430); c.stroke();
  c.strokeStyle='rgba(140,200,220,.4)'; c.lineWidth=8;
  c.beginPath(); c.moveTo(0,1378); c.quadraticCurveTo(400,1328,758,1428); c.stroke();
  bridge(c,620,1395);

  // ساختمان‌های روستا
  house(c,150,280,230,150,{roof:'#a04b32',dome:false,name:'house_grand'});
  house(c,120,640,190,130,{roof:'#8a5a3a',dome:false});
  bazaar(c,640,210,170,110,'#3d7a6e'); bazaar(c,850,230,170,110,'#8a3a4a'); bazaar(c,1060,230,170,110,'#3d6e8a');
  stable(c,820,820,260,170);
  well(c,520,520,80);
  // شهر
  cityWall(c);
  academy(c,1780,260,320,210);
  house(c,2200,300,180,150,{roof:'#b8b0a0',dome:true});
  house(c,2230,560,150,130,{roof:'#a08a6a',dome:true});
  citySquare(c,2420,1120,90);
  stall(c,2020,1120,110,70,'#3d7a6e');
  stall(c,2200,1120,110,70,'#8a3a4a');
  inn(c,1830,1200,300,190);
  house(c,2520,900,170,130,{roof:'#9a8a6a',dome:true});
  house(c,2570,1160,150,120,{roof:'#8a7a5a',dome:true});
  house(c,2920,1000,180,140,{roof:'#a08a7a',dome:true});
  // باغ شاهی
  garden(c,2620,210,660,420);
  pavilion(c,2660,240,180,120);
  pond(c,2930,470,220,120);
  // زمین چوگان دهکده (دروازه‌های کوچک)
  miniGoals(c,540,1120,420,180);
  // درخت‌ها
  const trees=[[80,180],[420,140],[1180,160],[1260,300],[1330,520],[1390,1080],[1300,1240],[90,940],[60,1200],[1660,180],[1740,420],[3400,240],[3340,560],[3300,900],[1700,960],[2380,1240],[2100,1330],[900,1180],[1150,1400],[420,1500],[2400,180],[3200,700],[3260,1240],[3060,1330],[2740,1120],[1600,1250],[1560,300],[2480,780],[2560,440],[1500,1600],[1900,1700],[2350,1620],[2800,1560],[900,1700],[200,1650],[3200,180]];
  for(const t of trees) cypress(c,t[0],t[1]);
  // درخت‌های گرد باغ و روستا
  const round=[[2680,560],[2760,610],[2850,340],[3060,320],[3140,520],[2680,300],[3180,600],[700,780],[1000,660],[240,1080],[1300,900]];
  for(const t of round) roundTree(c,t[0],t[1]);
  // بوته‌ها و گل‌های باغ
  c.fillStyle='rgba(110,130,70,.5)';
  for(let i=0;i<90;i++){ c.beginPath(); c.arc(Math.random()*W.w,Math.random()*W.h,CH.u.rand(5,12),0,TAU); c.fill(); }
  const flowers=['#e86a8a','#e8b84b','#8a6ad8','#e88a5a','#fff'];
  for(let i=0;i<120;i++){
    const fx=2620+Math.random()*660, fy=210+Math.random()*420;
    c.fillStyle=flowers[i%5];
    c.beginPath(); c.arc(fx,fy,3.2,0,TAU); c.fill();
  }
  return bgCv;
};
function drawPatch(c,x,y,w,h,col){
  c.fillStyle=col;
  c.beginPath(); c.roundRect(x,y,w,h,26); c.fill();
  c.strokeStyle='rgba(255,240,200,.4)'; c.lineWidth=5; c.stroke();
  c.strokeStyle='rgba(0,0,0,.12)'; c.lineWidth=2;
  c.beginPath(); c.roundRect(x+10,y+10,w-20,h-20,20); c.stroke();
}
function wheatField(c,x,y,w,h){
  c.fillStyle='#c9a94f';
  c.beginPath(); c.roundRect(x,y,w,h,22); c.fill();
  c.strokeStyle='rgba(150,120,50,.6)'; c.lineWidth=3; c.stroke();
  c.strokeStyle='rgba(120,90,40,.45)'; c.lineWidth=2;
  for(let i=0;i<w;i+=18){
    for(let j=0;j<h;j+=26){
      c.beginPath(); c.moveTo(x+i+8,y+j+18); c.quadraticCurveTo(x+i+4,y+j+8,x+i+8,y+j+2); c.stroke();
    }
  }
}
function house(c,x,y,w,h,o){
  c.fillStyle='rgba(0,0,0,.16)'; c.beginPath(); c.roundRect(x+6,y+10,w,h,14); c.fill();
  c.fillStyle='#e0c492'; c.beginPath(); c.roundRect(x,y,w,h,12); c.fill();
  c.strokeStyle='#8a6a44'; c.lineWidth=3; c.stroke();
  if(o.dome){
    c.fillStyle=o.roof; c.beginPath(); c.arc(x+w/2,y,w*.34,Math.PI,TAU); c.fill();
    c.strokeStyle='#7a5a3a'; c.stroke();
    c.fillStyle='#caa84f'; c.beginPath(); c.moveTo(x+w/2,y-w*.34); c.lineTo(x+w/2+12,y-w*.34-16); c.lineTo(x+w/2-12,y-w*.34-16); c.closePath(); c.fill();
  } else {
    c.fillStyle=o.roof; c.beginPath(); c.roundRect(x-8,y-20,w+16,26,8); c.fill();
    c.strokeStyle='#6a4326'; c.stroke();
    c.fillStyle='rgba(90,60,30,.8)';
    for(let i=1;i<5;i++)c.fillRect(x+i*(w/5)-2,y-18,4,22);
  }
  c.fillStyle='#6a4a2e';
  c.beginPath(); c.moveTo(x+w/2-20,y+h); c.lineTo(x+w/2-20,y+h-42); c.quadraticCurveTo(x+w/2,y+h-84,x+w/2+20,y+h-42); c.lineTo(x+w/2+20,y+h); c.closePath(); c.fill();
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
  c.fillStyle=col; c.fillRect(x-6,y-18,w+12,22);
  c.fillStyle='rgba(255,255,255,.75)';
  for(let i=0;i<w;i+=34)c.fillRect(x+i,y-18,17,22);
  const rugs=['#a03a3a','#3a6a8a','#8a7a2a'];
  for(let i=0;i<3;i++){
    const rx=x+16+i*(w-60)/2.4;
    c.fillStyle=rugs[i]; c.fillRect(rx,y+18,26,52);
    c.strokeStyle='rgba(255,255,255,.5)'; c.lineWidth=2; c.strokeRect(rx+4,y+24,18,40);
  }
  c.fillStyle='#9a5a3a';
  c.beginPath(); c.ellipse(x+w-30,y+h+8,14,10,0,0,TAU); c.fill();
  c.beginPath(); c.ellipse(x+w-58,y+h+10,10,8,0,0,TAU); c.fill();
}
function stall(c,x,y,w,h,col){
  c.fillStyle='rgba(0,0,0,.15)'; c.beginPath(); c.roundRect(x+4,y+8,w,h,8); c.fill();
  c.fillStyle='#d8bd8c'; c.beginPath(); c.roundRect(x,y,w,h,8); c.fill();
  c.strokeStyle='#8a6a44'; c.lineWidth=2.5; c.stroke();
  // میز جلو
  c.fillStyle='#8a6440'; c.fillRect(x-6,y+h,w+12,10);
  // سایه‌بان
  c.fillStyle=col; c.fillRect(x-8,y-16,w+16,18);
  c.fillStyle='rgba(255,255,255,.75)';
  for(let i=0;i<w;i+=28)c.fillRect(x+i,y-16,14,18);
  // اجناس
  c.fillStyle='#c9a94f'; c.beginPath(); c.ellipse(x+w*.3,y+h,12,7,0,0,TAU); c.fill();
  c.fillStyle='#9a5a3a'; c.beginPath(); c.ellipse(x+w*.68,y+h+2,9,6,0,0,TAU); c.fill();
  c.fillStyle='#3d7a6e'; c.fillRect(x+w*.5,y+12,16,20);
}
function stable(c,x,y,w,h){
  c.fillStyle='rgba(0,0,0,.16)'; c.beginPath(); c.roundRect(x+8,y+12,w,h,14); c.fill();
  c.fillStyle='#cfa878'; c.beginPath(); c.roundRect(x,y,w,h,12); c.fill();
  c.strokeStyle='#7a5636'; c.lineWidth=3; c.stroke();
  c.fillStyle='#8a5a32'; c.beginPath(); c.roundRect(x-10,y-24,w+20,30,8); c.fill();
  c.strokeStyle='#4a3a26'; c.lineWidth=6;
  c.beginPath(); c.arc(x+44,y+h*.45,17,Math.PI*.15,Math.PI*.85,true); c.stroke();
  c.fillStyle='#6a4a2c';
  for(const dx of [w*.42,w*.72]){ c.fillRect(x+dx-24,y+h-66,48,66); c.strokeStyle='#4a3420'; c.lineWidth=2;
    for(let i=0;i<4;i++)c.strokeRect(x+dx-24+i*12,y+h-66,12,66); }
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
function bridge(c,x,y){
  // پل چوبی کوچک روی رودخانه
  c.save(); c.translate(x,y);
  c.fillStyle='rgba(0,0,0,.18)'; c.beginPath(); c.roundRect(-38,-4,84,18,6); c.fill();
  c.fillStyle='#8a6440'; c.beginPath(); c.roundRect(-42,-8,84,16,5); c.fill();
  c.strokeStyle='#5a4028'; c.lineWidth=2;
  for(let i=-36;i<=36;i+=12){ c.beginPath(); c.moveTo(i,-8); c.lineTo(i,8); c.stroke(); }
  c.restore();
}
function cityWall(c){
  c.fillStyle='#c8b088';
  c.fillRect(1450,0,60,640); c.fillRect(1450,900,60,1100);
  c.strokeStyle='#8a7048'; c.lineWidth=4;
  c.strokeRect(1450,0,60,640); c.strokeRect(1450,900,60,1100);
  c.fillStyle='rgba(120,90,55,.5)';
  for(let y=20;y<640;y+=46)c.fillRect(1456,y,48,8);
  for(let y=920;y<2000;y+=46)c.fillRect(1456,y,48,8);
  c.fillStyle='#d8c098';
  for(let y=0;y<640;y+=40)c.fillRect(1442,y,76,18);
  for(let y=900;y<2000;y+=40)c.fillRect(1442,y,76,18);
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
  for(const dx of [w*.28,w*.72]){
    c.fillStyle='#1ba894'; c.beginPath(); c.arc(x+dx,y+6,44,Math.PI,TAU); c.fill();
    c.strokeStyle='#0e6e60'; c.stroke();
    c.fillStyle='#e8b84b'; c.beginPath(); c.moveTo(x+dx,y-38); c.lineTo(x+dx+9,y-52); c.lineTo(x+dx-9,y-52); c.closePath(); c.fill();
  }
  c.fillStyle='#caa84f';
  for(let i=0;i<5;i++)c.fillRect(x+30+i*(w-60)/4,y+h*.4,10,h*.6);
  c.fillStyle='#5a3a22';
  c.beginPath(); c.moveTo(x+w/2-34,y+h); c.lineTo(x+w/2-34,y+h-50); c.quadraticCurveTo(x+w/2,y+h-100,x+w/2+34,y+h-50); c.lineTo(x+w/2+34,y+h); c.closePath(); c.fill();
  c.fillStyle='#1c3a6e'; c.fillRect(x+w/2-34,y+h-64,68,14);
  c.fillStyle='#f0dcae'; c.font='bold 17px Vazirmatn'; c.textAlign='center';
  c.fillText('آکادمی سلطنتی چوگان',x+w/2,y+h-51);
  for(const px of [x-16,x+w+16]){
    c.strokeStyle='#6a4a2c'; c.lineWidth=4;
    c.beginPath(); c.moveTo(px,y+20); c.lineTo(px,y-40); c.stroke();
    c.fillStyle='#c8433a'; c.beginPath(); c.moveTo(px,y-40); c.quadraticCurveTo(px+26,y-36,px+34,y-28); c.lineTo(px,y-16); c.closePath(); c.fill();
  }
}
function citySquare(c,x,y,s){
  // سنگ‌فرش میدان
  c.fillStyle='rgba(190,160,110,.55)';
  c.beginPath(); c.ellipse(x+s/2,y+s/2+60,190,120,0,0,TAU); c.fill();
  c.strokeStyle='rgba(140,110,70,.5)'; c.lineWidth=3; c.stroke();
  // حوض هشت‌ضلعی
  c.fillStyle='#b8c4cc'; c.beginPath();
  for(let i=0;i<8;i++){ const a=i*TAU/8+TAU/16, r=s*.62; const px=x+s/2+Math.cos(a)*r, py=y+s/2+Math.sin(a)*r*.85; i?c.lineTo(px,py):c.moveTo(px,py); }
  c.closePath(); c.fill();
  c.strokeStyle='#7a8a94'; c.lineWidth=3; c.stroke();
  c.fillStyle='rgba(140,200,220,.55)'; c.beginPath(); c.ellipse(x+s/2,y+s/2,s*.44,s*.36,0,0,TAU); c.fill();
  // ستون فواره
  c.fillStyle='#d8d0c0'; c.beginPath(); c.ellipse(x+s/2,y+s/2,s*.14,s*.1,0,0,TAU); c.fill();
  c.fillStyle='rgba(255,255,255,.6)';
  c.beginPath(); c.ellipse(x+s/2,y+s/2-8,s*.09,s*.06,0,0,TAU); c.fill();
}
function inn(c,x,y,w,h){
  // کاروان‌سرای شهر — حیاط با ایوان ستون‌دار
  c.fillStyle='rgba(0,0,0,.17)'; c.beginPath(); c.roundRect(x+8,y+12,w,h,14); c.fill();
  c.fillStyle='#d8bd8c'; c.beginPath(); c.roundRect(x,y,w,h,12); c.fill();
  c.strokeStyle='#8a6a44'; c.lineWidth=3.5; c.stroke();
  // بادگیر
  c.fillStyle='#c8a878'; c.fillRect(x+w-58,y-52,40,54);
  c.strokeStyle='#7a5636'; c.lineWidth=2.5; c.strokeRect(x+w-58,y-52,40,54);
  c.fillStyle='rgba(120,90,55,.55)';
  c.fillRect(x+w-52,y-46,7,40); c.fillRect(x+w-32,y-46,7,40);
  // ایوان
  c.fillStyle='#caa84f';
  for(let i=0;i<4;i++)c.fillRect(x+26+i*(w-52)/3,y+h-58,9,58);
  c.fillStyle='#5a3a22';
  c.beginPath(); c.moveTo(x+18,y+h-6); c.lineTo(x+18,y+h-46); c.quadraticCurveTo(x+w/2,y+h-96,x+w-18,y+h-46); c.lineTo(x+w-18,y+h-6); c.closePath(); c.fill();
  c.fillStyle='#1c3a6e'; c.fillRect(x+22,y+h-58,w-44,12);
  c.fillStyle='#f0dcae'; c.font='bold 15px Vazirmatn'; c.textAlign='center';
  c.fillText('کاروان‌سرای شتران',x+w/2,y+h-49);
  // فرش‌ها و کوزه‌ها
  c.fillStyle='#a03a3a'; c.fillRect(x+8,y+26,22,44);
  c.strokeStyle='rgba(255,255,255,.5)'; c.strokeRect(x+12,y+32,14,32);
  c.fillStyle='#9a5a3a';
  c.beginPath(); c.ellipse(x+w*.3,y+h+10,13,9,0,0,TAU); c.fill();
  c.beginPath(); c.ellipse(x+w*.66,y+h+12,10,7,0,0,TAU); c.fill();
}
function pavilion(c,x,y,w,h){
  // کوشک باغ شاهی
  c.fillStyle='rgba(0,0,0,.18)'; c.beginPath(); c.roundRect(x+8,y+12,w,h,14); c.fill();
  c.fillStyle='#eee0b8'; c.beginPath(); c.roundRect(x,y,w,h,12); c.fill();
  c.strokeStyle='#9a7a48'; c.lineWidth=3.5; c.stroke();
  // گنبد کاشی
  c.fillStyle='#1ba894'; c.beginPath(); c.arc(x+w/2,y+4,w*.36,Math.PI,TAU); c.fill();
  c.strokeStyle='#0e6e60'; c.stroke();
  c.fillStyle='#e8b84b'; c.beginPath(); c.moveTo(x+w/2,y-w*.32); c.lineTo(x+w/2+10,y-w*.32-14); c.lineTo(x+w/2-10,y-w*.32-14); c.closePath(); c.fill();
  // ستون‌ها
  c.fillStyle='#caa84f';
  for(let i=0;i<5;i++)c.fillRect(x+18+i*(w-36)/4,y+h*.35,9,h*.65);
  c.fillStyle='#3d7a6e'; c.fillRect(x+16,y+h-52,w-32,14);
  c.fillStyle='#f0dcae'; c.font='bold 14px Vazirmatn'; c.textAlign='center';
  c.fillText('کوشک باغ شاهی',x+w/2,y+h-41);
}
function pond(c,x,y,w,h){
  // حوض بزرگ باغ
  c.fillStyle='#9ab8c4';
  c.beginPath(); c.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,TAU); c.fill();
  c.strokeStyle='#7a98a4'; c.lineWidth=4; c.stroke();
  c.fillStyle='rgba(180,220,235,.5)';
  c.beginPath(); c.ellipse(x+w*.4,y+h*.42,w*.3,h*.28,0,0,TAU); c.fill();
  // نیلوفرها
  c.fillStyle='#e86a8a';
  c.beginPath(); c.arc(x+w*.62,y+h*.6,6,0,TAU); c.fill();
  c.beginPath(); c.arc(x+w*.34,y+h*.68,5,0,TAU); c.fill();
  c.fillStyle='#3e8a5a';
  c.beginPath(); c.ellipse(x+w*.62,y+h*.62,9,4,0,0,TAU); c.fill();
  c.beginPath(); c.ellipse(x+w*.34,y+h*.7,8,3.6,0,0,TAU); c.fill();
}
function garden(c,x,y,w,h){
  // چمن باغ + نهر
  c.fillStyle='#8aa860';
  c.beginPath(); c.roundRect(x,y,w,h,40); c.fill();
  c.strokeStyle='rgba(255,240,200,.4)'; c.lineWidth=5; c.stroke();
  // نهر آب
  c.strokeStyle='rgba(120,190,210,.5)'; c.lineWidth=16;
  c.beginPath(); c.moveTo(x+20,y+h*.5); c.quadraticCurveTo(x+w*.5,y+h*.4,x+w-20,y+h*.55); c.stroke();
  // مسیر سنگی
  c.fillStyle='rgba(200,175,120,.7)';
  c.beginPath(); c.roundRect(x+w*.35,y-14,26,h+28,12); c.fill();
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
function roundTree(c,x,y){
  const s=CH.u.rand(.85,1.15);
  c.save(); c.translate(x,y); c.scale(s,s);
  c.fillStyle='rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(4,6,16,6,0,0,TAU); c.fill();
  c.fillStyle='#5a4028'; c.fillRect(-3,-8,6,18);
  c.fillStyle='#4a7a3c';
  c.beginPath(); c.arc(0,-26,20,0,TAU); c.fill();
  c.fillStyle='#5a8a48';
  c.beginPath(); c.arc(-8,-32,12,0,TAU); c.fill();
  c.beginPath(); c.arc(8,-30,10,0,TAU); c.fill();
  c.fillStyle='#c8433a';
  c.beginPath(); c.arc(-10,-20,2.5,0,TAU); c.fill();
  c.beginPath(); c.arc(12,-24,2.5,0,TAU); c.fill();
  c.restore();
}

W.bg=function(){ if(!bgCv)W.buildBG(); return bgCv; };
W.BG_SCALE=.5;
})();
