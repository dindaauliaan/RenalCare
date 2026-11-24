-- ============================================================================
-- RenalCare – Migrasi Awal (0001_init.sql)
-- Mencakup: Tabel, Index, Row Level Security (RLS), Policy, dan Trigger Profil
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. TABEL
-- ============================================================================

-- 1.1 Tabel profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  birth_date date,
  sex text check (sex in ('female', 'male')),
  mode text check (mode in ('ckd', 'post_aki')) default 'ckd',
  bp_target_systolic int,
  bp_target_diastolic int,
  created_at timestamptz default now()
);

-- 1.2 Tabel lab_results
create table public.lab_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at date not null,
  creatinine numeric,
  creatinine_unit text default 'mg/dL',
  urea numeric,
  urea_unit text default 'mg/dL (urea)',
  potassium numeric,
  acr numeric,
  acr_unit text default 'mg/g',
  egfr numeric,
  is_acute_illness boolean default false,
  reference_notes text,
  created_at timestamptz default now()
);

-- 1.3 Tabel bp_logs
create table public.bp_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at timestamptz not null,
  systolic int not null,
  diastolic int not null,
  pulse int,
  arm text check (arm in ('left', 'right')),
  position text check (position in ('sitting', 'standing', 'lying')),
  created_at timestamptz default now()
);

-- 1.4 Tabel reminders
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text check (type in ('lab', 'control', 'medication')),
  title text not null,
  remind_at timestamptz not null,
  location text,
  notes text,
  is_done boolean default false
);

-- 1.5 Tabel articles
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  category text,
  summary text,
  body text,
  source text,
  source_url text,
  reviewed_at date,
  reviewer text,
  read_minutes int,
  published boolean default true
);

-- ============================================================================
-- 2. INDEX
-- ============================================================================

create index idx_lab_results_user_measured_at
  on public.lab_results (user_id, measured_at);

create index idx_bp_logs_user_measured_at
  on public.bp_logs (user_id, measured_at);

create index idx_reminders_user_remind_at
  on public.reminders (user_id, remind_at);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.lab_results enable row level security;
alter table public.bp_logs enable row level security;
alter table public.reminders enable row level security;
alter table public.articles enable row level security;

-- 3.1 Policies untuk profiles (select, insert, update milik sendiri)
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- 3.2 Policies untuk lab_results (select, insert, update, delete milik sendiri)
create policy "lab_results_select_own"
  on public.lab_results
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "lab_results_insert_own"
  on public.lab_results
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "lab_results_update_own"
  on public.lab_results
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "lab_results_delete_own"
  on public.lab_results
  for delete
  to authenticated
  using (user_id = auth.uid());

-- 3.3 Policies untuk bp_logs (select, insert, update, delete milik sendiri)
create policy "bp_logs_select_own"
  on public.bp_logs
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "bp_logs_insert_own"
  on public.bp_logs
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "bp_logs_update_own"
  on public.bp_logs
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "bp_logs_delete_own"
  on public.bp_logs
  for delete
  to authenticated
  using (user_id = auth.uid());

-- 3.4 Policies untuk reminders (select, insert, update, delete milik sendiri)
create policy "reminders_select_own"
  on public.reminders
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "reminders_insert_own"
  on public.reminders
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "reminders_update_own"
  on public.reminders
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reminders_delete_own"
  on public.reminders
  for delete
  to authenticated
  using (user_id = auth.uid());

-- 3.5 Policy untuk articles (semua orang boleh select hanya jika published = true;
-- tidak ada policy insert/update/delete sehingga operasi tulis dari klien otomatis ditolak)
create policy "articles_select_published"
  on public.articles
  for select
  to anon, authenticated
  using (published = true);

-- ============================================================================
-- 4. TRIGGER OTOMATIS PEMBUATAN PROFIL SAAT USER BARU MENDAFTAR
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
