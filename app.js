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

export function avatarHTML(p, big=false){
  const cls = 'avatar'+(big?' big':'');
  if(p && p.avatar_url) return `<img class="${cls}" src="${esc(p.avatar_url)}" alt="">`;
  const ini = esc((p && p.name ? p.name : '?').trim().charAt(0).toUpperCase() || '?');
  return `<div class="${cls} ph">${ini}</div>`;
}

export function blobsHTML(){
  return `<div class="bg-blobs"><div class="blob b1" data-depth="26"></div><div class="blob b2" data-depth="-34"></div><div class="blob b3" data-depth="20"></div></div><div class="grain"></div>`;
}

export function initMotion(){
  const blobs=[...document.querySelectorAll('[data-depth]')];
  window.addEventListener('mousemove',e=>{
    const mx=(e.clientX/innerWidth-.5), my=(e.clientY/innerHeight-.5);
    blobs.forEach(b=>{ const d=parseFloat(b.dataset.depth)||20; b.style.transform=`translate(${mx*d}px, ${my*d}px)`; });
  });
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target);} }),{threshold:.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
}

export function logoHTML(href='index.html'){
  return `<a class="logo" href="${href}">YOUgc<span class="dot">.</span></a>`;
}

export function showMsg(el, text, ok=false){
  el.textContent = text;
  el.className = 'msg ' + (ok ? 'ok' : 'err');
}
