# Spaces

Chrome extension workspace for "Drag anything. Paste anything. Group anything."

## Packages

- `packages/extension` - Manifest V3 Chrome extension built with React, Vite, Tailwind, and TypeScript.
- `packages/ui` - Shared design tokens and reusable React UI primitives for the extension and future desktop app.

## Build Extension

```bash
npx pnpm@10.13.1 install
npx pnpm@10.13.1 build
```

Then load the extension in Chrome:

1. Open `chrome://extensions`.
2. Turn on `Developer mode`.
3. Click `Load unpacked`.
4. Select `packages/extension/dist`.
5. Open or refresh any normal webpage.

Chrome does not run content scripts on internal pages like `chrome://extensions`, the Chrome Web Store, or some new-tab pages.
