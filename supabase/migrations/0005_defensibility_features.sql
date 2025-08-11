-- 0005_defensibility_features.sql
-- Viral Loops & Defensibility: Defensibility Features
-- Implements anti-abuse, moderation, invite-only features, and security measures

-------------------------
-- Anti-Abuse & Moderation
-------------------------

-- User reputation and trust scores
create table if not exists public.user_reputation (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade unique,
  trust_score   numeric not null default 50.0, -- 0-100 scale
  reputation    integer not null default 0,     -- can go negative
  flags_received integer not null default 0,
  flags_given   integer not null default 0,
  violations    jsonb not null default '[]'::jsonb, -- history of violations
  restrictions  jsonb not null default '{}'::jsonb, -- active restrictions
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  
  constraint valid_trust_score check(trust_score >= 0 and trust_score <= 100)
);

create trigger trg_user_reputation_updated before update on public.user_reputation
for each row execute function set_updated_at();

create index if not exists idx_user_reputation_user on public.user_reputation(user_id);
create index if not exists idx_user_reputation_trust on public.user_reputation(trust_score desc);

-- Content moderation and flagging
create table if not exists public.content_flags (
  id            uuid primary key default uuid_generate_v4(),
  flagger_id    uuid not null references auth.users(id) on delete cascade,
  target_type   text not null, -- progress_card, activity_feed, squad, challenge
  target_id     uuid not null,
  flag_type     text not null, -- spam, inappropriate, fake, harassment
  reason        text,
  status        text not null default 'pending', -- pending, reviewed, dismissed, upheld
  reviewed_by   uuid references auth.users(id),
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  
  constraint valid_flag_type check(flag_type in ('spam', 'inappropriate', 'fake', 'harassment', 'other')),
  constraint valid_status check(status in ('pending', 'reviewed', 'dismissed', 'upheld')),
  constraint no_self_flag check(flagger_id != target_id)
);

create index if not exists idx_content_flags_target on public.content_flags(target_type, target_id);
create index if not exists idx_content_flags_status on public.content_flags(status);
create index if not exists idx_content_flags_flagger on public.content_flags(flagger_id);

-- Rate limiting and abuse prevention
create table if not exists public.rate_limits (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  action_type   text not null, -- referral_create, squad_join, challenge_join, etc.
  count         integer not null default 1,
  window_start  timestamptz not null default now(),
  expires_at    timestamptz not null,
  
  constraint unique_user_action_window unique(user_id, action_type, window_start)
);

create index if not exists idx_rate_limits_user_action on public.rate_limits(user_id, action_type);
create index if not exists idx_rate_limits_expires on public.rate_limits(expires_at);

-- Suspicious activity detection
create table if not exists public.suspicious_activities (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  activity_type text not null, -- multiple_accounts, fake_referrals, bot_behavior
  details       jsonb not null default '{}'::jsonb,
  confidence    numeric not null, -- 0-1 confidence score
  status        text not null default 'detected', -- detected, investigating, resolved, false_positive
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz,
  
  constraint valid_confidence check(confidence >= 0 and confidence <= 1),
  constraint valid_status check(status in ('detected', 'investigating', 'resolved', 'false_positive'))
);

create index if not exists idx_suspicious_activities_user on public.suspicious_activities(user_id);
create index if not exists idx_suspicious_activities_type on public.suspicious_activities(activity_type);
create index if not exists idx_suspicious_activities_confidence on public.suspicious_activities(confidence desc);

-------------------------
-- Invite-Only Features
-------------------------

-- Beta/invite-only access control
create table if not exists public.beta_access (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade unique,
  access_level  text not null default 'beta', -- beta, alpha, premium, admin
  granted_by    uuid references auth.users(id),
  granted_at    timestamptz not null default now(),
  expires_at    timestamptz,
  features      jsonb not null default '{}'::jsonb, -- feature flags
  
  constraint valid_access_level check(access_level in ('beta', 'alpha', 'premium', 'admin'))
);

create index if not exists idx_beta_access_user on public.beta_access(user_id);
create index if not exists idx_beta_access_level on public.beta_access(access_level);

-- Feature gates and A/B testing
create table if not exists public.feature_flags (
  id            uuid primary key default uuid_generate_v4(),
  feature_name  text not null unique,
  is_enabled    boolean not null default false,
  rollout_percentage numeric not null default 0, -- 0-100
  target_groups jsonb not null default '[]'::jsonb, -- user groups to target
  config        jsonb not null default '{}'::jsonb, -- feature-specific config
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  
  constraint valid_rollout check(rollout_percentage >= 0 and rollout_percentage <= 100)
);

create trigger trg_feature_flags_updated before update on public.feature_flags
for each row execute function set_updated_at();

create index if not exists idx_feature_flags_name on public.feature_flags(feature_name);
create index if not exists idx_feature_flags_enabled on public.feature_flags(is_enabled) where is_enabled = true;

-- User feature assignments (for A/B testing)
create table if not exists public.user_feature_assignments (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  feature_name  text not null,
  variant       text not null default 'control', -- control, treatment_a, treatment_b, etc.
  assigned_at   timestamptz not null default now(),
  
  constraint unique_user_feature unique(user_id, feature_name)
);

create index if not exists idx_user_feature_assignments_user on public.user_feature_assignments(user_id);
create index if not exists idx_user_feature_assignments_feature on public.user_feature_assignments(feature_name);

-------------------------
-- Enhanced Security
-------------------------

-- Referral fraud detection
alter table public.referrals 
add column if not exists fraud_score numeric default 0,
add column if not exists fraud_flags jsonb default '[]'::jsonb,
add column if not exists verified_at timestamptz;

-- Squad security enhancements
alter table public.squads
add column if not exists requires_approval boolean default false,
add column if not exists auto_kick_inactive boolean default false,
add column if not exists inactive_days_threshold integer default 30;

-- Challenge integrity
alter table public.challenges
add column if not exists requires_verification boolean default false,
add column if not exists anti_cheat_enabled boolean default true;

-------------------------
-- Row Level Security (RLS) Updates
-------------------------

-- User reputation policies
alter table public.user_reputation enable row level security;

create policy "Users can view their own reputation"
  on public.user_reputation for select
  using (auth.uid() = user_id);

create policy "System can manage reputation"
  on public.user_reputation for all
  using (true); -- Handled by API validation

-- Content flags policies
alter table public.content_flags enable row level security;

create policy "Users can view flags they created"
  on public.content_flags for select
  using (auth.uid() = flagger_id);

create policy "Users can create flags"
  on public.content_flags for insert
  with check (auth.uid() = flagger_id);

-- Rate limits policies
alter table public.rate_limits enable row level security;

create policy "Users can view their own rate limits"
  on public.rate_limits for select
  using (auth.uid() = user_id);

-- Beta access policies
alter table public.beta_access enable row level security;

create policy "Users can view their own beta access"
  on public.beta_access for select
  using (auth.uid() = user_id);

-- Feature flags policies (public read for enabled flags)
alter table public.feature_flags enable row level security;

create policy "Enabled feature flags are publicly viewable"
  on public.feature_flags for select
  using (is_enabled = true);

-- User feature assignments policies
alter table public.user_feature_assignments enable row level security;

create policy "Users can view their own feature assignments"
  on public.user_feature_assignments for select
  using (auth.uid() = user_id);

-------------------------
-- Anti-Abuse Functions
-------------------------

-- Check rate limit function
create or replace function check_rate_limit(
  p_user_id uuid,
  p_action_type text,
  p_limit integer,
  p_window_minutes integer default 60
)
returns boolean as $$
declare
  current_count integer;
  window_start timestamptz;
begin
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up expired rate limits
  delete from public.rate_limits 
  where expires_at < now();
  
  -- Get current count in window
  select coalesce(sum(count), 0) into current_count
  from public.rate_limits
  where user_id = p_user_id 
    and action_type = p_action_type
    and window_start >= window_start;
  
  -- Check if limit exceeded
  if current_count >= p_limit then
    return false;
  end if;
  
  -- Record this action
  insert into public.rate_limits (user_id, action_type, count, expires_at)
  values (p_user_id, p_action_type, 1, now() + (p_window_minutes || ' minutes')::interval)
  on conflict (user_id, action_type, window_start) 
  do update set count = rate_limits.count + 1;
  
  return true;
end;
$$ language plpgsql security definer;

-- Calculate fraud score for referrals
create or replace function calculate_referral_fraud_score(p_referral_id uuid)
returns numeric as $$
declare
  fraud_score numeric := 0;
  referrer_data record;
  referee_data record;
  time_diff interval;
begin
  -- Get referral data
  select r.*, 
         rr.trust_score as referrer_trust,
         re.trust_score as referee_trust
  into referrer_data
  from public.referrals r
  join public.user_reputation rr on rr.user_id = r.referrer_id
  join public.user_reputation re on re.user_id = r.referee_id
  where r.id = p_referral_id;
  
  if not found then
    return 0;
  end if;
  
  -- Check time between account creation and referral
  time_diff := referrer_data.created_at - (
    select created_at from auth.users where id = referrer_data.referee_id
  );
  
  -- Suspicious if referred very quickly after account creation
  if time_diff < interval '1 hour' then
    fraud_score := fraud_score + 30;
  elsif time_diff < interval '1 day' then
    fraud_score := fraud_score + 15;
  end if;
  
  -- Check trust scores
  if referrer_data.referrer_trust < 30 then
    fraud_score := fraud_score + 20;
  end if;
  
  if referrer_data.referee_trust < 30 then
    fraud_score := fraud_score + 20;
  end if;
  
  -- Check for multiple referrals from same referrer in short time
  if (
    select count(*) 
    from public.referrals 
    where referrer_id = referrer_data.referrer_id 
      and created_at > now() - interval '1 day'
  ) > 5 then
    fraud_score := fraud_score + 25;
  end if;
  
  return least(fraud_score, 100);
end;
$$ language plpgsql security definer;

-- Update referral fraud scores trigger
create or replace function update_referral_fraud_score()
returns trigger as $$
begin
  new.fraud_score := calculate_referral_fraud_score(new.id);
  
  -- Flag high fraud scores
  if new.fraud_score > 70 then
    new.fraud_flags := new.fraud_flags || '["high_fraud_score"]'::jsonb;
    
    -- Create suspicious activity record
    insert into public.suspicious_activities (user_id, activity_type, details, confidence)
    values (
      new.referrer_id, 
      'fake_referrals', 
      jsonb_build_object('referral_id', new.id, 'fraud_score', new.fraud_score),
      new.fraud_score / 100.0
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_update_referral_fraud_score
  before insert or update on public.referrals
  for each row execute function update_referral_fraud_score();

-------------------------
-- Initial Data
-------------------------

-- Create default feature flags
insert into public.feature_flags (feature_name, is_enabled, rollout_percentage) values
('referral_system', true, 100),
('squad_creation', true, 100),
('challenge_creation', true, 50),
('progress_sharing', true, 100),
('beta_features', false, 0)
on conflict (feature_name) do nothing;

-- Performance indexes
create index if not exists idx_user_reputation_violations on public.user_reputation using gin(violations);
create index if not exists idx_content_flags_pending on public.content_flags(created_at desc) where status = 'pending';
create index if not exists idx_suspicious_activities_unresolved on public.suspicious_activities(created_at desc) where status in ('detected', 'investigating');
