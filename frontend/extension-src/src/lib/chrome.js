// PrivacyLens Chrome API helpers

export const HAS_CHROME =
  typeof chrome !== "undefined" &&
  !!chrome.storage &&
  !!chrome.tabs;

// Production configuration
export const DEFAULT_SETTINGS = {
  apiUrl: "https://privacy-risk-analyzer.onrender.com",
  webAppUrl: "https://privacy-risk-analyzer.vercel.app",
  preference: "moderate",
  theme: "dark",
  autoScan: true,
};

// Old local URLs that may still exist in
// chrome.storage.local from previous installations.
const OLD_DEFAULT_API_URLS = [
  "http://127.0.0.1:8000",
  "http://127.0.0.1:8811",
  "http://localhost:8000",
  "http://localhost:8811",
];

export async function loadSettings() {
  if (!HAS_CHROME) {
    return { ...DEFAULT_SETTINGS };
  }

  const { settings } =
    await chrome.storage.local.get(["settings"]);

  const merged = settings
    ? {
        ...DEFAULT_SETTINGS,
        ...settings,
      }
    : {
        ...DEFAULT_SETTINGS,
      };

  // Migrate old localhost backend to production.
  if (OLD_DEFAULT_API_URLS.includes(merged.apiUrl)) {
    merged.apiUrl = DEFAULT_SETTINGS.apiUrl;

    await saveSettings(merged);
  }

  // Also make sure old localhost frontend URLs
  // are migrated.
  if (
    merged.webAppUrl === "http://localhost:5173" ||
    merged.webAppUrl === "http://127.0.0.1:5173"
  ) {
    merged.webAppUrl = DEFAULT_SETTINGS.webAppUrl;

    await saveSettings(merged);
  }

  return merged;
}

export async function saveSettings(settings) {
  if (!HAS_CHROME) return;

  await chrome.storage.local.set({
    settings,
  });
}

export async function loadAuth() {
  if (!HAS_CHROME) return null;

  const { auth } =
    await chrome.storage.local.get(["auth"]);

  return auth && auth.token
    ? auth
    : null;
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

  const [tab] =
    await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

  if (!tab) {
    return {
      id: null,
      domain: "",
      url: "",
      favicon: "",
    };
  }

  let domain = "";

  try {
    domain = new URL(tab.url)
      .hostname
      .replace(/^www\./, "");
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
    return `
      This is a sample privacy policy for preview purposes.
      We collect your email address and location data.
      We share information with advertising partners and third parties.
      We use cookies and tracking technologies.
      We retain data indefinitely.
    `;
  }

  const [result] =
    await chrome.scripting.executeScript({
      target: {
        tabId,
      },
      func: () => document.body.innerText,
    });

  return result?.result || "";
}

export function setBadge(
  tabId,
  score,
  level
) {
  if (
    !HAS_CHROME ||
    typeof tabId !== "number"
  ) {
    return;
  }

  const color =
    level === "High"
      ? "#EF4444"
      : level === "Medium"
      ? "#F59E0B"
      : "#22C55E";

  chrome.runtime.sendMessage({
    type: "SET_BADGE",
    tabId,
    text: String(score),
    color,
  });
}

export function openWebApp(
  webAppUrl,
  path = ""
) {
  const url = `${webAppUrl}${path}`;

  if (HAS_CHROME) {
    chrome.tabs.create({
      url,
    });
  } else {
    window.open(
      url,
      "_blank"
    );
  }
}

// ---------------------------------------------------------
// Find Privacy Policy link
// ---------------------------------------------------------

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

    if (!href) continue;

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
          canonical: isCanonical,
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

export async function findPolicyLink(
  tabId
) {
  if (!HAS_CHROME) return null;

  try {
    const [result] =
      await chrome.scripting.executeScript({
        target: {
          tabId,
        },
        func: findPolicyLinkInPage,
      });

    return result?.result || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------
// Fetch linked policy page
// ---------------------------------------------------------

const LINKED_TAB_LOAD_TIMEOUT_MS = 8000;

export async function fetchTextFromUrl(
  url
) {
  if (!HAS_CHROME || !url) {
    return "";
  }

  let tab;

  try {
    tab =
      await chrome.tabs.create({
        url,
        active: false,
      });

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

    return await getPageText(
      tab.id
    );
  } catch {
    return "";
  } finally {
    if (tab?.id) {
      try {
        await chrome.tabs.remove(
          tab.id
        );
      } catch {
        // Tab already closed.
      }
    }
  }
}