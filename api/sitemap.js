// live sitemap: the static pages plus every public profile
const SUPABASE_URL = 'https://oemezcziuqefzhtsnotm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sXia33UR_g43dCp59RsAKA_1FBKOlL_';
const SITE = 'https://yougcmarket.com';

const STATIC = [
  ['/', 'daily', '1.0'],
  ['/studio.html', 'weekly', '0.8'],
  ['/auth.html', 'monthly', '0.5'],
  ['/terms.html', 'yearly', '0.2'],
  ['/privacy.html', 'yearly', '0.2'],
  ['/impressum.html', 'yearly', '0.2']
];

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

module.exports = async (req, res) => {
  let people = [];
  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/profiles?select=username,created_at&order=created_at.desc&limit=2000',
      { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } });
    const j = await r.json();
    if (Array.isArray(j)) people = j;
  } catch (e) {}

  const urls = STATIC.map(([loc, freq, pri]) =>
    `  <url><loc>${SITE}${loc}</loc><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`);

  for (const p of people) {
    if (!p || !p.username) continue;
    const when = p.created_at ? String(p.created_at).slice(0, 10) : '';
    urls.push(`  <url><loc>${SITE}/u/${esc(encodeURIComponent(p.username))}</loc>` +
      (when ? `<lastmod>${when}</lastmod>` : '') +
      `<changefreq>weekly</changefreq><priority>0.7</priority></url>`);
  }

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400');
  res.statusCode = 200;
  res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
};
