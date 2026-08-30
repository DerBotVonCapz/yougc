// /u/<username> — a real page for link previews.
// crawlers read the og tags, people get bounced straight to the profile.
const SUPABASE_URL = 'https://oemezcziuqefzhtsnotm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sXia33UR_g43dCp59RsAKA_1FBKOlL_';
const SITE = 'https://yougcmarket.com';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  let u = '', ref = '';
  try {
    const url = new URL(req.url, SITE);
    u = url.searchParams.get('username') || url.pathname.split('/').filter(Boolean).pop() || '';
    ref = url.searchParams.get('ref') || '';
  } catch (e) {}
  u = u.replace(/^@/, '').replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 40).toLowerCase();
  ref = ref.replace(/^@/, '').replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 40).toLowerCase();

  const target = SITE + '/profile.html?u=' + encodeURIComponent(u) + (ref ? '&ref=' + encodeURIComponent(ref) : '');
  let p = null;
  if (u) {
    try {
      const r = await fetch(SUPABASE_URL + '/rest/v1/profiles?username=eq.' + encodeURIComponent(u) +
        '&select=username,name,bio,avatar_url,role,niches,verified,verified_until&limit=1',
        { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } });
      const j = await r.json();
      if (Array.isArray(j) && j[0]) p = j[0];
    } catch (e) {}
  }

  const live = p && p.verified && (!p.verified_until || new Date(p.verified_until).getTime() > Date.now());
  const who = p ? (p.role === 'brand' ? 'brand' : 'UGC creator') : '';
  const title = p
    ? (p.name || '@' + p.username) + (live ? ' ✓' : '') + ' · ' + who + ' on YOUgc'
    : 'YOUgc · where brands and UGC creators meet';
  const desc = p
    ? ((p.bio && p.bio.trim())
        ? p.bio.trim().replace(/\s+/g, ' ').slice(0, 180)
        : ((p.niches || []).slice(0, 4).join(' · ') || who) + ' on YOUgc. see the work, send a message.')
    : 'the marketplace where brands and real UGC creators find each other.';
  const img = (p && p.avatar_url) ? p.avatar_url : SITE + '/og.png';
  const card = (p && p.avatar_url) ? 'summary' : 'summary_large_image';
  const canon = p ? SITE + '/u/' + encodeURIComponent(p.username) : SITE + '/';

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canon)}">
<link rel="icon" type="image/png" href="/favicon.png">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="YOUgc">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:url" content="${esc(canon)}">
<meta name="twitter:card" content="${card}">
<meta name="twitter:site" content="@yougcmarket">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
${p ? '' : '<meta name="robots" content="noindex">'}
<style>body{margin:0;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#FAF7F2;color:#1E3350;
display:flex;align-items:center;justify-content:center;min-height:100vh}
.c{text-align:center;padding:40px}img{width:96px;height:96px;border-radius:50%;object-fit:cover}
h1{font-size:1.5rem;margin:18px 0 6px}p{color:#5A6A85;max-width:32em;line-height:1.6}
a{color:#2E4A73;font-weight:700}.role{font-weight:600;color:#2E4A73}</style></head>
<body><div class="c">
${p && p.avatar_url ? '<img src="' + esc(p.avatar_url) + '" alt="">' : ''}
<h1>${esc(p ? (p.name || '@' + p.username) : 'YOUgc')}</h1>
${p ? '<p class="role">' + (live ? '\u2713 ' : '') + esc(who) + ((p.niches && p.niches.length) ? ' \u00b7 ' + esc(p.niches.slice(0,6).join(', ')) : '') + '</p>' : ''}
<p>${esc(desc)}</p>
${(p && p.bio && p.bio.trim()) ? '<p>' + esc(p.bio.trim()) + '</p>' : ''}
<p><a href="${esc(target)}">open on YOUgc \u2192</a></p>
</div><script>location.replace(${JSON.stringify(target)});</script></body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.statusCode = 200;
  res.end(html);
};
