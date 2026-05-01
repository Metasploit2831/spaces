chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ spacesInstalledAt: Date.now() });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url || /^chrome:|^edge:|^about:|^chrome-extension:/.test(tab.url)) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["assets/contentScript.js"],
    });
  } catch (error) {
    console.error("Unable to open Spaces on this page", error);
  }
});
