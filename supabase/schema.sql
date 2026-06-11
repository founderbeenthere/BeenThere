-- BeenThere – schema Supabase
-- Esegui questo SQL nel tuo progetto Supabase > SQL Editor

create table if not exists public.trips (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  place_name  text not null,
  visited_at  date,
  note        text,
  emoji       text default '✈️',
  photo_url   text,
  map_x       numeric(6,3) not null,  -- % orizzontale sulla mappa (0-100)
  map_y       numeric(6,3) not null,  -- % verticale sulla mappa (0-100)
  rotation    integer default 0,      -- rotazione polaroid in gradi (-10 a +10)
  created_at  timestamptz default now()
);

-- Row Level Security: ogni utente vede solo i propri viaggi
alter table public.trips enable row level security;

create policy "Utenti vedono i propri viaggi"
  on public.trips for select
  using (auth.uid() = user_id);

create policy "Utenti inseriscono i propri viaggi"
  on public.trips for insert
  with check (auth.uid() = user_id);

create policy "Utenti eliminano i propri viaggi"
  on public.trips for delete
  using (auth.uid() = user_id);

-- Indice per query veloci per utente
create index if not exists trips_user_id_idx on public.trips (user_id);
create index if not exists trips_visited_at_idx on public.trips (visited_at desc);
