-- youGC database setup — paste this whole file into Supabase: SQL Editor -> New query -> Run

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('creator','brand')),
  username text unique not null,
  name text not null default '',
  bio text default '',
  avatar_url text default '',
  socials jsonb default '{}'::jsonb,
  niches text[] default '{}',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "profiles are public" on public.profiles for select using (true);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

-- POSTS (max 2 per day: one per 12h per user, enforced by policy)
create table public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 500),
  created_at timestamptz default now()
);
alter table public.posts enable row level security;
create policy "posts are public" on public.posts for select using (true);
create policy "one post per 12 hours" on public.posts for insert with check (
  auth.uid() = user_id
  and not exists (
    select 1 from public.posts p
    where p.user_id = auth.uid()
    and p.created_at > now() - interval '12 hours'
  )
);
create policy "delete own posts" on public.posts for delete using (auth.uid() = user_id);

-- AVATARS bucket
insert into storage.buckets (id, name, public) values ('avatars','avatars', true)
on conflict (id) do nothing;
create policy "avatar read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatar upload" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "avatar replace" on storage.objects for update using (bucket_id = 'avatars' and owner = auth.uid());

-- WAITLIST (public email capture, write-only from the site)
create table public.waitlist (
  id bigint generated always as identity primary key,
  email text unique not null,
  created_at timestamptz default now()
);
alter table public.waitlist enable row level security;
create policy "anyone can join waitlist" on public.waitlist for insert with check (true);
-- no select policy on purpose: emails are not readable through the public API

-- FEATURED POSTS (paid pin: set featured_until = now() + interval '24 hours' manually after payment)
alter table public.posts add column if not exists featured_until timestamptz;
-- insert policy includes "featured_until is null" so users can't feature themselves

-- VERIFIED PACK + SPOTLIGHT (activate manually after payment)
-- verified: update public.profiles set verified = true where username = 'xxx';
-- spotlight: update public.profiles set spotlight_until = now() + interval '2 days' where username = 'xxx';
alter table public.profiles add column if not exists verified boolean not null default false;
alter table public.profiles add column if not exists spotlight_until timestamptz;
-- users cannot set paid columns themselves (column-level grants):
revoke update on table public.profiles from authenticated, anon;
grant update (role, username, name, bio, avatar_url, socials, niches) on table public.profiles to authenticated;
revoke insert on table public.profiles from authenticated, anon;
grant insert (id, role, username, name, bio, avatar_url, socials, niches) on table public.profiles to authenticated;
-- verified users: 3 posts/day (8h gap), others 2/day (12h gap) — policy defined above replaced accordingly


-- REFERRALS (share link /?ref=username -> 20% off next purchase per signup; redeemed manually)
create table if not exists public.referrals (
  id bigint generated always as identity primary key,
  referred uuid unique not null references public.profiles(id) on delete cascade,
  referrer_username text not null,
  created_at timestamptz default now()
);
alter table public.referrals enable row level security;
create policy "record own referral" on public.referrals for insert with check (auth.uid() = referred);
create policy "see own referral stats" on public.referrals for select using (
  auth.uid() = referred or referrer_username = (select username from public.profiles where id = auth.uid())
);


-- MESSAGES (internal DMs)
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  sender uuid not null references public.profiles(id) on delete cascade,
  recipient uuid not null references public.profiles(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 1000),
  read boolean not null default false,
  created_at timestamptz default now(),
  constraint no_self_dm check (sender <> recipient)
);
-- RLS: participants only; sender inserts; recipient can mark read (column-limited grant)


-- PROFILE ACCENT COLOR + FOLLOWS
alter table public.profiles add column if not exists accent text not null default 'blue';
create table if not exists public.follows (
  follower uuid not null references public.profiles(id) on delete cascade,
  followed uuid not null references public.profiles(id) on delete cascade,
  seen boolean not null default false,
  created_at timestamptz default now(),
  primary key (follower, followed),
  constraint no_self_follow check (follower <> followed)
);
-- RLS: public counts, follow/unfollow own, followed marks seen (column-limited)
