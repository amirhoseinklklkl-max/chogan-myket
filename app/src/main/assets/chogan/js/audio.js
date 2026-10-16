/* چوگان: میراث پارس — سیستم صدا (سنتز WebAudio + پشتیبانی فایل‌های صوتی گوینده) */
(function(){
const A={};
CH.audio=A;

let ac=null,master=null,musicG=null,sfxG=null;
let started=false;

A.init=function(){
  if(ac)return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
    ac=new AC();
    master=ac.createGain(); master.gain.value=.9; master.connect(ac.destination);
    musicG=ac.createGain(); musicG.connect(master);
    sfxG=ac.createGain(); sfxG.connect(master);
    A.applyVol();
    A.registerFileSounds();
  }catch(e){}
};
A.applyVol=function(){
  if(!ac)return;
  const s=CH.save.d.set;
  musicG.gain.value=s.music*0.5;
  sfxG.gain.value=s.sfx;
};
A.resume=function(){ if(ac&&ac.state==='suspended')ac.resume(); };

function env(g,t0,a,peak,dur){
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(peak,t0+a);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
}
function tone(freq,type,dur,peak,slide,dest,t0){
  if(!ac)return;
  t0=t0||ac.currentTime;
  const o=ac.createOscillator(),g=ac.createGain();
  o.type=type; o.frequency.setValueAtTime(freq,t0);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),t0+dur);
  env(g,t0,.008,peak||.3,dur);
  o.connect(g); g.connect(dest||sfxG);
  o.start(t0); o.stop(t0+dur+.05);
}
let noiseBuf=null;
function noise(dur,peak,f0,f1,q,dest,t0){
  if(!ac)return;
  t0=t0||ac.currentTime;
  if(!noiseBuf){
    noiseBuf=ac.createBuffer(1,ac.sampleRate*1.2,ac.sampleRate);
    const d=noiseBuf.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  }
  const src=ac.createBufferSource(); src.buffer=noiseBuf; src.loop=true;
  const flt=ac.createBiquadFilter(); flt.type='bandpass'; flt.Q.value=q||1;
  flt.frequency.setValueAtTime(f0,t0);
  if(f1)flt.frequency.exponentialRampToValueAtTime(f1,t0+dur);
  const g=ac.createGain(); env(g,t0,.01,peak||.2,dur);
  src.connect(flt); flt.connect(g); g.connect(dest||sfxG);
  src.start(t0); src.stop(t0+dur+.05);
}

/* صداهای سنتزی — اگر فایل با همین نام در CH.AUDIO_FILES فعال شده باشد، اول فایل پخش می‌شود */
const SYNTH={
  click(){ tone(720,'square',.06,.15,-260); },
  swing(){ noise(.14,.25,900,240,1.4); },
  hit(){ tone(170,'triangle',.1,.5,-60); noise(.06,.4,2200,900,1); },
  hitWall(){ tone(120,'sine',.09,.3,-30); },
  goal(){ const t=ac.currentTime; tone(523,'square',.14,.22,0,sfxG,t); tone(659,'square',.14,.22,0,sfxG,t+.13); tone(784,'square',.3,.24,0,sfxG,t+.26); noise(.9,.3,700,1400,.7,sfxG,t); },
  concede(){ tone(220,'sawtooth',.4,.2,-90); },
  whistle(){ const t=ac.currentTime; for(let i=0;i<2;i++){ const o=ac.createOscillator(),g=ac.createGain(),v=ac.createOscillator(),vg=ac.createGain(); o.type='square'; o.frequency.value=2093; v.frequency.value=24; vg.gain.value=90; v.connect(vg); vg.connect(o.frequency); env(g,t+i*.32,.01,.14,.26); o.connect(g); g.connect(sfxG); o.start(t+i*.32); v.start(t+i*.32); o.stop(t+i*.32+.3); v.stop(t+i*.32+.3);} },
  coin(){ const t=ac.currentTime; tone(880,'sine',.07,.25,0,sfxG,t); tone(1318,'sine',.18,.25,0,sfxG,t+.07); },
  gem(){ const t=ac.currentTime; tone(1046,'sine',.09,.22,0,sfxG,t); tone(1568,'sine',.22,.22,0,sfxG,t+.08); },
  pop(){ tone(500,'sine',.08,.3,320); },
  quest(){ const t=ac.currentTime; tone(659,'triangle',.1,.2,0,sfxG,t); tone(880,'triangle',.1,.2,0,sfxG,t+.1); tone(1046,'triangle',.25,.2,0,sfxG,t+.2); },
  fail(){ const t=ac.currentTime; tone(392,'sawtooth',.2,.16,-40,sfxG,t); tone(311,'sawtooth',.4,.16,-40,sfxG,t+.2); },
  step(){ noise(.05,.05,300,150,1); },
  blip(){ tone(CH.u.rand(290,340),'square',.03,.05,40); },
  gallopHit(){ noise(.09,.22,220,90,1); tone(70,'sine',.09,.25,-20); }
};

A.play=function(name){
  if(!ac){ A.init(); if(!ac)return; }
  if(ac.state==='suspended')A.resume();
  const buf=A._files[name];
  if(buf){ try{ const s=ac.createBufferSource(); s.buffer=buf; s.connect(sfxG); s.start(); return; }catch(e){} }
  const f=SYNTH[name]; if(f)f();
};

/* گالوپ اسب — الگوی ضرب هنگام تاخت */
let gallopOn=false,gallopT=0,gallopPhase=0;
A.gallop=function(on){ gallopOn=on; if(!on)gallopPhase=0; };
A.updateGallop=function(dt){
  if(!gallopOn||!ac)return;
  gallopT-=dt;
  if(gallopT<=0){ gallopT=.16; gallopPhase=(gallopPhase+1)%4; if(gallopPhase===0||gallopPhase===2)A.play('gallopHit'); }
};

/* ---------- موسیقی procedural با حال‌وهوای ایرانی ---------- */
const SCALE=[293.66,311.13,369.99,392,440,466.16,554.37,587.33]; // دوم همایون‌گونه
let musicOn=false,musT=null,musBar=0;
A.music=function(on){
  musicOn=on; if(musT)clearInterval(musT);
  if(!on)return;
  if(!ac)return;
  const schedule=()=>{
    if(!musicOn||!ac)return;
    const t=ac.currentTime+.05, beat=.34;
    // پد پایه (درام)
    tone(SCALE[0]/2,'sine',beat*8,.10,0,musicG,t);
    tone(SCALE[0]*2,'triangle',beat*8,.03,0,musicG,t);
    // ملودی
    let pos=t;
    const steps=8;
    for(let i=0;i<steps;i++){
      const r=Math.random();
      if(r<.14)continue; // سکوت
      let deg=CH.u.randi(0,SCALE.length-1);
      if(i%4===0)deg=[0,2,4,7][CH.u.randi(0,3)]%SCALE.length;
      const oct=r<.5?1:2;
      tone(SCALE[deg]*oct,'triangle',beat*(r<.75?1:1.5),.085,0,musicG,pos);
      pos+=beat*(r<.75?1:1.5);
    }
  };
  schedule();
  musT=setInterval(schedule,beatSec*8000);
};
const beatSec=.34;

/* ---------- فایل‌های صوتی گوینده (VO) ---------- */
A._files={};
A.registerFileSounds=function(){
  const map=(typeof CH.AUDIO_FILES!=='undefined')?CH.AUDIO_FILES:{};
  for(const name in map){
    (function(n,url){
      fetch(url).then(r=>{ if(!r.ok)throw 0; return r.arrayBuffer(); })
        .then(b=>ac.decodeAudioData(b))
        .then(buf=>{ A._files[n]=buf; })
        .catch(()=>{});
    })(name,map[name]);
  }
};
/* دیالوگ گوینده: اگر فایل صوتی با این id موجود باشد پخش می‌شود، وگرنه بی‌صدا رد می‌شود */
A.vo=function(id){
  try{
    const el=new Audio('audio/vo/'+id+'.ogg');
    el.volume=CH.save.d?CH.save.d.set.sfx:1;
    el.play().catch(()=>{});
  }catch(e){}
};
})();
