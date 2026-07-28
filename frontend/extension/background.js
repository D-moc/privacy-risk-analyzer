// PrivacyLens — background service worker
// Responsibilities:
//  1. Receive the signed-in user's Firebase ID token from the PrivacyLens
//     web app (sent via chrome.runtime.sendMessage from an allowed origin,
//     see "externally_connectable" in manifest.json) and cache it so the
//     popup can attach scans to the user's account/history.
//  2. Set sensible defaults in chrome.storage on first install.
//  3. Paint the toolbar badge with the risk score/colour of the last scan
//     for a given tab.
//  4. Auto-scan: when "autoScan" is on, automatically analyze a site the
//     moment its page finishes loading — no click on the toolbar icon
//     needed — and show a small on-page result card. Chrome extensions
//     cannot force-open their own toolbar popup without a user gesture
//     (hard platform restriction), so an injected in-page overlay is the
//     closest equivalent to "pop up on screen automatically."

const DEFAULT_SETTINGS = {
  apiUrl: "http://127.0.0.1:8811",
  webAppUrl: "http://localhost:5173",
  preference: "moderate",
  autoScan: true,
};

// Don't re-scan the same domain more than once per cooldown window, even
// if the user visits many pages on it back to back. Kept short (rather
// than e.g. 30 min) after real testing showed a long cooldown looks
// exactly like "the popup randomly doesn't show" when reloading the same
// site to check something — it was silently (and correctly) skipping.
const SCAN_COOLDOWN_MS = 5 * 60 * 1000;

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get(["settings"]);
  if (!stored.settings) {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
  }
});

// --- Auth bridge: web app -> extension -------------------------------
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (!message || message.source !== "privacylens-web") {
    return;
  }

  if (message.type === "AUTH_TOKEN") {
    chrome.storage.local.set({
      auth: {
        token: message.token || null,
        email: message.email || null,
        name: message.name || null,
        updatedAt: Date.now(),
      },
    });
    sendResponse({ ok: true });
  }

  if (message.type === "AUTH_LOGOUT") {
    chrome.storage.local.remove("auth");
    sendResponse({ ok: true });
  }

  return true;
});

// --- Badge helper: popup -> background --------------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SET_BADGE" && typeof message.tabId === "number") {
    const { tabId, text, color } = message;
    chrome.action.setBadgeText({ tabId, text: text || "" });
    if (color) {
      chrome.action.setBadgeBackgroundColor({ tabId, color });
    }
    sendResponse({ ok: true });
  }
  return true;
});

// --- Auto-scan on page load --------------------------------------------
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;
  if (!tab.url || !/^https?:\/\//i.test(tab.url)) return;

  // Real bug this avoids: fetchTextFromUrl() (used by both this file's
  // own runAutoScan AND the popup's scan()) opens a REAL background tab
  // to read a linked page's text — that tab reaching "complete" fires
  // this exact listener again, since chrome.tabs.onUpdated is global and
  // doesn't know or care which code created the tab. Without this check,
  // that hidden tab gets auto-scanned too, which can itself follow
  // another link into another hidden tab, and so on — showing up as the
  // extension "searching forever" with no result ever landing. Auto-scan
  // is only meant for pages the user is actually looking at anyway, so
  // skipping inactive tabs is correct, not just a workaround.
  if (!tab.active) return;

  const { settings } = await chrome.storage.local.get(["settings"]);
  const effectiveSettings = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  if (effectiveSettings.autoScan === false) return;

  let domain;
  try {
    domain = new URL(tab.url).hostname.replace(/^www\./, "");
  } catch {
    return;
  }

  const { autoScanCache } = await chrome.storage.local.get(["autoScanCache"]);
  const cache = autoScanCache || {};
  const last = cache[domain];
  if (last && Date.now() - last < SCAN_COOLDOWN_MS) return;

  cache[domain] = Date.now();
  await chrome.storage.local.set({ autoScanCache: cache });

  try {
    await runAutoScan(tabId, domain, effectiveSettings);
  } catch (e) {
    console.error("PrivacyLens auto-scan failed:", e);
    try {
      await chrome.scripting.executeScript({ target: { tabId }, func: removeOverlay });
    } catch {
      // page already navigated away — nothing to clean up
    }
  }
});

async function runAutoScan(tabId, domain, settings) {
  // Show feedback immediately — this used to wait until the whole
  // backend call (which can take several seconds) finished before
  // showing anything at all, which read as "the popup isn't working."
  try {
    await chrome.scripting.executeScript({ target: { tabId }, func: injectLoadingOverlay });
  } catch {
    return; // page isn't scriptable at all (chrome://, web store, etc.)
  }

  // Auto-scan fires on every page load of every new domain, not a
  // deliberate click — so the current page is much less likely to
  // already be the actual privacy policy (this is exactly what a real
  // false-positive investigation found: a homepage got scanned instead
  // of the policy, and every disclosure check correctly-but-uselessly
  // flagged "doesn't mention X"). Look for a real privacy/terms/cookies
  // link FIRST, cheap and synchronous (no network), before falling back
  // to the current page's own text.
  //
  // An earlier version of this same idea was removed for being "slow,
  // failure-prone" — but that version fetched the linked URL
  // server-side via fetcher.py, which real sites 403 as anti-bot
  // protection (confirmed on zepto.com/infosys.com). This version opens
  // a real background browser tab instead, which isn't subject to that
  // blocking, and always closes it in a finally block either way.
  const getCurrentPageText = async () => {
    const [textResult] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => document.body.innerText,
    });
    return (textResult?.result || "").slice(0, 20000);
  };

  let inputPayload = "";
  let usedLink = false;

  const linkResult = await chrome.scripting.executeScript({
    target: { tabId },
    func: findPolicyLinkInPage,
  }).catch((e) => { console.warn("PrivacyLens: link search failed", e); return null; });
  const link = linkResult?.[0]?.result || null;
  console.log("PrivacyLens auto-scan: policy link found on", domain, "->", link);

  if (link) {
    inputPayload = (await fetchTextFromUrl(link)).slice(0, 20000);
    console.log("PrivacyLens auto-scan: linked page text length ->", inputPayload.length);
    usedLink = inputPayload.trim().length >= 40;
  }

  if (!usedLink) {
    inputPayload = await getCurrentPageText();
    console.log("PrivacyLens auto-scan: falling back to current page text, length ->", inputPayload.length);
  }

  if (inputPayload.trim().length < 40) {
    await safeRemoveOverlay(tabId);
    return;
  }

  const { auth } = await chrome.storage.local.get(["auth"]);

  let result = await postAnalyze(settings, domain, inputPayload, auth);

  // Real gap this closes: the linked page's text can come back LONG
  // ENOUGH but still get rejected by the backend as NOT_A_POLICY (e.g.
  // a wrong/third-party link match, same class of bug the same-domain
  // fix above targets) — previously this just gave up silently instead
  // of retrying with the current page's own text, the one case that's
  // genuinely recoverable rather than "nothing worked at all."
  if (!result.ok && usedLink) {
    const currentPageText = await getCurrentPageText();
    console.log("PrivacyLens auto-scan: linked page rejected by backend, retrying with current page text, length ->", currentPageText.length);
    if (currentPageText.trim().length >= 40) {
      result = await postAnalyze(settings, domain, currentPageText, auth);
    }
  }

  if (!result.ok) {
    await safeRemoveOverlay(tabId);
    return;
  }

  const data = result.data;
  const color =
    data.risk_level === "High" ? "#EF4444" : data.risk_level === "Medium" ? "#F59E0B" : "#22C55E";
  chrome.action.setBadgeText({ tabId, text: String(data.risk_score) });
  chrome.action.setBadgeBackgroundColor({ tabId, color });

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: injectOverlay,
      args: [data, domain],
    });
  } catch {
    // page navigated away or became unscriptable before results arrived
  }
}

async function safeRemoveOverlay(tabId) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, func: removeOverlay });
  } catch {
    // page already navigated away — nothing to clean up
  }
}

// Extracted so runAutoScan can retry with different input text (current
// page vs linked page) without duplicating the fetch/parse plumbing.
async function postAnalyze(settings, domain, inputPayload, auth) {
  const formData = new FormData();
  formData.append("policy_name", domain);
  formData.append("input", inputPayload);
  formData.append("preference", settings.preference || "moderate");

  const headers = {};
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  let res;
  try {
    res = await fetch(`${settings.apiUrl}/api/analyze`, {
      method: "POST",
      headers,
      body: formData,
      signal: controller.signal,
    });
  } catch {
    return { ok: false, reason: "NETWORK_ERROR" };
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) return { ok: false, reason: "HTTP_ERROR" };
  const data = await res.json();
  if (data.error) return { ok: false, reason: data.error };
  return { ok: true, data };
}

const LINKED_TAB_LOAD_TIMEOUT_MS = 8000;

// Opens a real background tab instead of fetching server-side — see the
// comment in runAutoScan above for why. Always closes the tab, even on
// timeout/failure, so a failed lookup never leaves a stray tab open.
// Duplicated from extension-src/src/lib/chrome.js's identical function
// — this file is a plain, non-bundled script and can't import from it.
async function fetchTextFromUrl(url) {
  if (!url) return "";

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

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText,
    });
    return result?.result || "";
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

// The functions below run INSIDE the visited page — each must be fully
// self-contained (no references to anything outside its own
// parameters/body), since chrome.scripting.executeScript serializes and
// re-invokes them there.

// Duplicated from extension-src/src/lib/chrome.js's identical function
// — this file is a plain, non-bundled script and can't import from it.
// Priority privacy > terms > cookies — privacy is the actual value
// proposition, the other two are fallbacks for sites with no dedicated
// privacy policy link.
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

function removeOverlay() {
  document.getElementById("privacylens-overlay-host")?.remove();
}

function injectLoadingOverlay() {
  const getOverlayShadowRoot = () => {
    let host = document.getElementById("privacylens-overlay-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "privacylens-overlay-host";
      host.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:2147483647;";
      document.documentElement.appendChild(host);
    }
    return { host, shadow: host.shadowRoot || host.attachShadow({ mode: "open" }) };
  };
  const { shadow } = getOverlayShadowRoot();

  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .card {
        font-family: -apple-system, "Segoe UI", sans-serif;
        display: flex; align-items: center; gap: 10px;
        width: 200px; background: #0f1523; color: #f8fafc;
        border-radius: 16px; padding: 12px 14px;
        box-shadow: 0 20px 50px -10px rgba(0,0,0,0.6);
        border: 1px solid rgba(255,255,255,0.08);
        box-sizing: border-box;
        animation: pl-slidein 0.2s ease;
      }
      @keyframes pl-slidein {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .spinner {
        width: 15px; height: 15px; border-radius: 999px; flex-shrink: 0;
        border: 2px solid rgba(255,255,255,0.15); border-top-color: #8B5CF6;
        animation: pl-spin 0.7s linear infinite;
      }
      @keyframes pl-spin { to { transform: rotate(360deg); } }
      .label { font-size: 12px; font-weight: 600; }
    </style>
    <div class="card"><div class="spinner"></div><span class="label">PrivacyLens scanning…</span></div>
  `;
}

function injectOverlay(data, domain) {
  const getOverlayShadowRoot = () => {
    let host = document.getElementById("privacylens-overlay-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "privacylens-overlay-host";
      host.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:2147483647;";
      document.documentElement.appendChild(host);
    }
    return { host, shadow: host.shadowRoot || host.attachShadow({ mode: "open" }) };
  };
  const { host, shadow } = getOverlayShadowRoot();

  // Same convention as the toolbar badge above and the website's
  // RiskMeter.jsx — the raw risk score, higher means riskier. This used
  // to invert into a "privacy score" (100 - risk_score), which disagreed
  // with the badge showing the raw score for the exact same scan.
  const score = Math.max(0, Math.min(100, data.risk_score));
  const level = score >= 70 ? "High Risk" : score >= 40 ? "Moderate Risk" : "Low Risk";
  const color = score >= 70 ? "#EF4444" : score >= 40 ? "#F59E0B" : "#22C55E";
  const topFindings = (data.findings || [])
    .filter((f) => f.severity === "critical" || f.severity === "severe")
    .slice(0, 2);

  const escapeHtml = (str) =>
    String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .card {
        font-family: -apple-system, "Segoe UI", sans-serif;
        width: 260px;
        background: #0f1523;
        color: #f8fafc;
        border-radius: 16px;
        padding: 14px;
        box-shadow: 0 20px 50px -10px rgba(0,0,0,0.6);
        border: 1px solid rgba(255,255,255,0.08);
        animation: pl-slidein 0.25s ease;
        box-sizing: border-box;
      }
      @keyframes pl-slidein {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .title { font-size: 12px; font-weight: 600; }
      .close {
        cursor: pointer; background: rgba(255,255,255,0.08); border: none;
        color: #94a3b8; width: 20px; height: 20px; border-radius: 999px; font-size: 12px;
      }
      .sub { font-size: 10px; color: #94a3b8; margin-bottom: 8px; }
      .score-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
      .score { font-size: 22px; font-weight: 800; color: ${color}; }
      .level { font-size: 12px; font-weight: 600; color: ${color}; }
      .finding {
        font-size: 11px; color: #e2e8f0; margin-bottom: 4px; padding-left: 10px; position: relative;
      }
      .finding:before {
        content: ""; position: absolute; left: 0; top: 5px; width: 5px; height: 5px;
        border-radius: 999px; background: ${color};
      }
    </style>
    <div class="card">
      <div class="head">
        <span class="title">🔍 PrivacyLens</span>
        <button class="close">✕</button>
      </div>
      <div class="sub">Scanned this page on ${escapeHtml(domain)}</div>
      <div class="score-row">
        <span class="score">${score}</span>
        <span class="level">${level}</span>
      </div>
      ${topFindings.map((f) => `<div class="finding">${escapeHtml(f.label)}</div>`).join("")}
    </div>
  `;

  shadow.querySelector(".close").addEventListener("click", () => host.remove());
  setTimeout(() => {
    if (host.parentNode) host.remove();
  }, 15000);
}
