/* چوگان: میراث پارس — ورودی لمسی (جوی‌استیک مجازی) و کیبورد */
(function(){
const I={joy:{x:0,y:0,on:false},pressQ:[],held:{a:false,b:false},enabled:false};
CH.input=I;

I.on=function(name,fn){ I._h=I._h||{}; (I._h[name]=I._h[name]||[]).push(fn); };
I.fire=function(name){ const hs=(I._h&&I._h[name])||[]; for(const f of hs)f(); };

/* ---------- جوی‌استیک ---------- */
const S={id:null,bx:0,by:0,R:56};
function zoneEl(){ return document.getElementById(CH.ui.hudZone==='match'?'joy-zone2':'joy-zone'); }
function setupZone(){
  const z=zoneEl(); if(!z)return;
  const base=document.getElementById(CH.ui.hudZone==='match'?'joy-base2':'joy-base');
  const thumb=document.getElementById(CH.ui.hudZone==='match'?'joy-thumb2':'joy-thumb');
  if(z._bound)return; z._bound=true;

  z.addEventListener('pointerdown',e=>{
    if(S.id!==null)return;
    S.id=e.pointerId; S.bx=e.clientX; S.by=e.clientY;
    base.style.left=e.clientX+'px'; base.style.top=e.clientY+'px';
    base.classList.remove('hidden');
    I.joy.on=true; I.joy.x=0; I.joy.y=0;
    try{z.setPointerCapture(e.pointerId);}catch(err){}
    e.preventDefault();
  });
  z.addEventListener('pointermove',e=>{
    if(e.pointerId!==S.id)return;
    let dx=e.clientX-S.bx, dy=e.clientY-S.by;
    const d=Math.hypot(dx,dy);
    if(d>S.R){ dx=dx/d*S.R; dy=dy/d*S.R; }
    I.joy.x=dx/S.R; I.joy.y=dy/S.R;
    thumb.style.transform=`translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  });
  const end=e=>{
    if(e.pointerId!==S.id)return;
    S.id=null; I.joy.on=false; I.joy.x=0; I.joy.y=0;
    base.classList.add('hidden');
    thumb.style.transform='translate(-50%,-50%)';
  };
  z.addEventListener('pointerup',end);
  z.addEventListener('pointercancel',end);
}

/* ---------- دکمه‌های اقدام ---------- */
function bindBtn(id,act){
  const el=document.getElementById(id); if(!el)return;
  const down=e=>{ e.preventDefault(); el.classList.add('pressed'); I.held[act]=true; I.fire(act); CH.audio.resume(); };
  const up=e=>{ el.classList.remove('pressed'); I.held[act]=false; };
  el.addEventListener('pointerdown',down);
  el.addEventListener('pointerup',up);
  el.addEventListener('pointercancel',up);
  el.addEventListener('pointerleave',up);
}

/* ---------- کیبورد ---------- */
const keys={};
function kvec(){
  let x=0,y=0;
  if(keys['ArrowLeft']||keys['KeyA'])x-=1;
  if(keys['ArrowRight']||keys['KeyD'])x+=1;
  if(keys['ArrowUp']||keys['KeyW'])y-=1;
  if(keys['ArrowDown']||keys['KeyS'])y+=1;
  const d=Math.hypot(x,y); if(d>0){x/=d;y/=d;}
  return {x,y};
}
I.move=function(){
  if(I.joy.on)return I.joy;
  return kvec();
};

I.setup=function(){
  bindBtn('btn-a','a'); bindBtn('btn-b','b');
  bindBtn('btn-a2','a'); bindBtn('btn-b2','b');
  window.addEventListener('keydown',e=>{
    if(e.repeat)return;
    keys[e.code]=true;
    if(e.code==='Space'||e.code==='Enter'){ I.fire('a'); CH.audio.resume(); }
    if(e.code==='ShiftLeft'||e.code==='ShiftRight')I.fire('b');
  });
  window.addEventListener('keyup',e=>{ keys[e.code]=false; });
  window.addEventListener('pointerdown',()=>{ CH.audio.init(); CH.audio.resume(); },{once:false});
  CH.input.refreshSide();
};

I.refreshSide=function(){
  const side=CH.save.d?CH.save.d.set.joySide:'left';
  const z1=document.getElementById('joy-zone'), z2=document.getElementById('joy-zone2');
  for(const z of [z1,z2]){ if(z)z.classList.toggle('right',side==='right'); }
  const bz=document.querySelector('.btns-zone');
  // برای حالت راست، دکمه‌ها به چپ می‌روند
  if(bz){ bz.style.left=(side==='right')?'18px':'auto'; bz.style.right=(side==='right')?'auto':'18px'; }
};

I.enable=function(on){
  I.enabled=on;
  const zones=[document.getElementById('joy-zone'),document.getElementById('joy-zone2')];
  for(const z of zones){ if(z)z.style.display=on?'block':'none'; }
  const btns=document.querySelectorAll('.btns-zone');
  for(const b of btns)b.style.display=on?'flex':'none';
  if(on)setupZone();
};

I.vibrateTap=function(){ CH.vibrate(18); };
})();
