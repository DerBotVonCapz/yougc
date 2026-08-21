# youGC — GO LIVE CHECKLIST (no terminal needed, ~20 min)

## 1. Database (Supabase) — 3 min
1. Open your Supabase project → left sidebar → **SQL Editor** → **New query**
2. Open the file `setup.sql`, copy EVERYTHING, paste it in, press **Run**
3. You should see "Success. No rows returned" — done.

## 2. Turn off email confirmation (so signups work instantly) — 1 min
1. Supabase → **Authentication** → **Sign In / Providers** (or Settings → Auth)
2. Under Email: toggle **"Confirm email" OFF** → Save
(You can turn it back on later when we set up a proper email sender.)

## 3. Put the code on GitHub — 5 min
1. github.com → top right **+** → **New repository** → name: `yougc` → Public or Private (either) → Create
2. On the empty repo page click **"uploading an existing file"**
3. Drag ALL the site files in (index.html, auth.html, onboard.html, app.html, profile.html, style.css, app.js, config.js — NOT setup.sql/SETUP.md needed, but they don't hurt)
4. Click **Commit changes**

## 4. Deploy on Vercel — 3 min
1. vercel.com → **Add New → Project**
2. **Import** the `yougc` repo → Framework preset: **Other** → leave everything default → **Deploy**
3. ~30 seconds later you get a live link like `yougc.vercel.app` — THE SITE IS LIVE.

## 5. Allow the live site in Supabase — 1 min
1. Supabase → **Authentication** → **URL Configuration**
2. Site URL: your vercel link (e.g. https://yougc.vercel.app)
3. Add the same to Additional Redirect URLs → Save

## 6. Domain (when you buy it) — 5 min
1. Vercel → your project → **Settings → Domains** → add `yougc.xyz` (or whatever you buy)
2. Vercel shows you 1-2 DNS records → copy them into Porkbun (Domain → DNS) 
3. Wait a few minutes → site runs on your domain. Update step 5 with the new domain too.

## 7. Test the whole flow — 5 min
1. Open the live site → click "i'm a creator" → sign up with a real email + password
2. Build the profile (pfp, name, username, bio, niches, at least one social) → save
3. Make a post → check it appears in the marketplace
4. Open a second browser (or incognito) → sign up as "i need creators" → check you can see the creator's post, filter by niche, open the profile, hit message

## Updating the site later
Edit files in the GitHub repo (or replace them via Upload) → Vercel redeploys automatically on every commit.

## Coming next (we build after launch)
- Google sign-in (needs a Google Cloud OAuth app — 15 min together)
- In-app messages instead of social links
- Creator video embeds on profiles
- Search bar + more filters
