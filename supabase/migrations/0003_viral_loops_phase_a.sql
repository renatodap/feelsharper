-- 0003_viral_loops_phase_a.sql
-- Viral Loops & Defensibility: Phase A - Referrals System
-- Implements referral codes, tracking, rewards, and onboarding integration

-------------------------
-- Referral System Tables
-------------------------

-- Referral codes and tracking
create table if not exists public.referral_codes (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  code          text not null unique,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz,
  max_uses      integer default null,              -- null = unlimited
  current_uses  integer not null default 0,
  is_active     boolean not null default true,
  metadata      jsonb not null default '{}'::jsonb -- campaign info, custom rewards
);

create index if not exists idx_referral_codes_user on public.referral_codes(user_id);
create index if not exists idx_referral_codes_code on public.referral_codes(code);

-- Referral relationships and tracking
create table if not exists public.referrals (
  id                uuid primary key default uuid_generate_v4(),
  referrer_id       uuid not null references auth.users(id) on delete cascade,
  referee_id        uuid not null references auth.users(id) on delete cascade,
  referral_code_id  uuid not null references public.referral_codes(id) on delete cascade,
  created_at        timestamptz not null default now(),
  status            text not null default 'pending',    -- pending, qualified, rewarded
  qualified_at      timestamptz,                         -- when referee completed onboarding
  rewarded_at       timestamptz,                         -- when rewards were granted
  metadata          jsonb not null default '{}'::jsonb,  -- tracking data, conversion events
  
  constraint unique_referee unique(referee_id),           -- one referrer per user
  constraint no_self_referral check(referrer_id != referee_id)
);

create index if not exists idx_referrals_referrer on public.referrals(referrer_id);
create index if not exists idx_referrals_referee on public.referrals(referee_id);
create index if not exists idx_referrals_status on public.referrals(status);

-- Referral rewards and achievements
create table if not exists public.referral_rewards (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  referral_id   uuid not null references public.referrals(id) on delete cascade,
  reward_type   text not null,                           -- 'premium_days', 'badge', 'feature_unlock'
  reward_value  jsonb not null default '{}'::jsonb,      -- structured reward data
  granted_at    timestamptz not null default now(),
  expires_at    timestamptz,
  is_claimed    boolean not null default false,
  claimed_at    timestamptz
);

create index if not exists idx_referral_rewards_user on public.referral_rewards(user_id);
create index if not exists idx_referral_rewards_type on public.referral_rewards(reward_type);

-------------------------
-- Enhanced Profiles for Referrals
-------------------------

-- Add referral fields to profiles
alter table public.profiles 
add column if not exists referral_code text,
add column if not exists total_referrals integer not null default 0,
add column if not exists qualified_referrals integer not null default 0,
add column if not exists referral_tier text default 'bronze'; -- bronze, silver, gold, platinum

-- Add referral onboarding tracking
alter table public.profiles
add column if not exists referred_by uuid references auth.users(id),
add column if not exists onboarding_completed_at timestamptz;

-------------------------
-- Row Level Security (RLS)
-------------------------

-- Enable RLS
alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_rewards enable row level security;

-- Referral codes policies
create policy "Users can view their own referral codes"
  on public.referral_codes for select
  using (auth.uid() = user_id);

create policy "Users can create their own referral codes"
  on public.referral_codes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own referral codes"
  on public.referral_codes for update
  using (auth.uid() = user_id);

-- Referrals policies
create policy "Users can view referrals they're involved in"
  on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referee_id);

create policy "System can create referrals"
  on public.referrals for insert
  with check (true); -- Handled by API validation

create policy "System can update referral status"
  on public.referrals for update
  using (true); -- Handled by API validation

-- Referral rewards policies
create policy "Users can view their own rewards"
  on public.referral_rewards for select
  using (auth.uid() = user_id);

create policy "System can grant rewards"
  on public.referral_rewards for insert
  with check (true); -- Handled by API validation

create policy "Users can claim their rewards"
  on public.referral_rewards for update
  using (auth.uid() = user_id);

-------------------------
-- Functions & Triggers
-------------------------

-- Auto-generate referral code for new users
create or replace function generate_referral_code()
returns text as $$
declare
  code text;
  exists boolean;
begin
  loop
    -- Generate 6-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    select true into exists from public.referral_codes where referral_codes.code = code limit 1;
    
    if not found then
      return code;
    end if;
  end loop;
end;
$$ language plpgsql security definer;

-- Create default referral code for new users
create or replace function create_default_referral_code()
returns trigger as $$
begin
  insert into public.referral_codes (user_id, code)
  values (new.id, generate_referral_code());
  
  -- Update profile with the code
  update public.profiles 
  set referral_code = (
    select code from public.referral_codes 
    where user_id = new.id 
    limit 1
  )
  where id = new.id;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create referral code on profile creation
create trigger trg_create_referral_code
  after insert on public.profiles
  for each row execute function create_default_referral_code();

-- Update referral stats when referral status changes
create or replace function update_referral_stats()
returns trigger as $$
begin
  -- Update total referrals count
  update public.profiles
  set total_referrals = (
    select count(*) from public.referrals 
    where referrer_id = new.referrer_id
  )
  where id = new.referrer_id;
  
  -- Update qualified referrals count if status changed to qualified
  if new.status = 'qualified' and (old.status is null or old.status != 'qualified') then
    update public.profiles
    set qualified_referrals = qualified_referrals + 1
    where id = new.referrer_id;
    
    -- Update referral tier based on qualified referrals
    update public.profiles
    set referral_tier = case
      when qualified_referrals >= 25 then 'platinum'
      when qualified_referrals >= 10 then 'gold'
      when qualified_referrals >= 3 then 'silver'
      else 'bronze'
    end
    where id = new.referrer_id;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_update_referral_stats
  after insert or update on public.referrals
  for each row execute function update_referral_stats();

-------------------------
-- Initial Data & Indexes
-------------------------

-- Performance indexes
create index if not exists idx_referral_codes_active on public.referral_codes(is_active) where is_active = true;
create index if not exists idx_referrals_qualified on public.referrals(qualified_at) where qualified_at is not null;
create index if not exists idx_referral_rewards_unclaimed on public.referral_rewards(is_claimed) where is_claimed = false;

-- Composite indexes for common queries
create index if not exists idx_referrals_referrer_status on public.referrals(referrer_id, status);
create index if not exists idx_profiles_referral_tier on public.profiles(referral_tier);
