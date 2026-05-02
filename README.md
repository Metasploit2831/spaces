# Spaces

Polished Chrome extension MVP prototype for "Drag anything. Paste anything. Group anything."

## Build Extension

```bash
npm install
npm run build
```

Then load the extension in Chrome:

1. Open `chrome://extensions`.
2. Turn on `Developer mode`.
3. Click `Load unpacked`.
4. Select `/Users/nima/Desktop/Spaces/dist`.
5. Open or refresh any normal webpage. The Spaces sidebar appears on the right.

Important:
- Do not load the repository root folder into Chrome.
- Always load the `dist` folder because that is where the built `manifest.json` and extension assets live.
- If you download the repository ZIP from GitHub, open the extracted folder and then choose its `dist` subfolder in Chrome.

Chrome does not run content scripts on internal pages like `chrome://extensions`, the Chrome Web Store, or some new-tab pages.

## Run Demo Locally

```bash
npm install
npm run dev
```

The demo page renders a realistic webpage with the Spaces sidebar overlaid on the right, plus capture affordances for selected text, images, links, files, and pasted screenshots.

The local demo is still useful for rapid UI development, but the loadable Chrome extension lives in `dist` after `npm run build`.

## MVP Coverage

- Spaces Home with search, saved cards, empty state, add, open, rename, duplicate, and delete.
- Active Space Canvas with editable title, save state, View Canvas modal, toolbar, paste/drop feedback, and local persistence.
- Capture methods for text selection, image/link/media hover affordances, local files, and clipboard screenshots.
- Freeform draggable cards, shift-click multi-select, marquee selection, group, ungroup, group rename, and source metadata.
- `chrome.storage.local` persistence with `localStorage` fallback for prototype/demo environments.
