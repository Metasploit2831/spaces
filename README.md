# Spaces

Chrome extension workspace for "Drag anything. Paste anything. Group anything."

## Packages

- `packages/extension` - Manifest V3 Chrome extension built with React, Vite, Tailwind, Supabase, and TypeScript.
- `packages/ui` - Shared design tokens and reusable React gallery components.
- `packages/desktop` - Tauri Mac app shell rendering the shared React UI.
- `packages/backend` - Supabase schema and setup notes for Auth + Realtime sync.

## Build Extension

```bash
npx pnpm@10.13.1 install
npx pnpm@10.13.1 build:all
```

Then load the extension in Chrome:

1. Open `chrome://extensions`.
2. Turn on `Developer mode`.
3. Click `Load unpacked`.
4. Select `packages/extension/dist`.
5. Open or refresh any normal webpage.

Chrome does not run content scripts on internal pages like `chrome://extensions`, the Chrome Web Store, or some new-tab pages.

## Mac App

```bash
npx pnpm@10.13.1 desktop:dev
npx pnpm@10.13.1 tauri:build
```

Native Tauri builds require Rust/Cargo to be installed and available on `PATH`.

## Sync

Create `.env.local` files in `packages/extension` and `packages/desktop`:

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-public-anon-key"
```

Apply the SQL in `packages/backend/supabase/migrations/0001_spaces_sync.sql` to enable Auth-scoped local-first sync.
