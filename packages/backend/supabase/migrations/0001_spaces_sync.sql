create table if not exists public.spaces (
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (user_id, space_id)
);

alter table public.spaces enable row level security;

drop policy if exists "Users can read their spaces" on public.spaces;
create policy "Users can read their spaces"
  on public.spaces for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their spaces" on public.spaces;
create policy "Users can insert their spaces"
  on public.spaces for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their spaces" on public.spaces;
create policy "Users can update their spaces"
  on public.spaces for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their spaces" on public.spaces;
create policy "Users can delete their spaces"
  on public.spaces for delete
  using (auth.uid() = user_id);

alter publication supabase_realtime add table public.spaces;
