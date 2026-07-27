-- PollApp - database schema for Supabase.
-- Run it in the Supabase dashboard: SQL Editor -> New query -> Run.

-- =============================================================
-- Tables
-- =============================================================

-- A survey. The deadline decides whether it is still running or closed.
create table if not exists public.surveys (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  category    text        not null,
  description text,
  deadline    timestamptz,
  created_at  timestamptz not null default now()
);

-- An answer option belonging to exactly one survey.
-- Deleting the survey removes its options as well (on delete cascade).
create table if not exists public.survey_options (
  id        uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys (id) on delete cascade,
  label     text not null
);

-- A single vote cast for one answer option.
create table if not exists public.votes (
  id         uuid primary key default gen_random_uuid(),
  option_id  uuid        not null references public.survey_options (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Indexes for the queries the application runs most often.
create index if not exists survey_options_survey_id_idx on public.survey_options (survey_id);
create index if not exists votes_option_id_idx          on public.votes (option_id);
create index if not exists surveys_deadline_idx         on public.surveys (deadline);

-- =============================================================
-- Row level security
-- =============================================================
-- Without RLS anyone holding the publishable key could wipe the tables.
-- The application has no login, so reading and inserting is open to everyone
-- while updating and deleting is allowed for nobody.

alter table public.surveys        enable row level security;
alter table public.survey_options enable row level security;
alter table public.votes          enable row level security;

create policy "surveys_select" on public.surveys        for select using (true);
create policy "surveys_insert" on public.surveys        for insert with check (true);

create policy "options_select" on public.survey_options for select using (true);
create policy "options_insert" on public.survey_options for insert with check (true);

create policy "votes_select"   on public.votes          for select using (true);
create policy "votes_insert"   on public.votes          for insert with check (true);

-- =============================================================
-- Privileges
-- =============================================================
-- A second, independent layer next to RLS: a grant decides whether the role may
-- touch the table at all, RLS then decides which rows it sees. Without the grant
-- the API answers with 401 "permission denied for table ...".
-- "anon" is the role the publishable key runs as.

grant select, insert on public.surveys        to anon, authenticated;
grant select, insert on public.survey_options to anon, authenticated;
grant select, insert on public.votes          to anon, authenticated;

-- =============================================================
-- View: vote count per option
-- =============================================================
-- Counting happens in the database so the frontend does not have to.
-- security_invoker = on makes the view apply the RLS rules of the caller
-- instead of those of its owner.

create or replace view public.option_results
with (security_invoker = on) as
select
  o.id        as option_id,
  o.survey_id as survey_id,
  o.label     as label,
  count(v.id) as vote_count
from public.survey_options o
left join public.votes v on v.option_id = o.id
group by o.id, o.survey_id, o.label;

grant select on public.option_results to anon, authenticated;

-- =============================================================
-- Function: create a survey and its options atomically
-- =============================================================
-- A survey without answer options would be useless. Since the application is not
-- allowed to delete anything, it cannot clean up a half-created state on its own.
-- Both inserts therefore happen inside this function, which runs as a single
-- transaction: any error rolls the whole thing back.
-- No "security definer" here - the function runs with the privileges of the
-- caller, so the RLS policies still apply.

create or replace function public.create_survey(
  p_title       text,
  p_category    text,
  p_options     text[],
  p_description text        default null,
  p_deadline    timestamptz default null
) returns uuid
language plpgsql
as $$
declare
  v_survey_id uuid;
begin
  if coalesce(array_length(p_options, 1), 0) < 2 then
    raise exception 'Eine Umfrage braucht mindestens zwei Antwortoptionen.';
  end if;

  insert into public.surveys (title, category, description, deadline)
  values (p_title, p_category, p_description, p_deadline)
  returning id into v_survey_id;

  insert into public.survey_options (survey_id, label)
  select v_survey_id, trim(label)
  from unnest(p_options) as label
  where trim(label) <> '';

  return v_survey_id;
end;
$$;

grant execute on function public.create_survey(text, text, text[], text, timestamptz)
  to anon, authenticated;

-- =============================================================
-- Sample data (optional, for testing)
-- =============================================================

insert into public.surveys (title, category, description, deadline)
values
  ('Welches Framework für das nächste Projekt?', 'Technik',
   'Wir starten im Herbst ein neues Projekt.', now() + interval '3 days'),
  ('Wohin geht der Betriebsausflug?', 'Freizeit',
   null, now() + interval '20 days'),
  ('Bestes Mittagessen in der Kantine', 'Verpflegung',
   'Rückblick auf das letzte Halbjahr.', now() - interval '2 days');

insert into public.survey_options (survey_id, label)
select s.id, o.label
from public.surveys s
join (values
  ('Welches Framework für das nächste Projekt?', 'Angular'),
  ('Welches Framework für das nächste Projekt?', 'React'),
  ('Welches Framework für das nächste Projekt?', 'Vue'),
  ('Wohin geht der Betriebsausflug?', 'Wandern in den Alpen'),
  ('Wohin geht der Betriebsausflug?', 'Städtetrip Wien'),
  ('Bestes Mittagessen in der Kantine', 'Schnitzel'),
  ('Bestes Mittagessen in der Kantine', 'Lasagne')
) as o (survey_title, label) on o.survey_title = s.title;
