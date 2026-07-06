chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ spacesInstalledAt: Date.now() });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url || /^chrome:|^edge:|^about:|^chrome-extension:/.test(tab.url)) {
    return;
  }

  const background = chrome.runtime.getManifest().background;
  const serviceWorker = background && "service_worker" in background ? background.service_worker : "";
  const contentScriptFile = serviceWorker.startsWith("dist/")
    ? "dist/assets/contentScript.js"
    : "assets/contentScript.js";

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [contentScriptFile]
    });
  } catch (error) {
    console.error("Unable to open Spaces on this page", error);
  }
});
