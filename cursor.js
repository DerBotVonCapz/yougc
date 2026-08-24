/* soft pastel cursor trail — desktop pointers only (skips touch).
   gentle, semi-transparent, drifts only across the brand blue->pink range (no rainbow). */
(function(){
  try{
    if(window.matchMedia && !matchMedia('(pointer:fine)').matches) return;  // skip touch-only devices
  }catch(e){}

  var cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden','true');
  cv.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000';
  var ctx = cv.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0;

  function resize(){
    W = cv.width  = Math.round(innerWidth  * dpr);
    H = cv.height = Math.round(innerHeight * dpr);
    cv.style.width  = innerWidth  + 'px';
    cv.style.height = innerHeight + 'px';
  }
  function mount(){ (document.body || document.documentElement).appendChild(cv); resize(); requestAnimationFrame(frame); }
  addEventListener('resize', resize, {passive:true});

  var pts = [], hue = 214, dir = 1, lastX = null, lastY = null, MAX = 64;

  addEventListener('mousemove', function(e){
    var x = e.clientX * dpr, y = e.clientY * dpr;
    if(lastX !== null){
      var dx = x - lastX, dy = y - lastY, d = Math.hypot(dx, dy);
      var step = 11 * dpr, n = Math.max(1, Math.min(5, Math.floor(d / step)));
      for(var i = 1; i <= n; i++){
        pts.push({ x: lastX + dx * i / n, y: lastY + dy * i / n, life: 1,
                   r: (15 + Math.random() * 9) * dpr, hue: hue });
      }
    }
    lastX = x; lastY = y;
    hue += dir * 1.8;                                   // drift only within brand blue<->pink band
    if(hue > 332){ hue = 332; dir = -1; }
    if(hue < 205){ hue = 205; dir = 1; }
    if(pts.length > MAX) pts.splice(0, pts.length - MAX);
  }, {passive:true});

  addEventListener('mouseleave', function(){ lastX = lastY = null; }, {passive:true});

  function pastel(h, a){ return 'hsla(' + h + ',58%,80%,' + a + ')'; }

  function frame(){
    ctx.clearRect(0, 0, W, H);
    for(var i = pts.length - 1; i >= 0; i--){
      var p = pts[i];
      p.life -= 0.022;
      if(p.life <= 0){ pts.splice(i, 1); continue; }
      var rr = p.r * (1.45 - p.life * 0.45);
      var a = p.life * 0.22;                            // soft + semi-transparent
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
      g.addColorStop(0, pastel(p.hue, a));
      g.addColorStop(1, pastel(p.hue, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 6.2832); ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  if(document.body) mount();
  else addEventListener('DOMContentLoaded', mount);
})();
