-- PollApp – Datenbankschema für Supabase
-- Ausführen im Supabase Dashboard unter: SQL Editor -> New query -> Run

-- =============================================================
-- Tabellen
-- =============================================================

-- Eine Umfrage. "deadline" bestimmt, ob sie laufend oder beendet ist.
create table if not exists public.surveys (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  category    text        not null,
  description text,
  deadline    timestamptz,
  created_at  timestamptz not null default now()
);

-- Eine Antwortmöglichkeit, die zu genau einer Umfrage gehört.
-- Wird die Umfrage gelöscht, verschwinden auch ihre Optionen (on delete cascade).
create table if not exists public.survey_options (
  id        uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys (id) on delete cascade,
  label     text not null
);

-- Eine einzelne abgegebene Stimme für eine Option.
create table if not exists public.votes (
  id         uuid primary key default gen_random_uuid(),
  option_id  uuid        not null references public.survey_options (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Indizes für die Abfragen, die die App am häufigsten macht.
create index if not exists survey_options_survey_id_idx on public.survey_options (survey_id);
create index if not exists votes_option_id_idx          on public.votes (option_id);
create index if not exists surveys_deadline_idx         on public.surveys (deadline);

-- =============================================================
-- Row Level Security
-- =============================================================
-- Ohne RLS kann jeder mit dem anon key die Tabellen leeren.
-- Die App hat keinen Login, deshalb: Lesen und Anlegen für alle erlaubt,
-- Ändern und Löschen für niemanden.

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
-- Rechte (GRANTs)
-- =============================================================
-- Zweite, unabhängige Rechte-Ebene neben RLS: GRANT entscheidet, ob die Rolle
-- die Tabelle überhaupt ansprechen darf, RLS danach, welche Zeilen sie sieht.
-- Fehlt der GRANT, antwortet die API mit 401 "permission denied for table ...".
-- "anon" ist die Rolle, unter der der Publishable key läuft.

grant select, insert on public.surveys        to anon, authenticated;
grant select, insert on public.survey_options to anon, authenticated;
grant select, insert on public.votes          to anon, authenticated;

-- =============================================================
-- View: Stimmen pro Option (spart das Zählen im Frontend)
-- =============================================================
-- security_invoker = on sorgt dafür, dass die View die RLS-Regeln des
-- aufrufenden Benutzers anwendet statt die des Erstellers.

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
-- Funktion: Umfrage + Optionen atomar anlegen
-- =============================================================
-- Eine Umfrage ohne Antwortoptionen wäre unbrauchbar. Da die App nichts löschen
-- darf, kann sie einen halb angelegten Zustand nicht selbst aufräumen. Deshalb
-- passiert beides hier in einer Funktion: Sie läuft als eine Transaktion,
-- ein Fehler macht automatisch alles rückgängig.
-- Kein "security definer" - die Funktion läuft mit den Rechten des Aufrufers,
-- die RLS-Policies greifen also weiterhin.

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
-- Beispieldaten (optional, zum Testen)
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
