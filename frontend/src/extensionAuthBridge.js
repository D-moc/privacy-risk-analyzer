import { onIdTokenChanged } from "firebase/auth";
import { auth } from "./firebase";

// The extension announces its own id via a content script (see
// frontend/extension/announce.js + manifest.json's content_scripts),
// setting this attribute on every page load of this site. Reading it
// here means the website never needs a hardcoded extension id, which
// used to break every time the extension was reinstalled/reloaded.
function getExtensionId() {
  return document.documentElement.getAttribute("data-privacylens-extension-id");
}

function sendToExtension(message) {
  try {
    const extensionId = getExtensionId();
    if (extensionId && window.chrome?.runtime?.sendMessage) {
      window.chrome.runtime.sendMessage(extensionId, message);
    }
  } catch {
    // Extension not installed, or Chrome APIs unavailable — safe to ignore.
  }
}

// Keeps the extension's cached auth token fresh. Firebase automatically
// refreshes the id token before it expires, which re-fires this callback.
export function initExtensionAuthBridge() {
  return onIdTokenChanged(auth, async (user) => {
    if (!user) {
      sendToExtension({ source: "privacylens-web", type: "AUTH_LOGOUT" });
      return;
    }

    const token = await user.getIdToken();
    sendToExtension({
      source: "privacylens-web",
      type: "AUTH_TOKEN",
      token,
      email: user.email,
      name: user.displayName,
    });
  });
}
