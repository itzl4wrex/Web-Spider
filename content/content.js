(() => {
  if(window.__webSpiderInstalled&&window.__webSpiderBuild===4&&typeof window.__webSpiderStop==='function')return;
  const staleStops=Array.isArray(window.__webSpiderStops)?[...window.__webSpiderStops]:[];for(const oldStop of staleStops)try{oldStop()}catch{}if(typeof window.__webSpiderStop==='function')try{window.__webSpiderStop()}catch{}
  document.querySelectorAll('[id="__web_spider_canvas"]').forEach(el=>el.remove());
  try{delete window.__webSpiderInstalled;delete window.__webSpiderStop;delete window.__webSpiderBuild}catch{}window.__webSpiderStops=[];
  window.__webSpiderInstalled = true;window.__webSpiderBuild=4;
  const COLORS = ['#ff2e88', '#39ff88', '#3aa0ff', '#ffd400', '#fff'];
  const canvas = document.createElement('canvas');
  canvas.id = '__web_spider_canvas';
  Object.assign(canvas.style, {position:'fixed',inset:'0',width:'100vw',height:'100vh',zIndex:'2147483646',pointerEvents:'none'});
  const ctx = canvas.getContext('2d', {alpha:true});
  let raf=0, enabled=false, visible=true, frozen=false, follow=true, autonomous=true, lastFrame=0, lastScan=0, dpr=1;
  let x=innerWidth*.5, y=innerHeight*.45, vx=0, vy=0, angle=-Math.PI/2, pointer={x,y}, goal={x,y}, goalTarget=null, gaitGroup=0, groupStepping=false, lastGoal=null;
  const targets=[], particles=[], inspected=new Set();
  const legs=Array.from({length:8},(_,i)=>({side:i<4?-1:1, row:i%4, group:(i%2)*2+(i<4?0:1), phase:(i%4)*.42+(i<4?0:.22), foot:null, from:null, to:null, progress:1, color:COLORS[i%COLORS.length], target:null}));
  const resize=()=>{if(!ctx)return;dpr=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
  const activate=()=>{if(enabled)return;enabled=true;document.documentElement.appendChild(canvas);resize();if(!frozen&&!document.hidden&&!raf)raf=requestAnimationFrame(safeDraw)};
  const deactivate=()=>{enabled=false;cancelAnimationFrame(raf);raf=0;if(ctx)ctx.clearRect(0,0,innerWidth,innerHeight);canvas.remove()};
  resize(); addEventListener('resize',resize,{passive:true});
  const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else if(enabled&&visible&&!frozen&&!raf){lastFrame=0;raf=requestAnimationFrame(safeDraw)}};
  document.addEventListener('visibilitychange',onVisibility);
  const onPointer=e=>{pointer={x:e.clientX,y:e.clientY};if(follow){goalTarget=null;goal={...pointer}}};
  addEventListener('pointermove',onPointer,{passive:true});
  const random=(a,b)=>a+Math.random()*(b-a), dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function scanTargets(){targets.length=0;const all=document.querySelectorAll('a[href],cite,code,button,h1,h2,h3,h4,h5,h6,img'),stride=Math.max(1,Math.ceil(all.length/500));for(let i=0;i<all.length;i+=stride){const el=all[i];if(el.closest('#__web_spider_canvas'))continue;const r=el.getBoundingClientRect();if(r.width<5||r.height<5||!el.getClientRects().length)continue;targets.push({el,x:r.left+r.width*.5,y:r.top+r.height*.5});}}
  function visiblePoint(el){const r=el.getBoundingClientRect();return{x:Math.max(42,Math.min(innerWidth-42,r.left+r.width*.5)),y:Math.max(58,Math.min(innerHeight-58,r.top+r.height*.5)),inView:r.left+r.width*.5>=42&&r.left+r.width*.5<=innerWidth-42&&r.top+r.height*.5>=58&&r.top+r.height*.5<=innerHeight-58}}
  let goalProgressAt=0, goalBestDistance=Infinity;
  function pickGoal(){
    if(follow){goalTarget=null;goal={...pointer};return}
    if(!autonomous)return;
    const live=targets.filter(t=>t.el?.isConnected&&t.el!==lastGoal);
    const far=[];
    for(const target of live){const r=target.el.getBoundingClientRect(),px=r.left+scrollX+r.width*.5,py=r.top+scrollY+r.height*.5,distance=Math.hypot(px-(x+scrollX),py-(y+scrollY));if(distance>150)far.push({target,px,py,distance})}
    if(far.length){const chosen=far[Math.floor(Math.random()*far.length)];lastGoal=chosen.target.el;goalTarget=chosen.target.el;const maxX=Math.max(0,document.documentElement.scrollWidth-innerWidth),maxY=Math.max(0,document.documentElement.scrollHeight-innerHeight),left=Math.max(0,Math.min(maxX,chosen.px-innerWidth*.5)),top=Math.max(0,Math.min(maxY,chosen.py-innerHeight*.5));if(Math.abs(left-scrollX)>70||Math.abs(top-scrollY)>70)try{window.scrollTo({left,top,behavior:'smooth'})}catch{}goal=visiblePoint(goalTarget);inspected.add(goalTarget);if(inspected.size>80)inspected.delete(inspected.values().next().value)}
    else{lastGoal=null;goalTarget=null;const width=Math.max(innerWidth,document.documentElement.scrollWidth),height=Math.max(innerHeight,document.documentElement.scrollHeight);let pageX=random(45,Math.max(46,width-45)),pageY=random(65,Math.max(66,height-65));if(Math.hypot(pageX-(x+scrollX),pageY-(y+scrollY))<150){pageX=Math.max(45,Math.min(width-45,x+scrollX+(x+scrollX<width*.5?220:-220)));pageY=Math.max(65,Math.min(height-65,y+scrollY+(y+scrollY<height*.5?180:-180)))}const maxX=Math.max(0,width-innerWidth),maxY=Math.max(0,height-innerHeight),left=Math.max(0,Math.min(maxX,pageX-innerWidth*.5)),top=Math.max(0,Math.min(maxY,pageY-innerHeight*.5));if(Math.abs(left-scrollX)>70||Math.abs(top-scrollY)>70)try{window.scrollTo({left,top,behavior:'smooth'})}catch{}goal={x:pageX-left,y:pageY-top}}
    goalProgressAt=performance.now();goalBestDistance=Infinity;
  }
  function advanceAutonomousGoal(ts){
    if(goalTarget&&!goalTarget.isConnected){goalTarget=null;pickGoal();return}
    if(goalTarget)goal=visiblePoint(goalTarget);
    const remaining=dist({x,y},goal);
    if(remaining<42){pickGoal();return}
    if(remaining<goalBestDistance-4){goalBestDistance=remaining;goalProgressAt=ts;return}
    if(ts-goalProgressAt>7000&&remaining>75)pickGoal();
  }
  function home(leg,cx=x,cy=y,heading=angle){const a=heading+leg.phase*leg.side*.4;return{x:cx+Math.cos(a)*10,y:cy+Math.sin(a)*10}}
  function rest(leg){const a=angle+leg.side*(.42+leg.row*.43);const size=Math.max(.72,Math.min(1.2,Math.min(innerWidth,innerHeight)/720));return{x:x+Math.cos(a)*(31+leg.row*7)*size,y:y+Math.sin(a)*(31+leg.row*7)*size}}
  function startStep(leg,dest){leg.from=leg.foot||rest(leg);leg.target=null;let best=null,bestD=30;for(const t of targets){const d=dist(dest,t);if(d<bestD){best=t;bestD=d}}if(best){leg.target=best.el;leg.to=locationFor(best.el)||{x:best.x,y:best.y}}else leg.to=dest;leg.progress=0;leg.lift=random(8,14)}
  function ease(t){return t*t*(3-2*t)}
  let lastAnimationError=0;
  function recoverAnimation(error,ts){if(ts-lastAnimationError>2500){console.warn('WEB SPIDER reset its animation after a drawing error:',error);lastAnimationError=ts}goalTarget=null;lastGoal=null;targets.length=0;particles.length=0;if(!Number.isFinite(x)||!Number.isFinite(y)){x=innerWidth*.5;y=innerHeight*.45}if(!Number.isFinite(vx)||!Number.isFinite(vy)){vx=0;vy=0}if(!Number.isFinite(angle))angle=-Math.PI/2;for(const leg of legs){leg.target=null;leg.progress=1;leg.foot=rest(leg)}try{resize();ctx.clearRect(0,0,innerWidth,innerHeight)}catch{}}
  function safeDraw(ts){raf=0;if(!enabled||frozen||!visible||document.hidden)return;try{draw(ts)}catch(error){recoverAnimation(error,ts)}finally{if(enabled&&!frozen&&!document.hidden)raf=requestAnimationFrame(safeDraw)}}
  function draw(ts){if(!enabled||frozen||!visible||document.hidden)return;if(ts-lastFrame<33)return;const dt=Math.min(.05,(ts-lastFrame||33)/1000);lastFrame=ts;if(ts-lastScan>3000){lastScan=ts;try{scanTargets()}catch{targets.length=0}}
    if(follow){goalTarget=null;goal={...pointer}}else if(!autonomous){goalTarget=null;goal={x,y}}else advanceAutonomousGoal(ts);
    const dx=goal.x-x,dy=goal.y-y;const response=1-Math.exp(-8*dt);let desiredX=Math.max(-125,Math.min(125,dx*3.5)),desiredY=Math.max(-125,Math.min(125,dy*3.5));vx+=(desiredX-vx)*response;vy+=(desiredY-vy)*response;x+=vx*dt;y+=vy*dt;if(Math.hypot(vx,vy)>3){let da=Math.atan2(vy,vx)-angle;da=Math.atan2(Math.sin(da),Math.cos(da));angle+=da*Math.min(1,4*dt)}
    for(const l of legs){if(l.progress<1){l.progress=Math.min(1,l.progress+dt/.13);const t=ease(l.progress);l.foot={x:l.from.x+(l.to.x-l.from.x)*t,y:l.from.y+(l.to.y-l.from.y)*t-Math.sin(l.progress*Math.PI)*l.lift};if(l.progress===1)l.foot=l.to;continue}if(l.target){const pos=locationFor(l.target);if(pos&&dist(pos,rest(l))<42)l.foot=pos;else l.target=null}if(!l.foot)l.foot=rest(l)}
    const activeLegs=legs.filter(l=>l.group===gaitGroup);if(groupStepping){if(activeLegs.every(l=>l.progress===1)){gaitGroup=(gaitGroup+1)%4;groupStepping=false}}else if(Math.hypot(vx,vy)>7){const stepping=activeLegs.filter(l=>dist(l.foot,rest(l))>12);if(stepping.length){for(const l of stepping)startStep(l,rest(l));groupStepping=true}else gaitGroup=(gaitGroup+1)%4}
    if(Math.random()<.015){const t=targets[Math.floor(Math.random()*targets.length)];if(t){const r=t.el.getBoundingClientRect();particles.push({x:r.left+r.width/2,y:r.top+r.height/2,vx:random(-22,22),vy:random(-48,-12),age:0,life:.55,color:COLORS[Math.floor(Math.random()*4)]});}}
    const idle=Math.max(0,1-Math.hypot(vx,vy)/14),bodyX=x+Math.sin(ts*.003)*1.5*idle,bodyY=y+Math.cos(ts*.004)*1.2*idle,bodyAngle=angle+Math.sin(ts*.002)*.035*idle;
    ctx.clearRect(0,0,innerWidth,innerHeight);ctx.lineCap='round';
    for(const l of legs){const h=home(l,bodyX,bodyY,bodyAngle),f=l.foot||rest(l),dx=f.x-h.x,dy=f.y-h.y,L=Math.hypot(dx,dy)||1,perp=(l.side)*(8+l.row*1.4),knee={x:h.x+dx*.53-dy/L*perp,y:h.y+dy*.53+dx/L*perp};ctx.strokeStyle=l.progress<1?l.color:'rgba(170,190,255,.88)';ctx.lineWidth=1.45;ctx.shadowColor=l.color;ctx.shadowBlur=7;ctx.beginPath();ctx.moveTo(h.x,h.y);ctx.lineTo(knee.x,knee.y);ctx.lineTo(f.x,f.y);ctx.stroke();ctx.shadowBlur=12;ctx.fillStyle=l.target?'#39ff88':l.color;ctx.beginPath();ctx.arc(f.x,f.y,2,0,Math.PI*2);ctx.fill();}
    ctx.shadowBlur=11;ctx.shadowColor='#3aa0ff';ctx.strokeStyle='rgba(58,160,255,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bodyX,bodyY);ctx.lineTo(goal.x,goal.y);ctx.stroke();ctx.save();ctx.translate(bodyX,bodyY);ctx.rotate(bodyAngle+Math.PI/2);ctx.shadowBlur=17;ctx.shadowColor='#ff2e88';ctx.fillStyle='rgba(10,12,22,.95)';ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,7,10,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle='#3aa0ff';ctx.beginPath();ctx.ellipse(0,14,4,6,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ff2e88';ctx.beginPath();ctx.arc(0,-3,3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffd400';ctx.beginPath();ctx.moveTo(-3,-9);ctx.lineTo(-7,-16);ctx.moveTo(3,-9);ctx.lineTo(7,-16);ctx.stroke();ctx.restore();ctx.shadowBlur=0;
    for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=65*dt;ctx.globalAlpha=Math.max(0,1-p.age/p.life);ctx.fillStyle=p.color;ctx.shadowBlur=7;ctx.shadowColor=p.color;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.4,1.5*(1-p.age/p.life)),0,Math.PI*2);ctx.fill();if(p.age>=p.life)particles.splice(i,1)}ctx.globalAlpha=1;ctx.shadowBlur=0;
  }
  const extract=()=>{const norm=s=>(s||'').trim().replace(/\s+/g,' ').slice(0,12000),meta=n=>document.querySelector(`meta[name="${n}" i]`)?.content?.trim()||'',anchors=[...document.querySelectorAll('a[href]')].map(a=>({url:a.href,text:norm(a.innerText),title:a.title||''})).filter(a=>/^https?:/.test(a.url));const host=location.hostname;return {url:location.href,domain:host,title:document.title||'',description:meta('description'),keywords:meta('keywords'),canonical:document.querySelector('link[rel="canonical"]')?.href||'',language:document.documentElement.lang||'',headings:[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h=>({level:+h.tagName[1],text:norm(h.innerText)})).filter(h=>h.text).slice(0,200),paragraphs:[...document.querySelectorAll('p')].map(p=>norm(p.innerText)).filter(Boolean).slice(0,200),mainText:norm(document.querySelector('main,article,[role="main"]')?.innerText||document.body?.innerText).slice(0,16000),lists:[...document.querySelectorAll('li')].map(x=>norm(x.innerText)).filter(Boolean).slice(0,200),internalLinks:anchors.filter(a=>new URL(a.url).hostname===host).slice(0,300),externalLinks:anchors.filter(a=>new URL(a.url).hostname!==host).slice(0,200),images:[...document.images].map(i=>({url:i.currentSrc||i.src,alt:i.alt||'',title:i.title||''})).filter(i=>i.url).slice(0,200),emails:[...new Set((document.body?.innerText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)||[]))],structured:[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>s.textContent.slice(0,4000)).slice(0,20),scannedAt:new Date().toISOString()}};
  function stop(){deactivate();removeEventListener('resize',resize);removeEventListener('pointermove',onPointer);document.removeEventListener('visibilitychange',onVisibility);chrome.runtime.onMessage.removeListener(onMessage);canvas.remove();const stops=window.__webSpiderStops;if(Array.isArray(stops)){const i=stops.indexOf(stop);if(i>=0)stops.splice(i,1)}delete window.__webSpiderInstalled;if(window.__webSpiderStop===stop)delete window.__webSpiderStop;delete window.__webSpiderBuild}
  window.__webSpiderStop=stop;window.__webSpiderStops.push(stop);
  const onMessage=(m,_,reply)=>{if(m.type==='SPIDER_CONFIG'){visible=m.visible!==false;follow=!!m.follow;autonomous=m.autonomous!==false;if(m.active===true&&visible)activate();else deactivate();reply({ok:true})}else if(m.type==='SPIDER_FREEZE'){frozen=!!m.frozen;if(frozen){cancelAnimationFrame(raf);raf=0}else if(enabled&&visible&&!document.hidden&&!raf){lastFrame=0;raf=requestAnimationFrame(safeDraw)}reply({ok:true})}else if(m.type==='EXTRACT_PAGE'){try{reply({ok:true,data:extract()})}catch(e){reply({ok:false,error:e.message})}return true}else if(m.type==='CLEANUP'){stop();reply({ok:true})}};
  chrome.runtime.onMessage.addListener(onMessage);
  // The visual spider is dormant until an explicit START command.
})();




