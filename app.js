// youGC shared helpers
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

export const NICHES = ['lifestyle','crypto','beauty','fitness','vlogging','travel','tech','gaming','AI','food','fashion','memes','sports','unboxing','cars','music','health','finance','pets','comedy'];

export const SOCIAL_FIELDS = [
  {key:'x', label:'X / Twitter', ph:'https://x.com/yourname'},
  {key:'instagram', label:'Instagram', ph:'https://instagram.com/yourname'},
  {key:'tiktok', label:'TikTok', ph:'https://tiktok.com/@yourname'},
  {key:'youtube', label:'YouTube', ph:'https://youtube.com/@yourname'},
  {key:'telegram', label:'Telegram', ph:'https://t.me/yourname'},
  {key:'website', label:'Website', ph:'https://yourbrand.com'},
];

export async function currentUser(){
  const { data:{ user } } = await sb.auth.getUser();
  return user;
}

export async function myProfile(){
  const u = await currentUser();
  if(!u) return null;
  const { data } = await sb.from('profiles').select('*').eq('id', u.id).maybeSingle();
  return data;
}

// route guard: returns {user, profile}; redirects if missing
export async function requireAuth(){
  const u = await currentUser();
  if(!u){ location.href = 'auth.html'; return null; }
  const p = await myProfile();
  if(!p && !location.pathname.endsWith('onboard.html')){ location.href='onboard.html'; return null; }
  return { user:u, profile:p };
}

// only ever let http(s) links out of the database and into an href.
// blocks javascript: and data: urls someone could write straight to the API.
export function safeUrl(u){
  const v = String(u ?? '').trim();
  return /^https?:\/\//i.test(v) ? v : '';
}

export function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function timeAgo(ts){
  const s = (Date.now() - new Date(ts).getTime())/1000;
  if(s < 60) return 'just now';
  if(s < 3600) return Math.floor(s/60)+'m ago';
  if(s < 86400) return Math.floor(s/3600)+'h ago';
  return Math.floor(s/86400)+'d ago';
}


// verified is a monthly subscription: active only while verified_until is in the future
export function isVerified(p){
  if(!p || !p.verified) return false;
  if(!p.verified_until) return true;              // legacy / lifetime grants
  return new Date(p.verified_until).getTime() > Date.now();
}

// verified pfp glow ring — colored from the member's chosen profile accent
const RING_HEX = {blue:'#86ABDD',pink:'#E58BB0',mint:'#6FC79E',lavender:'#A98BE0',peach:'#E9A06B',sand:'#CDB77A',coral:'#F0837A',sky:'#6FC3E0',lime:'#A7C86B',grape:'#9B7FD0',rose:'#E58BB0',sunset:'#F0A85E',ocean:'#6FB0B8',berry:'#C77FBE',slate:'#8B9BB8'};
function _hexA(h,a){ const n=h.replace('#',''); return 'rgba('+parseInt(n.slice(0,2),16)+','+parseInt(n.slice(2,4),16)+','+parseInt(n.slice(4,6),16)+','+a+')'; }
function ringStyle(p){
  const c = p && RING_HEX[p.accent];
  if(!c) return '';
  return ` style="box-shadow:0 0 0 2px var(--vgap,#fff),0 0 0 4px ${c},0 0 15px 1px ${_hexA(c,.85)},0 0 27px 4px ${_hexA(c,.5)}"`;
}
export function avatarHTML(p, big=false){
  const ver = isVerified(p);
  const cls = 'avatar'+(big?' big':'')+(ver?' vring':'');
  const st = ver ? ringStyle(p) : '';
  if(p && p.avatar_url) return `<img class="${cls}"${st} src="${esc(p.avatar_url)}" alt="">`;
  const ini = esc((p && p.name ? p.name : '?').trim().charAt(0).toUpperCase() || '?');
  return `<div class="${cls} ph"${st}>${ini}</div>`;
}

export function vbadge(p){
  return isVerified(p) ? '<span class="vbadge" title="verified">✓</span>' : '';
}

// ---- post likes ----
export function heartHTML(postId, liked, count){
  return `<button type="button" class="likebtn${liked?' on':''}" data-post="${postId}" aria-label="like this post"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.6-4.7-10.1-9.4C.2 8.2 1.9 4.8 5.2 4.8c2 0 3.4 1.2 4.2 2.5.8-1.3 2.2-2.5 4.2-2.5 3.3 0 5 3.4 3.3 6.8C19.6 16.3 12 21 12 21z"/></svg><span class="lc">${count?count:''}</span></button>`;
}
export async function loadLikes(postIds, myId){
  const out = { counts:{}, mine:new Set() };
  const ids = [...new Set((postIds||[]).filter(Boolean))];
  if(!ids.length) return out;
  const { data } = await sb.from('likes').select('post_id,user_id').in('post_id', ids);
  (data||[]).forEach(l=>{ out.counts[l.post_id]=(out.counts[l.post_id]||0)+1; if(myId && l.user_id===myId) out.mine.add(l.post_id); });
  return out;
}
export function wireLikes(root, myId){
  if(!root || root.__likeWired) return; root.__likeWired = true;
  root.addEventListener('click', async e=>{
    const b = e.target.closest('.likebtn'); if(!b) return;
    e.preventDefault(); e.stopPropagation();
    if(!myId){ location.href='auth.html'; return; }
    const id = parseInt(b.dataset.post); if(!id) return;
    const on = b.classList.contains('on');
    const lc = b.querySelector('.lc'); const n = parseInt(lc.textContent||'0')||0;
    const nn = on ? Math.max(0,n-1) : n+1;
    b.classList.toggle('on'); lc.textContent = nn?String(nn):'';
    try{
      if(on) await sb.from('likes').delete().eq('post_id',id).eq('user_id',myId);
      else await sb.from('likes').insert({ post_id:id, user_id:myId });
    }catch(err){ b.classList.toggle('on'); lc.textContent = n?String(n):''; }
  });
}

// hate speech filter — swearing is fine, slurs are not
const SLURS = /\bn[i1!]+gg+[e3a4]*r?s?\b|\bn[i1]gs?\b|\bf[a4@]gg?[o0]t?s?\b|\bk[i1]kes?\b|\bch[i1]nks?\b|\btr[a4]nn(?:y|ies)\b|\bwetbacks?\b|\bsp[i1]cs?\b|\bc[o0]{2}ns?\b|\br[e3]t[a4]rd(?:ed|s)?\b/i;
export function hasSlurs(t){ return SLURS.test(String(t||'')); }

// adult / spam link filter. blocked at DB level too, this is the friendly frontend catch
const BAD_LINKS = /(pornhub|xvideos|xnxx|xhamster|redtube|youporn|rule34|hentai|onlyfans|fansly|stripchat|chaturbate|livejasmin|brazzers|e621)\./i;
export function hasBadLinks(t){ return BAD_LINKS.test(String(t||'')); }

export function blobsHTML(){
  return `<div class="bg-blobs"><div class="blob b1" data-depth="26"></div><div class="blob b2" data-depth="-34"></div><div class="blob b3" data-depth="20"></div></div><div class="grain"></div>`;
}

// dark mode: remembers choice, adds a moon toggle to the top nav
export function isDark(){ try{ return localStorage.getItem('yougc_dark')==='1'; }catch(e){ return false; } }
function initTheme(){
  if(isDark()) document.documentElement.classList.add('dark');
  const nav = document.querySelector('nav.top .navlinks') || document.querySelector('nav.top');
  if(!nav || document.getElementById('themeBtn')) return;
  const b = document.createElement('a');
  b.id='themeBtn'; b.className='nav-cta'; b.href='#'; b.title='switch theme';
  b.style.cssText='padding:9px 13px;font-size:1rem;line-height:1';
  b.textContent = isDark() ? '☀️' : '🌙';
  b.addEventListener('click', e=>{
    e.preventDefault();
    try{ localStorage.setItem('yougc_dark', isDark() ? '0' : '1'); }catch(err){}
    location.reload();
  });
  nav.appendChild(b);
}

export function initMotion(){
  initTheme();
  const blobs=[...document.querySelectorAll('[data-depth]')];
  window.addEventListener('mousemove',e=>{
    const mx=(e.clientX/innerWidth-.5), my=(e.clientY/innerHeight-.5);
    blobs.forEach(b=>{ const d=parseFloat(b.dataset.depth)||20; b.style.transform=`translate(${mx*d}px, ${my*d}px)`; });
  });
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target);} }),{threshold:.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
}

export function logoHTML(href='index.html'){
  return `<a class="logo" href="${href}"><img src="logo.png" alt="YOUgc"></a>`;
}

export function showMsg(el, text, ok=false){
  el.textContent = text;
  el.className = 'msg ' + (ok ? 'ok' : 'err');
}

// turn a tiktok / youtube / instagram video link into an embeddable player
// returns {src, tall} or null if the link is not a recognizable full video link
export function clipEmbed(u){
  try{
    const url = new URL(String(u||'').trim());
    const h = url.hostname.replace(/^www\./,'');
    if(h === 'youtu.be' || h.endsWith('youtube.com')){
      let id = '';
      if(h === 'youtu.be') id = url.pathname.split('/')[1];
      else if(url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/embed/')) id = url.pathname.split('/')[2];
      else id = url.searchParams.get('v');
      if(id) return { src:'https://www.youtube.com/embed/'+encodeURIComponent(id), tall:url.pathname.startsWith('/shorts/') };
    }
    if(h.endsWith('tiktok.com')){
      const m = url.pathname.match(/\/video\/(\d+)/);
      if(m) return { src:'https://www.tiktok.com/embed/v2/'+m[1], tall:true };
    }
    if(h.endsWith('instagram.com')){
      const m = url.pathname.match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
      if(m) return { src:'https://www.instagram.com/'+(m[1]==='reels'?'reel':m[1])+'/'+m[2]+'/embed/', tall:true };
    }
  }catch(e){}
  return null;
}

// page hit beacon (anonymous analytics)
const _page = () => location.pathname.replace(/^\//,'').replace(/\.html$/,'') || 'index';
function track(ev){
  try{
    fetch(SUPABASE_URL + '/rest/v1/hits', { method:'POST', keepalive:true,
      headers:{ apikey: SUPABASE_KEY, 'Content-Type':'application/json', Prefer:'return=minimal' },
      body: JSON.stringify({ path: _page(), ev: ev || null, ref: document.referrer ? new URL(document.referrer).hostname : null })
    }).catch(()=>{});
  }catch(e){}
}
export { track };
track(null);

// click tracking: what people actually press, and what they ignore
try{
  document.addEventListener('click', e=>{
    const t = e.target.closest('[data-ev],a,button,.chip,.tab,.swatch,.pcard,.spotcard');
    if(!t) return;
    let label = t.getAttribute('data-ev');
    if(!label){
      const txt = (t.textContent||'').trim().replace(/\s+/g,' ').slice(0,38).toLowerCase();
      if(t.tagName === 'A'){
        const href = (t.getAttribute('href')||'').split('?')[0].replace(/^\//,'');
        label = 'link:' + (txt || href || 'link');
      } else if(t.tagName === 'BUTTON'){
        label = 'btn:' + (txt || t.id || 'button');
      } else {
        label = t.className.split(' ')[0] + ':' + (txt || t.dataset.n || t.dataset.a || '');
      }
    }
    track(_page() + ' · ' + label.slice(0,60));
  }, {passive:true, capture:true});
}catch(e){}
