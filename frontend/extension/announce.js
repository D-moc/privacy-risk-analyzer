// Runs only on the PrivacyLens website itself (see manifest.json's
// content_scripts.matches) — lets the website discover the extension's
// own ID automatically, so extensionAuthBridge.js never needs a
// hardcoded ID that breaks every time the extension is reinstalled.
document.documentElement.setAttribute("data-privacylens-extension-id", chrome.runtime.id);
