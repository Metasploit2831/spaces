# Spaces

Polished Chrome extension MVP prototype for "Drag anything. Paste anything. Group anything."

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
5. Open or refresh any normal webpage. The Spaces sidebar appears on the right.

Important:
- The recommended folder to load is `packages/extension/dist`.
- If you change source files, run `npx pnpm@10.13.1 build` before reloading the extension.

Chrome does not run content scripts on internal pages like `chrome://extensions`, the Chrome Web Store, or some new-tab pages.

## Run Demo Locally

```bash
npx pnpm@10.13.1 install
npx pnpm@10.13.1 dev
```

The demo page renders a realistic webpage with the Spaces sidebar overlaid on the right, plus capture affordances for selected text, images, links, files, and pasted screenshots. Saved items appear in a Gatheros-style platform gallery.

The local demo is still useful for rapid UI development, but the loadable Chrome extension lives in `dist` after `npm run build`.

## MVP Coverage

- Spaces Home with search, saved cards, empty state, add, open, rename, duplicate, and delete.
- Active Space Canvas with editable title, save state, View Canvas modal, toolbar, paste/drop feedback, and local persistence.
- Capture methods for text selection, image/link/media hover affordances, local files, and clipboard screenshots.
- Platform detection from source URLs, thumbnail/favicons where available, and source metadata.
- `chrome.storage.local` persistence with `localStorage` fallback for prototype/demo environments, plus optional Supabase sync when configured.
