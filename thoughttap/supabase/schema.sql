create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  couple_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.couples (
  id uuid primary key default uuid_generate_v4(),
  invite_code text unique not null,
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid references public.profiles(id) on delete set null,
  daily_limit int not null default 5,
  created_at timestamptz default now()
);

alter table public.profiles
  add constraint profiles_couple_id_fkey
  foreign key (couple_id) references public.couples(id) on delete set null;

create table if not exists public.thought_taps (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  message text not null default 'remembered you',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.thought_taps enable row level security;

create policy "Users can read own profile" on public.profiles
for select using (auth.uid() = id);

create policy "Users can create own profile" on public.profiles
for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
for update using (auth.uid() = id);

create policy "Users can create couple" on public.couples
for insert with check (auth.uid() = user_a);

create policy "Couple members can read couple" on public.couples
for select using (auth.uid() = user_a or auth.uid() = user_b or user_b is null);

create policy "Invitee can join couple" on public.couples
for update using (user_b is null or auth.uid() = user_a or auth.uid() = user_b)
with check (auth.uid() = user_a or auth.uid() = user_b);

create policy "Couple members can read taps" on public.thought_taps
for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Couple members can create taps" on public.thought_taps
for insert with check (auth.uid() = sender_id);

alter publication supabase_realtime add table public.thought_taps;
