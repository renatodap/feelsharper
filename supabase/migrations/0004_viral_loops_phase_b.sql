-- 0004_viral_loops_phase_b.sql
-- Viral Loops & Defensibility: Phase B - Squads, Challenges, and Social Features
-- Implements team formation, challenges, leaderboards, and social engagement

-------------------------
-- Squads/Teams System
-------------------------

-- Squad/team definitions
create table if not exists public.squads (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  description   text,
  created_by    uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  is_public     boolean not null default true,
  max_members   integer default 50,
  invite_code   text unique,
  squad_type    text not null default 'general', -- general, challenge_based, goal_specific
  metadata      jsonb not null default '{}'::jsonb, -- settings, rules, theme
  
  constraint valid_max_members check(max_members > 0 and max_members <= 100)
);

create trigger trg_squads_updated before update on public.squads
for each row execute function set_updated_at();

create index if not exists idx_squads_created_by on public.squads(created_by);
create index if not exists idx_squads_public on public.squads(is_public) where is_public = true;
create index if not exists idx_squads_invite_code on public.squads(invite_code) where invite_code is not null;

-- Squad memberships
create table if not exists public.squad_members (
  id            uuid primary key default uuid_generate_v4(),
  squad_id      uuid not null references public.squads(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  joined_at     timestamptz not null default now(),
  role          text not null default 'member', -- member, admin, owner
  is_active     boolean not null default true,
  stats         jsonb not null default '{}'::jsonb, -- member-specific stats
  
  constraint unique_squad_member unique(squad_id, user_id)
);

create index if not exists idx_squad_members_squad on public.squad_members(squad_id);
create index if not exists idx_squad_members_user on public.squad_members(user_id);
create index if not exists idx_squad_members_active on public.squad_members(is_active) where is_active = true;

-------------------------
-- Challenges System
-------------------------

-- Challenge definitions
create table if not exists public.challenges (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text,
  created_by    uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  challenge_type text not null, -- individual, squad, global
  category      text not null, -- weight_loss, workouts, steps, nutrition
  rules         jsonb not null default '{}'::jsonb, -- challenge-specific rules
  rewards       jsonb not null default '{}'::jsonb, -- reward structure
  is_active     boolean not null default true,
  max_participants integer,
  
  constraint valid_challenge_dates check(ends_at > starts_at),
  constraint valid_max_participants check(max_participants is null or max_participants > 0)
);

create trigger trg_challenges_updated before update on public.challenges
for each row execute function set_updated_at();

create index if not exists idx_challenges_active on public.challenges(is_active) where is_active = true;
create index if not exists idx_challenges_dates on public.challenges(starts_at, ends_at);
create index if not exists idx_challenges_type on public.challenges(challenge_type);
create index if not exists idx_challenges_category on public.challenges(category);

-- Challenge participations
create table if not exists public.challenge_participants (
  id            uuid primary key default uuid_generate_v4(),
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  squad_id      uuid references public.squads(id) on delete cascade, -- for squad challenges
  joined_at     timestamptz not null default now(),
  progress      jsonb not null default '{}'::jsonb, -- challenge-specific progress
  final_score   numeric,
  rank          integer,
  is_completed  boolean not null default false,
  completed_at  timestamptz,
  
  constraint unique_challenge_participant unique(challenge_id, user_id)
);

create index if not exists idx_challenge_participants_challenge on public.challenge_participants(challenge_id);
create index if not exists idx_challenge_participants_user on public.challenge_participants(user_id);
create index if not exists idx_challenge_participants_squad on public.challenge_participants(squad_id);
create index if not exists idx_challenge_participants_rank on public.challenge_participants(challenge_id, rank);

-- Challenge leaderboards (materialized view for performance)
create materialized view public.challenge_leaderboards as
select 
  cp.challenge_id,
  cp.user_id,
  p.referral_code as username, -- Using referral_code as display name for now
  cp.final_score,
  cp.rank,
  cp.progress,
  cp.is_completed,
  c.title as challenge_title,
  c.category,
  c.ends_at
from public.challenge_participants cp
join public.challenges c on c.id = cp.challenge_id
join public.profiles p on p.id = cp.user_id
where c.is_active = true
order by cp.challenge_id, cp.rank nulls last, cp.final_score desc nulls last;

create unique index idx_challenge_leaderboards_unique on public.challenge_leaderboards(challenge_id, user_id);
create index idx_challenge_leaderboards_challenge on public.challenge_leaderboards(challenge_id);

-- Refresh leaderboards function
create or replace function refresh_challenge_leaderboards()
returns void as $$
begin
  refresh materialized view concurrently public.challenge_leaderboards;
end;
$$ language plpgsql security definer;

-------------------------
-- Social Features
-------------------------

-- Activity feed for squads and challenges
create table if not exists public.activity_feed (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  activity_type text not null, -- workout_completed, challenge_joined, pr_achieved, etc.
  content       jsonb not null default '{}'::jsonb, -- activity-specific data
  squad_id      uuid references public.squads(id) on delete cascade,
  challenge_id  uuid references public.challenges(id) on delete cascade,
  created_at    timestamptz not null default now(),
  is_public     boolean not null default true,
  
  constraint valid_activity_type check(activity_type in (
    'workout_completed', 'challenge_joined', 'pr_achieved', 'goal_reached',
    'squad_joined', 'challenge_completed', 'streak_milestone', 'referral_earned'
  ))
);

create index if not exists idx_activity_feed_user on public.activity_feed(user_id);
create index if not exists idx_activity_feed_squad on public.activity_feed(squad_id);
create index if not exists idx_activity_feed_challenge on public.activity_feed(challenge_id);
create index if not exists idx_activity_feed_created on public.activity_feed(created_at desc);
create index if not exists idx_activity_feed_public on public.activity_feed(is_public) where is_public = true;

-- Progress sharing cards (viral content)
create table if not exists public.progress_cards (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  description   text,
  card_type     text not null, -- before_after, milestone, pr, streak
  card_data     jsonb not null default '{}'::jsonb, -- card-specific data (images, metrics)
  created_at    timestamptz not null default now(),
  is_public     boolean not null default true,
  share_count   integer not null default 0,
  like_count    integer not null default 0,
  
  constraint valid_card_type check(card_type in (
    'before_after', 'milestone', 'pr', 'streak', 'transformation', 'achievement'
  ))
);

create index if not exists idx_progress_cards_user on public.progress_cards(user_id);
create index if not exists idx_progress_cards_type on public.progress_cards(card_type);
create index if not exists idx_progress_cards_public on public.progress_cards(is_public) where is_public = true;
create index if not exists idx_progress_cards_popular on public.progress_cards(like_count desc, created_at desc);

-------------------------
-- Row Level Security (RLS)
-------------------------

-- Enable RLS
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.activity_feed enable row level security;
alter table public.progress_cards enable row level security;

-- Squads policies
create policy "Public squads are viewable by everyone"
  on public.squads for select
  using (is_public = true);

create policy "Squad members can view their squads"
  on public.squads for select
  using (
    id in (
      select squad_id from public.squad_members 
      where user_id = auth.uid() and is_active = true
    )
  );

create policy "Users can create squads"
  on public.squads for insert
  with check (auth.uid() = created_by);

create policy "Squad owners can update their squads"
  on public.squads for update
  using (
    auth.uid() = created_by or 
    auth.uid() in (
      select user_id from public.squad_members 
      where squad_id = id and role in ('owner', 'admin') and is_active = true
    )
  );

-- Squad members policies
create policy "Squad members can view squad membership"
  on public.squad_members for select
  using (
    squad_id in (
      select squad_id from public.squad_members 
      where user_id = auth.uid() and is_active = true
    )
  );

create policy "Users can join squads"
  on public.squad_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave squads"
  on public.squad_members for update
  using (auth.uid() = user_id);

-- Challenges policies
create policy "Active challenges are viewable by everyone"
  on public.challenges for select
  using (is_active = true);

create policy "Users can create challenges"
  on public.challenges for insert
  with check (auth.uid() = created_by);

create policy "Challenge creators can update their challenges"
  on public.challenges for update
  using (auth.uid() = created_by);

-- Challenge participants policies
create policy "Users can view challenge participants"
  on public.challenge_participants for select
  using (
    challenge_id in (
      select id from public.challenges where is_active = true
    )
  );

create policy "Users can join challenges"
  on public.challenge_participants for insert
  with check (auth.uid() = user_id);

create policy "Users can update their participation"
  on public.challenge_participants for update
  using (auth.uid() = user_id);

-- Activity feed policies
create policy "Public activities are viewable by everyone"
  on public.activity_feed for select
  using (is_public = true);

create policy "Squad members can view squad activities"
  on public.activity_feed for select
  using (
    squad_id in (
      select squad_id from public.squad_members 
      where user_id = auth.uid() and is_active = true
    )
  );

create policy "Users can create activities"
  on public.activity_feed for insert
  with check (auth.uid() = user_id);

-- Progress cards policies
create policy "Public progress cards are viewable by everyone"
  on public.progress_cards for select
  using (is_public = true);

create policy "Users can view their own progress cards"
  on public.progress_cards for select
  using (auth.uid() = user_id);

create policy "Users can create progress cards"
  on public.progress_cards for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress cards"
  on public.progress_cards for update
  using (auth.uid() = user_id);

-------------------------
-- Functions & Triggers
-------------------------

-- Auto-generate squad invite codes
create or replace function generate_squad_invite_code()
returns text as $$
declare
  code text;
  exists boolean;
begin
  loop
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    select true into exists from public.squads where invite_code = code limit 1;
    
    if not found then
      return code;
    end if;
  end loop;
end;
$$ language plpgsql security definer;

-- Create squad invite code on squad creation
create or replace function create_squad_invite_code()
returns trigger as $$
begin
  if new.invite_code is null then
    new.invite_code := generate_squad_invite_code();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_create_squad_invite_code
  before insert on public.squads
  for each row execute function create_squad_invite_code();

-- Auto-add squad creator as owner
create or replace function add_squad_creator_as_owner()
returns trigger as $$
begin
  insert into public.squad_members (squad_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_add_squad_creator_as_owner
  after insert on public.squads
  for each row execute function add_squad_creator_as_owner();

-- Update challenge participant ranks
create or replace function update_challenge_ranks()
returns trigger as $$
begin
  -- Update ranks for all participants in the challenge
  with ranked_participants as (
    select 
      id,
      row_number() over (order by final_score desc nulls last, joined_at asc) as new_rank
    from public.challenge_participants
    where challenge_id = coalesce(new.challenge_id, old.challenge_id)
      and final_score is not null
  )
  update public.challenge_participants
  set rank = ranked_participants.new_rank
  from ranked_participants
  where public.challenge_participants.id = ranked_participants.id;
  
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger trg_update_challenge_ranks
  after insert or update or delete on public.challenge_participants
  for each row execute function update_challenge_ranks();

-------------------------
-- Initial Data & Indexes
-------------------------

-- Performance indexes
create index if not exists idx_squads_active_members on public.squad_members(squad_id) where is_active = true;
create index if not exists idx_challenges_active_participants on public.challenge_participants(challenge_id) where is_completed = false;
create index if not exists idx_activity_feed_recent on public.activity_feed(created_at desc) where is_public = true;

-- Composite indexes for common queries
create index if not exists idx_squad_members_user_active on public.squad_members(user_id, is_active);
create index if not exists idx_challenge_participants_user_active on public.challenge_participants(user_id, is_completed);
create index if not exists idx_progress_cards_user_public on public.progress_cards(user_id, is_public);
