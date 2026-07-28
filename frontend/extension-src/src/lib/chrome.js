// Thin wrappers around chrome.* APIs, guarded so this also runs fine
// when the built popup is opened directly in a normal tab for preview
// (outside the real extension context).

export const HAS_CHROME =
  typeof chrome !== "undefined" && !!chrome.storage && !!chrome.tabs;

export const DEFAULT_SETTINGS = {
  apiUrl: "http://127.0.0.1:8811",
  webAppUrl: "http://localhost:5173",
  preference: "moderate",
  theme: "dark",
  autoScan: true,
};

// A previous default pointed at port 8000, which turned out to be
// blocked on at least one real machine. Settings already saved to
// chrome.storage persist across extension updates (only *missing* keys
// fall back to new defaults), so anyone who'd used the extension before
// this change would otherwise be silently stuck on the old, broken URL
// forever. Migrate that one specific old value automatically.
const OLD_DEFAULT_API_URL = "http://127.0.0.1:8000";

export async function loadSettings() {
  if (!HAS_CHROME) return { ...DEFAULT_SETTINGS };
  const { settings } = await chrome.storage.local.get(["settings"]);
  const merged = settings ? { ...DEFAULT_SETTINGS, ...settings } : { ...DEFAULT_SETTINGS };

  if (merged.apiUrl === OLD_DEFAULT_API_URL) {
    merged.apiUrl = DEFAULT_SETTINGS.apiUrl;
    await saveSettings(merged);
  }

  return merged;
}

export async function saveSettings(settings) {
  if (!HAS_CHROME) return;
  await chrome.storage.local.set({ settings });
}

export async function loadAuth() {
  if (!HAS_CHROME) return null;
  const { auth } = await chrome.storage.local.get(["auth"]);
  return auth && auth.token ? auth : null;
}

export function isScannableUrl(url) {
  return /^https?:\/\//i.test(url || "");
}

export async function loadActiveTab() {
  if (!HAS_CHROME) {
    return {
      id: 1,
      domain: "example.com",
      url: "https://example.com/privacy",
      favicon: "",
    };
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return { id: null, domain: "", url: "", favicon: "" };

  let domain = "";
  try {
    domain = new URL(tab.url).hostname.replace(/^www\./, "");
  } catch {
    domain = tab.url || "";
  }

  return {
    id: tab.id,
    domain,
    url: tab.url || "",
    favicon: tab.favIconUrl || "",
  };
}

export async function getPageText(tabId) {
  if (!HAS_CHROME) {
    return "This is a sample privacy policy for preview purposes. We collect your email address and location data. We share information with advertising partners and third parties. We use cookies and tracking technologies. We retain data indefinitely.";
  }
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => document.body.innerText,
  });
  return result?.result || "";
}

export function setBadge(tabId, score, level) {
  if (!HAS_CHROME || typeof tabId !== "number") return;
  const color =
    level === "High" ? "#EF4444" : level === "Medium" ? "#F59E0B" : "#22C55E";
  chrome.runtime.sendMessage({ type: "SET_BADGE", tabId, text: String(score), color });
}

export function openWebApp(webAppUrl, path) {
  const url = `${webAppUrl}${path}`;
  if (HAS_CHROME) chrome.tabs.create({ url });
  else window.open(url, "_blank");
}

// Self-contained on purpose (same constraint as every other
// executeScript injection in this codebase: the func is serialized and
// re-run inside the target page, so it can't close over anything
// outside its own body). Priority privacy > terms > cookies — privacy
// is the actual value proposition, the other two are fallbacks for
// sites with no dedicated privacy policy link.
//
// Same-domain candidates always outrank cross-domain ones, regardless
// of which keyword group matched first. Real bug this fixes: Titan's
// homepage has a "Privacy Notice"-labeled link that points to
// policies.google.com/privacy (an embedded reCAPTCHA notice, not the
// site's own policy) — without this, that link wins purely because
// "privacy" beats "terms"/"cookies", even though the site's own real
// cookie policy link (same domain) is right there too.
//
// Within a domain/group bucket, a CANONICAL label (the anchor text is
// just "Privacy Policy"/"Privacy Notice"/etc, nothing else) always
// outranks a merely-matching one, regardless of DOM order. Real bug
// this fixes: openai.com's footer has BOTH "Security & Privacy" (a
// marketing subpage, not the legal document) and "Privacy Policy" (the
// actual one) — both match /privacy/i, but "Security & Privacy" came
// first in DOM order and was winning outright before this fix.
function findPolicyLinkInPage() {
  const KEYWORD_GROUPS = [
    { key: "privacy", re: /privacy/i, canonical: /^privacy(\s+(policy|notice|statement))?$/i },
    { key: "terms", re: /terms|conditions/i, canonical: /^(terms(\s+of\s+(use|service))?|terms\s*(&|and)\s*conditions)$/i },
    { key: "cookies", re: /cookie/i, canonical: /^cookies?(\s+(policy|notice))?$/i },
  ];
  const currentHost = window.location.hostname;
  const sameDomain = {};
  const crossDomain = {};
  const anchors = Array.from(document.querySelectorAll("a[href]"));
  for (const a of anchors) {
    const text = (a.textContent || "").trim();
    const href = a.href || "";
    if (!href) continue;
    let host;
    try {
      host = new URL(href, window.location.href).hostname;
    } catch {
      host = "";
    }
    const bucket = host === currentHost ? sameDomain : crossDomain;
    for (const { key, re, canonical } of KEYWORD_GROUPS) {
      if (!re.test(text) && !re.test(href)) continue;
      const isCanonical = canonical.test(text);
      const existing = bucket[key];
      if (!existing || (isCanonical && !existing.canonical)) {
        bucket[key] = { href, canonical: isCanonical };
      }
    }
  }
  const pick = (bucket, key) => bucket[key]?.href;
  return (
    pick(sameDomain, "privacy") || pick(sameDomain, "terms") || pick(sameDomain, "cookies") ||
    pick(crossDomain, "privacy") || pick(crossDomain, "terms") || pick(crossDomain, "cookies") ||
    null
  );
}

export async function findPolicyLink(tabId) {
  if (!HAS_CHROME) return null;
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: findPolicyLinkInPage,
    });
    return result?.result || null;
  } catch {
    return null;
  }
}

const LINKED_TAB_LOAD_TIMEOUT_MS = 8000;

// Opens a real background tab instead of fetching server-side —
// fetcher.py's plain requests.get() gets 403'd by anti-bot protection
// on real sites (confirmed on zepto.com and infosys.com); a genuine
// browser tab load isn't subject to that same blocking. Always closes
// the tab, even on timeout/failure, so a failed lookup never leaves a
// stray tab open.
export async function fetchTextFromUrl(url) {
  if (!HAS_CHROME || !url) return "";

  let tab;
  try {
    tab = await chrome.tabs.create({ url, active: false });

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        reject(new Error("LINKED_PAGE_TIMEOUT"));
      }, LINKED_TAB_LOAD_TIMEOUT_MS);

      function listener(updatedTabId, info) {
        if (updatedTabId === tab.id && info.status === "complete") {
          clearTimeout(timer);
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      }
      chrome.tabs.onUpdated.addListener(listener);
    });

    return await getPageText(tab.id);
  } catch {
    return "";
  } finally {
    if (tab?.id) {
      try {
        await chrome.tabs.remove(tab.id);
      } catch {
        // tab may already be gone — nothing to clean up
      }
    }
  }
}
