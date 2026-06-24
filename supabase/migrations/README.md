# Database migrations

Schema changes live here as `<timestamp>_<name>.sql` files, created with
`npx supabase migration new <name>` and applied with `npx supabase db push`
(the full flow is in the repo `CLAUDE.md`). Never edit the Supabase dashboard
directly — these files are the source of truth.

## Row-Level Security is the default, not an add-on

Auth in this template (Supabase + Azure OAuth) gates _who is signed in_; it does
**not** gate _which rows they may read or write_. That is RLS's job. The
authenticated Supabase client runs every query as the signed-in user, so **a
table with RLS disabled is readable and writable by every authenticated user**,
and a forgotten policy is a silent data leak — not an error.

Rule for this codebase: **every table enables RLS in the same migration that
creates it, with explicit policies.** A table with RLS on and no matching policy
denies all access (fail closed), which surfaces the omission immediately instead
of leaking. The server-side route guard in `src/routes/(app)/+layout.server.ts`
is defense in depth on top of this — not a replacement for it.

## Example — a per-user table, RLS-enabled (copy, adapt, delete)

```sql
-- <timestamp>_profiles.sql
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Enable RLS in the same migration that creates the table.
alter table public.profiles enable row level security;

-- Owner-only access. auth.uid() is the signed-in user's id.
create policy "profiles: owner can read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner can update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row when a user first signs in.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```
