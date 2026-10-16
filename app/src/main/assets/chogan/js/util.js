/* چوگان: میراث پارس — ابزارها، ذخیره‌سازی، کیفیت گرافیک */
window.CH = window.CH || {};

CH.u = {
  clamp:(v,a,b)=>v<a?a:(v>b?b:v),
  lerp:(a,b,t)=>a+(b-a)*t,
  dist:(x1,y1,x2,y2)=>Math.hypot(x2-x1,y2-y1),
  angDiff:(a,b)=>{let d=(b-a)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d},
  rand:(a,b)=>a+Math.random()*(b-a),
  randi:(a,b)=>Math.floor(a+Math.random()*(b-a+1)),
  pick:arr=>arr[Math.floor(Math.random()*arr.length)],
  toFa:v=>String(v).replace(/[0-9]/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]),
  fmt:n=>{n=Math.floor(n);return CH.u.toFa(n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'٬'))},
  ease:t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2
};

/* ---------- ذخیره‌سازی ---------- */
CH.SAVE_KEY='chogan_save_v1';
CH.save={
  d:null,
  defaults(){
    return {
      ver:1, name:'', coins:250, gems:5, adT:0,
      owned:{mallets:['chobi_kohan'],horses:[],outfits:['rustic']},
      equipped:{mallet:'chobi_kohan',horse:null,outfit:'rustic'},
      story:{ch:0,step:0,hasHorse:false,done:false,introSeen:false,grandMallet:false,polished:false,targetsHit:0,ringsPassed:0,hayDone:0,academyGoals:0},
      arcade:{unlocked:1,stars:{}},
      set:{gfx:'high',music:0.6,sfx:0.8,vibrate:true,joySide:'left'},
      stats:{matches:0,wins:0,goals:0}
    };
  },
  load(){
    try{
      const raw=localStorage.getItem(CH.SAVE_KEY);
      this.d=raw?Object.assign(this.defaults(),JSON.parse(raw)):this.defaults();
      // ادغام عمیق برای کلیدهای جدید
      const def=this.defaults();
      for(const k of ['owned','equipped','story','arcade','set','stats']){
        this.d[k]=Object.assign({},def[k],this.d[k]||{});
      }
    }catch(e){ this.d=this.defaults(); }
    return this.d;
  },
  write(){ try{ localStorage.setItem(CH.SAVE_KEY,JSON.stringify(this.d)); }catch(e){} },
  reset(){ this.d=this.defaults(); this.write(); }
};

/* ---------- کیفیت گرافیک ---------- */
CH.Q={level:'high',res:1,shadow:true,particles:1,trail:true,glow:true,detail:true};
CH.applyGfx=function(level){
  const Q=CH.Q; Q.level=level;
  if(level==='low'){Q.res=.68;Q.shadow=false;Q.particles=.3;Q.trail=false;Q.glow=false;Q.detail=false;}
  else if(level==='medium'){Q.res=.85;Q.shadow=true;Q.particles=.6;Q.trail=true;Q.glow=false;Q.detail=false;}
  else {Q.res=1;Q.shadow=true;Q.particles=1;Q.trail=true;Q.glow=true;Q.detail=true;}
  if(CH.fit)CH.fit();
};

/* ---------- نمایش ---------- */
CH.cv=null,CH.ctx=null;
CH.view={w:1280,h:720,k:1};
CH.fit=function(){
  if(!CH.cv)return;
  const dpr=Math.min(window.devicePixelRatio||1,2)*CH.Q.res;
  const w=window.innerWidth,h=window.innerHeight;
  CH.cv.width=Math.max(2,Math.round(w*dpr));
  CH.cv.height=Math.max(2,Math.round(h*dpr));
  CH.cv.style.width=w+'px';CH.cv.style.height=h+'px';
  CH.view.h=720;
  CH.view.w=Math.round(720*w/h);
  CH.view.k=CH.cv.height/720;
};

/* ---------- پل اندروید ---------- */
CH.bridge=(typeof window!=='undefined')?(window.ChoganAndroid||null):null;
CH.isAndroid=!!CH.bridge;
CH.vibrate=function(ms){
  if(!CH.save.d||!CH.save.d.set.vibrate)return;
  try{ if(CH.bridge&&CH.bridge.vibrate)CH.bridge.vibrate(String(ms)); else if(navigator.vibrate)navigator.vibrate(ms); }catch(e){}
};

/* ---------- صحنه‌ها ---------- */
CH.scenes={
  cur:null,name:'boot',
  def:{},
  set(name){ const prev=this.def[this.name]; if(prev&&prev.exit)prev.exit(); this.name=name; this.cur=this.def[name]; if(this.cur&&this.cur.enter)this.cur.enter(); },
  update(dt){ if(this.cur&&this.cur.update)this.cur.update(dt); },
  render(ctx){ if(this.cur&&this.cur.render)this.cur.render(ctx); }
};

/* ---------- افکت‌ها ---------- */
CH.fx={
  list:[],
  dust(x,y,n,col){ n=Math.ceil(n*CH.Q.particles); for(let i=0;i<n;i++){ this.list.push({t:'dust',x:x+CH.u.rand(-8,8),y:y+CH.u.rand(-8,8),vx:CH.u.rand(-30,30),vy:CH.u.rand(-24,6),life:CH.u.rand(.35,.8),age:0,r:CH.u.rand(3,7),col:col||'rgba(210,180,130,'}); } },
  burst(x,y,col,n){ n=Math.ceil((n||14)*CH.Q.particles); for(let i=0;i<n;i++){ const a=CH.u.rand(0,Math.PI*2),s=CH.u.rand(60,260); this.list.push({t:'spark',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:CH.u.rand(.3,.7),age:0,r:CH.u.rand(2,5),col:col||'#ffd97a'}); } },
  confetti(n){ n=Math.ceil((n||80)*CH.Q.particles); for(let i=0;i<n;i++){ this.list.push({t:'conf',x:CH.u.rand(0,CH.view.w),y:CH.u.rand(-160,-10),vx:CH.u.rand(-40,40),vy:CH.u.rand(60,160),life:CH.u.rand(2.5,4.5),age:0,r:CH.u.rand(4,8),rot:CH.u.rand(0,6),vr:CH.u.rand(-6,6),col:['#e8b84b','#1ba894','#c8433a','#f0dcae','#5ad2ff'][CH.u.randi(0,4)]}); } },
  update(dt){
    for(let i=this.list.length-1;i>=0;i--){ const p=this.list[i]; p.age+=dt;
      if(p.age>=p.life){ this.list.splice(i,1); continue; }
      p.x+=p.vx*dt; p.y+=p.vy*dt;
      if(p.t==='conf'){ p.rot+=p.vr*dt; p.vy+=30*dt; }
      else { p.vx*=0.94; p.vy*=0.94; if(p.t==='dust')p.y-=14*dt; }
    }
    if(this.list.length>400)this.list.splice(0,this.list.length-400);
  },
  draw(ctx){
    for(const p of this.list){
      const a=1-p.age/p.life;
      if(p.t==='dust'){ ctx.fillStyle=p.col+(a*.5).toFixed(2)+')'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*(1+p.age),0,7); ctx.fill(); }
      else if(p.t==='spark'){ ctx.globalAlpha=a; ctx.fillStyle=p.col; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill(); ctx.globalAlpha=1; }
      else if(p.t==='conf'){ ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.globalAlpha=Math.min(1,a*2); ctx.fillStyle=p.col; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.4); ctx.restore(); ctx.globalAlpha=1; }
    }
  },
  clear(){ this.list.length=0; }
};

/* ---------- اعلان بزرگ ---------- */
CH.bigNote=function(txt,ms){
  const el=document.getElementById('big-note');
  el.textContent=txt; el.classList.remove('hidden');
  el.style.animation='none'; void el.offsetWidth; el.style.animation='';
  clearTimeout(CH._bnT); CH._bnT=setTimeout(()=>el.classList.add('hidden'),ms||1400);
};

/* ---------- توست ---------- */
CH.toast=function(txt,ms){
  const el=document.getElementById('toast');
  el.textContent=txt; el.classList.add('show');
  clearTimeout(CH._tT); CH._tT=setTimeout(()=>el.classList.remove('show'),ms||1900);
};

/* ---------- تأیید ---------- */
CH.confirm=function(title,text,onYes){
  CH.ui.showModal('confirm-modal');
  document.getElementById('confirm-title').textContent=title;
  document.getElementById('confirm-text').textContent=text;
  document.getElementById('confirm-yes').onclick=()=>{ CH.ui.hideModal('confirm-modal'); CH.audio.play('click'); onYes&&onYes(); };
  document.getElementById('confirm-no').onclick=()=>{ CH.ui.hideModal('confirm-modal'); CH.audio.play('click'); };
};
