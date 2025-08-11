-- 0002_goal_first_dashboard.sql
-- Add dashboard preferences and goal-first onboarding enhancements

-------------------------
-- Dashboard Preferences
-------------------------
create table if not exists public.dashboard_preferences (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  modules       text[] not null default array['today', 'workouts', 'nutrition', 'progress'],
  module_order  text[] not null default array['today', 'workouts', 'nutrition', 'progress'],
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  
  -- Ensure one preferences row per user
  constraint unique_user_dashboard_prefs unique(user_id)
);

create trigger trg_dashboard_preferences_updated 
before update on public.dashboard_preferences
for each row execute function set_updated_at();

create index if not exists idx_dashboard_preferences_user 
on public.dashboard_preferences(user_id);

-------------------------
-- User Goals Enhancement
-------------------------
-- Add weekly time commitment and onboarding completion status to profiles
alter table public.profiles 
add column if not exists weekly_hours_available integer default 5,
add column if not exists onboarding_completed boolean default false,
add column if not exists primary_goal goal_type_enum,
add column if not exists goal_details jsonb default '{}'::jsonb;

-------------------------
-- Coach Insights (for AI Coach Panel)
-------------------------
create table if not exists public.coach_insights (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  insight_type  text not null, -- 'nutrition', 'recovery', 'training', 'progress'
  title         text not null,
  message       text not null,
  action_label  text,
  action_payload jsonb default '{}'::jsonb,
  priority      integer default 1, -- 1=high, 2=medium, 3=low
  shown_at      timestamptz,
  dismissed_at  timestamptz,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz default (now() + interval '7 days')
);

create index if not exists idx_coach_insights_user_active 
on public.coach_insights(user_id, created_at desc) 
where dismissed_at is null and expires_at > now();

-------------------------
-- RLS Policies
-------------------------
-- Dashboard preferences
alter table public.dashboard_preferences enable row level security;

create policy "Users can view own dashboard preferences"
on public.dashboard_preferences for select
using (auth.uid() = user_id);

create policy "Users can insert own dashboard preferences"
on public.dashboard_preferences for insert
with check (auth.uid() = user_id);

create policy "Users can update own dashboard preferences"
on public.dashboard_preferences for update
using (auth.uid() = user_id);

-- Coach insights
alter table public.coach_insights enable row level security;

create policy "Users can view own coach insights"
on public.coach_insights for select
using (auth.uid() = user_id);

create policy "Users can update own coach insights"
on public.coach_insights for update
using (auth.uid() = user_id);

-------------------------
-- Default Dashboard Preferences by Goal
-------------------------
-- Function to set default dashboard modules based on goal type
create or replace function set_default_dashboard_modules()
returns trigger as $$
begin
  -- Only set defaults if primary_goal is being set for the first time
  if NEW.primary_goal is not null and (OLD.primary_goal is null or OLD.primary_goal != NEW.primary_goal) then
    insert into public.dashboard_preferences (user_id, modules, module_order)
    values (
      NEW.id,
      case NEW.primary_goal
        when 'weight_loss' then array['today', 'nutrition', 'weight', 'workouts', 'sleep']
        when 'muscle_gain' then array['today', 'workouts', 'nutrition', 'weight', 'recovery']
        when 'endurance' then array['today', 'cardio', 'recovery', 'workouts', 'nutrition']
        when 'sport_specific' then array['today', 'workouts', 'cardio', 'recovery', 'sleep']
        when 'marathon' then array['today', 'cardio', 'recovery', 'nutrition', 'sleep']
        else array['today', 'nutrition', 'workouts', 'sleep', 'recovery']
      end,
      case NEW.primary_goal
        when 'weight_loss' then array['today', 'nutrition', 'weight', 'workouts', 'sleep']
        when 'muscle_gain' then array['today', 'workouts', 'nutrition', 'weight', 'recovery']
        when 'endurance' then array['today', 'cardio', 'recovery', 'workouts', 'nutrition']
        when 'sport_specific' then array['today', 'workouts', 'cardio', 'recovery', 'sleep']
        when 'marathon' then array['today', 'cardio', 'recovery', 'nutrition', 'sleep']
        else array['today', 'nutrition', 'workouts', 'sleep', 'recovery']
      end
    )
    on conflict (user_id) do update set
      modules = excluded.modules,
      module_order = excluded.module_order,
      updated_at = now();
  end if;
  
  return NEW;
end;
$$ language plpgsql;

create trigger trg_profiles_set_dashboard_defaults
after update on public.profiles
for each row execute function set_default_dashboard_modules();
