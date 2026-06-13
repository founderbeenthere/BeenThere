-- BeenThere – schema Supabase
-- Esegui questo SQL nel tuo progetto Supabase > SQL Editor

-- ── Tabella trips ────────────────────────────────────────────────────────────
create table if not exists public.trips (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  place_name  text not null,
  visit_date  date,
  note        text,
  emoji       text default '✈️',
  photo_url   text,
  trip_type   text default 'visited',
  lat         numeric(9,6) not null,
  lng         numeric(9,6) not null,
  created_at  timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.trips enable row level security;

-- Elimina policy esistenti prima di ricrearle (idempotente)
drop policy if exists "Utenti vedono i propri viaggi"     on public.trips;
drop policy if exists "Chiunque può leggere i viaggi"     on public.trips;
drop policy if exists "Utenti inseriscono i propri viaggi" on public.trips;
drop policy if exists "Utenti eliminano i propri viaggi"  on public.trips;

-- SELECT pubblico: la mappa è visibile senza login
create policy "Chiunque può leggere i viaggi"
  on public.trips for select
  using (true);

create policy "Utenti inseriscono i propri viaggi"
  on public.trips for insert
  with check (auth.uid() = user_id);

create policy "Utenti eliminano i propri viaggi"
  on public.trips for delete
  using (auth.uid() = user_id);

-- ── Storage bucket "photos" ───────────────────────────────────────────────────
-- Crea il bucket via dashboard: Storage > New bucket > "photos" > Public
-- Oppure via Management API / psql:
-- insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
-- on conflict do nothing;

-- Storage RLS policies
create policy "Utenti caricano le proprie foto"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Foto pubbliche leggibili"
  on storage.objects for select
  using (bucket_id = 'photos');

-- ── Indici ────────────────────────────────────────────────────────────────────
create index if not exists trips_user_id_idx  on public.trips (user_id);
create index if not exists trips_created_at_idx on public.trips (created_at desc);
