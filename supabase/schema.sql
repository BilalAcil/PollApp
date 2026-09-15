-- PollApp database schema.
-- Run once in the Supabase dashboard under SQL Editor -> New query -> Run.
-- Safe to re-run: every statement replaces its target first.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

drop table if exists votes cascade;
drop table if exists survey_options cascade;
drop table if exists survey_questions cascade;
drop table if exists surveys cascade;

-- A survey. One survey has one or more questions.
create table surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (category in (
    'Team Activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation'
  )),
  deadline timestamptz,
  created_at timestamptz not null default now()
);

-- A question that belongs to a survey.
-- "position" fixes the display order, since SQL tables have no row order
-- of their own.
create table survey_questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references surveys (id) on delete cascade,
  text text not null,
  position integer not null,
  allow_multiple boolean not null default false
);

-- One selectable answer for a question.
create table survey_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references survey_questions (id) on delete cascade,
  label text not null,
  position integer not null
);

-- One vote for one option. A single "Complete survey" click inserts one row
-- per selected option in a single request.
create table votes (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references survey_options (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index survey_questions_survey_id_idx on survey_questions (survey_id);
create index survey_options_question_id_idx on survey_options (question_id);
create index votes_option_id_idx on votes (option_id);

-- ---------------------------------------------------------------------------
-- Live results view
-- ---------------------------------------------------------------------------

-- Counts votes per option. security_invoker makes the view check the RLS
-- policies of the querying role instead of the view owner's permissions.
drop view if exists option_results;
create view option_results
with (security_invoker = true) as
select
  o.id as option_id,
  o.question_id,
  q.survey_id,
  o.label,
  count(v.id) as vote_count
from survey_options o
join survey_questions q on q.id = o.question_id
left join votes v on v.option_id = o.id
group by o.id, o.question_id, q.survey_id, o.label;

-- ---------------------------------------------------------------------------
-- Create a survey together with its questions and options
-- ---------------------------------------------------------------------------

-- p_questions is a JSON array shaped like:
-- [{ "text": "...", "allow_multiple": false, "options": ["A", "B"] }, ...]
-- Runs as one transaction: if any insert fails, nothing is written.
create or replace function create_survey(
  p_title text,
  p_category text,
  p_questions jsonb,
  p_description text default null,
  p_deadline timestamptz default null
)
returns uuid
language plpgsql
as $$
declare
  v_survey_id uuid;
  v_question jsonb;
  v_question_id uuid;
  v_option text;
  v_question_position integer := 0;
  v_option_position integer;
begin
  insert into surveys (title, category, description, deadline)
  values (p_title, p_category, p_description, p_deadline)
  returning id into v_survey_id;

  for v_question in select * from jsonb_array_elements(p_questions)
  loop
    insert into survey_questions (survey_id, text, position, allow_multiple)
    values (
      v_survey_id,
      v_question ->> 'text',
      v_question_position,
      coalesce((v_question ->> 'allow_multiple')::boolean, false)
    )
    returning id into v_question_id;

    v_option_position := 0;
    for v_option in select * from jsonb_array_elements_text(v_question -> 'options')
    loop
      insert into survey_options (question_id, label, position)
      values (v_question_id, v_option, v_option_position);
      v_option_position := v_option_position + 1;
    end loop;

    v_question_position := v_question_position + 1;
  end loop;

  return v_survey_id;
end;
$$;

grant execute on function create_survey(text, text, jsonb, text, timestamptz)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

-- The app has no login, so the publishable key is used by every visitor.
-- Everyone may read and create rows; nobody may update or delete anything,
-- since no policy exists for those actions and RLS denies by default.

alter table surveys enable row level security;
alter table survey_questions enable row level security;
alter table survey_options enable row level security;
alter table votes enable row level security;

create policy "Anyone can read surveys" on surveys
  for select using (true);
create policy "Anyone can create surveys" on surveys
  for insert with check (true);

create policy "Anyone can read questions" on survey_questions
  for select using (true);
create policy "Anyone can create questions" on survey_questions
  for insert with check (true);

create policy "Anyone can read options" on survey_options
  for select using (true);
create policy "Anyone can create options" on survey_options
  for insert with check (true);

create policy "Anyone can read votes" on votes
  for select using (true);
create policy "Anyone can cast votes" on votes
  for insert with check (true);

-- RLS policies only decide which rows a role may see. Postgres separately
-- requires the privilege to access the table at all; the SQL Editor does not
-- grant this automatically the way the Supabase Table Editor UI does.

grant select, insert on surveys to anon, authenticated;
grant select, insert on survey_questions to anon, authenticated;
grant select, insert on survey_options to anon, authenticated;
grant select, insert on votes to anon, authenticated;
grant select on option_results to anon, authenticated;
