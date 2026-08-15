// PrivacyLens — background service worker
//
// Responsibilities:
//  1. Receive the signed-in user's Firebase ID token from the PrivacyLens
//     web app and cache it.
//  2. Maintain local + production backend configuration.
//  3. Automatically use the local backend when available and fall back to
//     the deployed Render backend when local is unavailable.
//  4. Paint the toolbar badge with the risk score of the last scan.
//  5. Auto-scan pages when enabled.
//  6. Show an in-page PrivacyLens result overlay.

// ---------------------------------------------------------------------------
// Backend configuration
// ---------------------------------------------------------------------------

const LOCAL_API_URL = "http://127.0.0.1:8811";

const PRODUCTION_API_URL =
  "https://privacy-risk-analyzer.onrender.com";

const DEFAULT_SETTINGS = {
  // Preferred backend for local development.
  apiUrl: LOCAL_API_URL,

  // Production fallback backend.
  productionApiUrl: PRODUCTION_API_URL,

  // PrivacyLens web application.
  webAppUrl: "http://localhost:5173",

  preference: "moderate",

  autoScan: true,
};

// ---------------------------------------------------------------------------
// Auto-scan cooldown
// ---------------------------------------------------------------------------

// Don't repeatedly scan the same domain within five minutes.
const SCAN_COOLDOWN_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// Extension installation
// ---------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get(["settings"]);

  if (!stored.settings) {
    await chrome.storage.local.set({
      settings: DEFAULT_SETTINGS,
    });

    return;
  }

  // Upgrade settings from older versions of the extension.
  const updatedSettings = {
    ...DEFAULT_SETTINGS,
    ...stored.settings,
  };

  await chrome.storage.local.set({
    settings: updatedSettings,
  });
});

// ---------------------------------------------------------------------------
// Authentication bridge
// Web app -> Extension
// ---------------------------------------------------------------------------

chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
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
  }
);

// ---------------------------------------------------------------------------
// Badge helper
// Popup -> Background
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (
      message?.type === "SET_BADGE" &&
      typeof message.tabId === "number"
    ) {
      const { tabId, text, color } = message;

      chrome.action.setBadgeText({
        tabId,
        text: text || "",
      });

      if (color) {
        chrome.action.setBadgeBackgroundColor({
          tabId,
          color,
        });
      }

      sendResponse({ ok: true });
    }

    return true;
  }
);

// ---------------------------------------------------------------------------
// Auto-scan on page load
// ---------------------------------------------------------------------------

chrome.tabs.onUpdated.addListener(
  async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") {
      return;
    }

    if (!tab.url || !/^https?:\/\//i.test(tab.url)) {
      return;
    }

    // Only scan the active tab.
    if (!tab.active) {
      return;
    }

    const { settings } =
      await chrome.storage.local.get(["settings"]);

    const effectiveSettings = {
      ...DEFAULT_SETTINGS,
      ...(settings || {}),
    };

    if (effectiveSettings.autoScan === false) {
      return;
    }

    let domain;

    try {
      domain = new URL(tab.url).hostname.replace(
        /^www\./,
        ""
      );
    } catch {
      return;
    }

    // ---------------------------------------------------------
    // Cooldown
    // ---------------------------------------------------------

    const { autoScanCache } =
      await chrome.storage.local.get(["autoScanCache"]);

    const cache = autoScanCache || {};
    const last = cache[domain];

    if (
      last &&
      Date.now() - last < SCAN_COOLDOWN_MS
    ) {
      return;
    }

    cache[domain] = Date.now();

    await chrome.storage.local.set({
      autoScanCache: cache,
    });

    // ---------------------------------------------------------
    // Run scan
    // ---------------------------------------------------------

    try {
      await runAutoScan(
        tabId,
        domain,
        effectiveSettings
      );
    } catch (e) {
      console.error(
        "PrivacyLens auto-scan failed:",
        e
      );

      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: removeOverlay,
        });
      } catch {
        // Page may have navigated away.
      }
    }
  }
);

// ---------------------------------------------------------------------------
// Run automatic scan
// ---------------------------------------------------------------------------

async function runAutoScan(
  tabId,
  domain,
  settings
) {
  // ---------------------------------------------------------
  // Show loading overlay immediately
  // ---------------------------------------------------------

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: injectLoadingOverlay,
    });
  } catch {
    return;
  }

  // ---------------------------------------------------------
  // Get current page text
  // ---------------------------------------------------------

  const getCurrentPageText = async () => {
    const [textResult] =
      await chrome.scripting.executeScript({
        target: { tabId },
        func: () => document.body.innerText,
      });

    return (
      textResult?.result || ""
    ).slice(0, 20000);
  };

  let inputPayload = "";
  let usedLink = false;

  // ---------------------------------------------------------
  // Try to find privacy policy link
  // ---------------------------------------------------------

  const linkResult =
    await chrome.scripting
      .executeScript({
        target: { tabId },
        func: findPolicyLinkInPage,
      })
      .catch((e) => {
        console.warn(
          "PrivacyLens: policy link search failed",
          e
        );

        return null;
      });

  const link =
    linkResult?.[0]?.result || null;

  console.log(
    "PrivacyLens auto-scan: policy link found on",
    domain,
    "->",
    link
  );

  // ---------------------------------------------------------
  // If policy link exists, read that page
  // ---------------------------------------------------------

  if (link) {
    inputPayload = (
      await fetchTextFromUrl(link)
    ).slice(0, 20000);

    console.log(
      "PrivacyLens auto-scan: linked page text length ->",
      inputPayload.length
    );

    usedLink =
      inputPayload.trim().length >= 40;
  }

  // ---------------------------------------------------------
  // Fallback to current page
  // ---------------------------------------------------------

  if (!usedLink) {
    inputPayload =
      await getCurrentPageText();

    console.log(
      "PrivacyLens auto-scan: falling back to current page text, length ->",
      inputPayload.length
    );
  }

  // ---------------------------------------------------------
  // Minimum content requirement
  // ---------------------------------------------------------

  if (inputPayload.trim().length < 40) {
    await safeRemoveOverlay(tabId);
    return;
  }

  // ---------------------------------------------------------
  // Get authentication
  // ---------------------------------------------------------

  const { auth } =
    await chrome.storage.local.get(["auth"]);

  // ---------------------------------------------------------
  // Analyze
  // Local backend is tried first.
  // Render backend is automatic fallback.
  // ---------------------------------------------------------

  let result = await postAnalyze(
    settings,
    domain,
    inputPayload,
    auth
  );

  // ---------------------------------------------------------
  // If linked policy was rejected, retry current page
  // ---------------------------------------------------------

  if (!result.ok && usedLink) {
    const currentPageText =
      await getCurrentPageText();

    console.log(
      "PrivacyLens auto-scan: linked page rejected by backend, retrying with current page text, length ->",
      currentPageText.length
    );

    if (
      currentPageText.trim().length >= 40
    ) {
      result = await postAnalyze(
        settings,
        domain,
        currentPageText,
        auth
      );
    }
  }

  // ---------------------------------------------------------
  // No result
  // ---------------------------------------------------------

  if (!result.ok) {
    console.error(
      "PrivacyLens: analysis failed:",
      result.reason
    );

    await safeRemoveOverlay(tabId);
    return;
  }

  // ---------------------------------------------------------
  // Successful result
  // ---------------------------------------------------------

  const data = result.data;

  const color =
    data.risk_level === "High"
      ? "#EF4444"
      : data.risk_level === "Medium"
      ? "#F59E0B"
      : "#22C55E";

  // Toolbar badge
  chrome.action.setBadgeText({
    tabId,
    text: String(data.risk_score),
  });

  chrome.action.setBadgeBackgroundColor({
    tabId,
    color,
  });

  // ---------------------------------------------------------
  // Show result overlay
  // ---------------------------------------------------------

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: injectOverlay,
      args: [data, domain],
    });
  } catch {
    // Page may have navigated away.
  }
}

// ---------------------------------------------------------------------------
// Remove overlay safely
// ---------------------------------------------------------------------------

async function safeRemoveOverlay(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: removeOverlay,
    });
  } catch {
    // Page may already be gone.
  }
}

// ---------------------------------------------------------------------------
// API request
//
// IMPORTANT:
// Local backend is attempted first.
// If unavailable, Render production backend is attempted automatically.
// ---------------------------------------------------------------------------

async function postAnalyze(
  settings,
  domain,
  inputPayload,
  auth
) {
  const headers = {};

  if (auth?.token) {
    headers.Authorization =
      `Bearer ${auth.token}`;
  }

  const apiUrls = [
    settings.apiUrl ||
      LOCAL_API_URL,

    settings.productionApiUrl ||
      PRODUCTION_API_URL,
  ];

  // Remove duplicate URLs.
  const uniqueApiUrls = [
    ...new Set(apiUrls),
  ];

  for (const apiUrl of uniqueApiUrls) {
    const controller =
      new AbortController();

    const timer = setTimeout(
      () => controller.abort(),
      30000
    );

    try {
      console.log(
        "PrivacyLens: trying backend ->",
        apiUrl
      );

      // Create a fresh FormData object for
      // every backend attempt.
      const formData = new FormData();

      formData.append(
        "policy_name",
        domain
      );

      formData.append(
        "input",
        inputPayload
      );

      formData.append(
        "preference",
        settings.preference ||
          "moderate"
      );

      const res = await fetch(
        `${apiUrl}/api/analyze`,
        {
          method: "POST",
          headers,
          body: formData,
          signal: controller.signal,
        }
      );

      // Try next backend if HTTP error.
      if (!res.ok) {
        console.warn(
          `PrivacyLens: ${apiUrl} returned HTTP ${res.status}`
        );

        continue;
      }

      const data =
        await res.json();

      // Backend returned an application error.
      if (data.error) {
        console.warn(
          "PrivacyLens backend error:",
          data.error
        );

        continue;
      }

      console.log(
        "PrivacyLens: analysis successful ->",
        apiUrl
      );

      // Remember which backend worked.
      await chrome.storage.local.set({
        activeApiUrl: apiUrl,
      });

      return {
        ok: true,
        data,
      };
    } catch (error) {
      console.warn(
        "PrivacyLens: backend unavailable ->",
        apiUrl
      );
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    ok: false,
    reason: "NETWORK_ERROR",
  };
}

// ---------------------------------------------------------------------------
// Linked policy page timeout
// ---------------------------------------------------------------------------

const LINKED_TAB_LOAD_TIMEOUT_MS = 8000;

// ---------------------------------------------------------------------------
// Fetch text from linked policy URL
// ---------------------------------------------------------------------------

async function fetchTextFromUrl(url) {
  if (!url) {
    return "";
  }

  let tab;

  try {
    // Open background tab.
    tab = await chrome.tabs.create({
      url,
      active: false,
    });

    // Wait for page load.
    await new Promise(
      (resolve, reject) => {
        const timer =
          setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(
              listener
            );

            reject(
              new Error(
                "LINKED_PAGE_TIMEOUT"
              )
            );
          },
          LINKED_TAB_LOAD_TIMEOUT_MS
        );

        function listener(
          updatedTabId,
          info
        ) {
          if (
            updatedTabId === tab.id &&
            info.status === "complete"
          ) {
            clearTimeout(timer);

            chrome.tabs.onUpdated.removeListener(
              listener
            );

            resolve();
          }
        }

        chrome.tabs.onUpdated.addListener(
          listener
        );
      }
    );

    // Extract text.
    const [result] =
      await chrome.scripting.executeScript({
        target: {
          tabId: tab.id,
        },
        func: () =>
          document.body.innerText,
      });

    return result?.result || "";
  } catch {
    return "";
  } finally {
    // Always close temporary tab.
    if (tab?.id) {
      try {
        await chrome.tabs.remove(
          tab.id
        );
      } catch {
        // Already closed.
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Find privacy policy / terms / cookie link
// ---------------------------------------------------------------------------

function findPolicyLinkInPage() {
  const KEYWORD_GROUPS = [
    {
      key: "privacy",

      re: /privacy/i,

      canonical:
        /^privacy(\s+(policy|notice|statement))?$/i,
    },

    {
      key: "terms",

      re: /terms|conditions/i,

      canonical:
        /^(terms(\s+of\s+(use|service))?|terms\s*(&|and)\s*conditions)$/i,
    },

    {
      key: "cookies",

      re: /cookie/i,

      canonical:
        /^cookies?(\s+(policy|notice))?$/i,
    },
  ];

  const currentHost =
    window.location.hostname;

  const sameDomain = {};
  const crossDomain = {};

  const anchors =
    Array.from(
      document.querySelectorAll(
        "a[href]"
      )
    );

  for (const a of anchors) {
    const text =
      (a.textContent || "").trim();

    const href =
      a.href || "";

    if (!href) {
      continue;
    }

    let host;

    try {
      host =
        new URL(
          href,
          window.location.href
        ).hostname;
    } catch {
      host = "";
    }

    const bucket =
      host === currentHost
        ? sameDomain
        : crossDomain;

    for (const {
      key,
      re,
      canonical,
    } of KEYWORD_GROUPS) {
      if (
        !re.test(text) &&
        !re.test(href)
      ) {
        continue;
      }

      const isCanonical =
        canonical.test(text);

      const existing =
        bucket[key];

      if (
        !existing ||
        (isCanonical &&
          !existing.canonical)
      ) {
        bucket[key] = {
          href,
          canonical:
            isCanonical,
        };
      }
    }
  }

  const pick = (
    bucket,
    key
  ) =>
    bucket[key]?.href;

  return (
    pick(
      sameDomain,
      "privacy"
    ) ||
    pick(
      sameDomain,
      "terms"
    ) ||
    pick(
      sameDomain,
      "cookies"
    ) ||
    pick(
      crossDomain,
      "privacy"
    ) ||
    pick(
      crossDomain,
      "terms"
    ) ||
    pick(
      crossDomain,
      "cookies"
    ) ||
    null
  );
}

// ---------------------------------------------------------------------------
// Remove result overlay
// ---------------------------------------------------------------------------

function removeOverlay() {
  document
    .getElementById(
      "privacylens-overlay-host"
    )
    ?.remove();
}

// ---------------------------------------------------------------------------
// Loading overlay
// ---------------------------------------------------------------------------

function injectLoadingOverlay() {
  const getOverlayShadowRoot =
    () => {
      let host =
        document.getElementById(
          "privacylens-overlay-host"
        );

      if (!host) {
        host =
          document.createElement(
            "div"
          );

        host.id =
          "privacylens-overlay-host";

        host.style.cssText =
          "position:fixed;bottom:20px;right:20px;z-index:2147483647;";

        document.documentElement.appendChild(
          host
        );
      }

      return {
        host,
        shadow:
          host.shadowRoot ||
          host.attachShadow({
            mode: "open",
          }),
      };
    };

  const { shadow } =
    getOverlayShadowRoot();

  shadow.innerHTML = `
    <style>
      :host {
        all: initial;
      }

      .card {
        font-family:
          -apple-system,
          "Segoe UI",
          sans-serif;

        display: flex;
        align-items: center;
        gap: 10px;

        width: 200px;

        background: #0f1523;
        color: #f8fafc;

        border-radius: 16px;
        padding: 12px 14px;

        box-shadow:
          0 20px 50px -10px
          rgba(0,0,0,0.6);

        border:
          1px solid
          rgba(255,255,255,0.08);

        box-sizing: border-box;

        animation:
          pl-slidein
          0.2s ease;
      }

      @keyframes pl-slidein {
        from {
          opacity: 0;
          transform:
            translateY(12px);
        }

        to {
          opacity: 1;
          transform:
            translateY(0);
        }
      }

      .spinner {
        width: 15px;
        height: 15px;

        border-radius: 999px;

        flex-shrink: 0;

        border:
          2px solid
          rgba(255,255,255,0.15);

        border-top-color:
          #8B5CF6;

        animation:
          pl-spin
          0.7s linear infinite;
      }

      @keyframes pl-spin {
        to {
          transform:
            rotate(360deg);
        }
      }

      .label {
        font-size: 12px;
        font-weight: 600;
      }
    </style>

    <div class="card">
      <div class="spinner"></div>

      <span class="label">
        PrivacyLens scanning…
      </span>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Result overlay
// ---------------------------------------------------------------------------

function injectOverlay(
  data,
  domain
) {
  const getOverlayShadowRoot =
    () => {
      let host =
        document.getElementById(
          "privacylens-overlay-host"
        );

      if (!host) {
        host =
          document.createElement(
            "div"
          );

        host.id =
          "privacylens-overlay-host";

        host.style.cssText =
          "position:fixed;bottom:20px;right:20px;z-index:2147483647;";

        document.documentElement.appendChild(
          host
        );
      }

      return {
        host,
        shadow:
          host.shadowRoot ||
          host.attachShadow({
            mode: "open",
          }),
      };
    };

  const {
    host,
    shadow,
  } =
    getOverlayShadowRoot();

  // ---------------------------------------------------------
  // Risk score
  // ---------------------------------------------------------

  const score =
    Math.max(
      0,
      Math.min(
        100,
        data.risk_score
      )
    );

  const level =
    score >= 70
      ? "High Risk"
      : score >= 40
      ? "Moderate Risk"
      : "Low Risk";

  const color =
    score >= 70
      ? "#EF4444"
      : score >= 40
      ? "#F59E0B"
      : "#22C55E";

  // ---------------------------------------------------------
  // Top findings
  // ---------------------------------------------------------

  const topFindings =
    (data.findings || [])
      .filter(
        (f) =>
          f.severity ===
            "critical" ||
          f.severity ===
            "severe"
      )
      .slice(0, 2);

  // ---------------------------------------------------------
  // Escape HTML
  // ---------------------------------------------------------

  const escapeHtml =
    (str) =>
      String(str)
        .replace(
          /&/g,
          "&amp;"
        )
        .replace(
          /</g,
          "&lt;"
        )
        .replace(
          />/g,
          "&gt;"
        );

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  shadow.innerHTML = `
    <style>
      :host {
        all: initial;
      }

      .card {
        font-family:
          -apple-system,
          "Segoe UI",
          sans-serif;

        width: 260px;

        background:
          #0f1523;

        color:
          #f8fafc;

        border-radius:
          16px;

        padding:
          14px;

        box-shadow:
          0 20px 50px -10px
          rgba(0,0,0,0.6);

        border:
          1px solid
          rgba(255,255,255,0.08);

        animation:
          pl-slidein
          0.25s ease;

        box-sizing:
          border-box;
      }

      @keyframes pl-slidein {
        from {
          opacity: 0;
          transform:
            translateY(12px);
        }

        to {
          opacity: 1;
          transform:
            translateY(0);
        }
      }

      .head {
        display:
          flex;

        justify-content:
          space-between;

        align-items:
          center;

        margin-bottom:
          8px;
      }

      .title {
        font-size:
          12px;

        font-weight:
          600;
      }

      .close {
        cursor:
          pointer;

        background:
          rgba(255,255,255,0.08);

        border:
          none;

        color:
          #94a3b8;

        width:
          20px;

        height:
          20px;

        border-radius:
          999px;

        font-size:
          12px;
      }

      .sub {
        font-size:
          10px;

        color:
          #94a3b8;

        margin-bottom:
          8px;
      }

      .score-row {
        display:
          flex;

        align-items:
          center;

        gap:
          10px;

        margin-bottom:
          8px;
      }

      .score {
        font-size:
          22px;

        font-weight:
          800;

        color:
          ${color};
      }

      .level {
        font-size:
          12px;

        font-weight:
          600;

        color:
          ${color};
      }

      .finding {
        font-size:
          11px;

        color:
          #e2e8f0;

        margin-bottom:
          4px;

        padding-left:
          10px;

        position:
          relative;
      }

      .finding:before {
        content:
          "";

        position:
          absolute;

        left:
          0;

        top:
          5px;

        width:
          5px;

        height:
          5px;

        border-radius:
          999px;

        background:
          ${color};
      }
    </style>

    <div class="card">

      <div class="head">
        <span class="title">
          🔍 PrivacyLens
        </span>

        <button class="close">
          ✕
        </button>
      </div>

      <div class="sub">
        Scanned this page on
        ${escapeHtml(domain)}
      </div>

      <div class="score-row">
        <span class="score">
          ${score}
        </span>

        <span class="level">
          ${level}
        </span>
      </div>

      ${topFindings
        .map(
          (f) =>
            `<div class="finding">${escapeHtml(
              f.label
            )}</div>`
        )
        .join("")}

    </div>
  `;

  // ---------------------------------------------------------
  // Close button
  // ---------------------------------------------------------

  shadow
    .querySelector(
      ".close"
    )
    .addEventListener(
      "click",
      () => host.remove()
    );

  // ---------------------------------------------------------
  // Auto-close after 15 seconds
  // ---------------------------------------------------------

  setTimeout(() => {
    if (host.parentNode) {
      host.remove();
    }
  }, 15000);
}