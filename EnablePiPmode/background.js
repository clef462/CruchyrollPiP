// Service worker: adds an extension context menu item
// and sends a toggle request to the active tab.

const MENU_ID = "pip_toggle";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Toggle Picture-in-Picture",
    contexts: ["action"] // right-click the extension icon
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID) return;
  if (!tab || !tab.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: "PIP_TOGGLE"
    });
  } catch (err) {
    // Content script may not be injected yet or page blocks messaging
    console.warn("[PiP] Unable to message tab:", err?.message || err);
  }
});
