# Spaces Backend

Supabase is used for Auth and Realtime sync only. There are no AI service endpoints in Spaces v2.

## Required Client Env

Set these in `packages/extension/.env.local` and `packages/desktop/.env.local`:

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-public-anon-key"
```

The anon key is public client configuration. Do not commit service role keys or other secrets.

## Apply Schema

Run the SQL in `supabase/migrations/0001_spaces_sync.sql` against your Supabase project. It creates:

- `public.spaces`
- row-level security policies scoped to `auth.uid()`
- Realtime publication membership for the table

The client stores full local-first `Space` payloads as JSONB and reconciles by `updatedAt`.
