import { useCallback, useEffect, useRef, useState } from "react";
import {
  HAS_CHROME,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  loadAuth,
  loadActiveTab,
  isScannableUrl,
  getPageText,
  setBadge,
  openWebApp,
  findPolicyLink,
  fetchTextFromUrl,
} from "./chrome";
import { analyzePolicy, askAboutPolicy } from "./api";

const LOADING_MESSAGES = [
  "Opening the case file...",
  "Examining the evidence...",
  "Following the trackers...",
  "Building the case...",
  "Closing the case...",
];

// Strips trailing slash + fragment so "found a link" doesn't just mean
// "found a link to the same page the user is already on" (e.g. a
// same-page #privacy anchor, or the exact same URL with/without a
// trailing slash).
function normalizeUrl(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return url || "";
  }
}

export function usePrivacyLens() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [auth, setAuth] = useState(null);
  const [tab, setTab] = useState({
    id: null,
    domain: "",
    url: "",
    favicon: "",
  });
  const [view, setView] = useState("idle"); // idle | loading | results | error
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [analysis, setAnalysis] = useState(null);
  const [analyzedAt, setAnalyzedAt] = useState(null);
  const [error, setError] = useState({ title: "", message: "" });
  const [chatLog, setChatLog] = useState([]);
  const [asking, setAsking] = useState(false);

  const loadingTimer = useRef(null);

  // ---- initial load -------------------------------------------------
  useEffect(() => {
    (async () => {
      const [s, a, t] = await Promise.all([
        loadSettings(),
        loadAuth(),
        loadActiveTab(),
      ]);
      setSettings(s);
      setAuth(a);
      setTab(t);

      // "autoScan" only controls whether background.js scans on page load
      // with no click at all (see background.js). Opening the popup and
      // having IT scan immediately is the "on demand" behavior itself —
      // "click the icon, it starts analyzing" — so this always runs,
      // regardless of that setting.
      if (isScannableUrl(t.url) || !HAS_CHROME) {
        scan(s, t, a);
      } else {
        setView("idle");
      }
    })();
    return () => clearInterval(loadingTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startLoadingMessages = () => {
    let i = 0;
    setLoadingMessage(LOADING_MESSAGES[0]);
    loadingTimer.current = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[i]);
    }, 800);
  };

  const stopLoadingMessages = () => clearInterval(loadingTimer.current);

  const scan = useCallback(
    async (s = settings, t = tab, a = auth) => {
      setView("loading");
      startLoadingMessages();
      setChatLog([]);

      try {
        if (HAS_CHROME && !isScannableUrl(t.url))
          throw new Error("UNSCANNABLE");

        const pageText = await getPageText(t.id);

        // Proactive, not reactive: look for a dedicated privacy/terms/
        // cookies link up front, REGARDLESS of whether the current
        // page's own text is long enough — real bug this fixes: a thin
        // or mostly-JS-rendered current page used to throw EMPTY_PAGE
        // right here, before link discovery ever ran at all, even
        // though the whole point of link-following is to rescue exactly
        // that situation. background.js's auto-scan never had this
        // flaw; manual scan now matches it — same thorough logic in
        // both places, accuracy over speed either way.
        let link = null;
        if (HAS_CHROME) {
          setLoadingMessage("Looking for the actual privacy policy page...");
          link = await findPolicyLink(t.id);
          console.log("PrivacyLens: policy link found ->", link);
          if (link && normalizeUrl(link) === normalizeUrl(t.url)) link = null;
        }

        let data;
        if (link) {
          const linkedText = await fetchTextFromUrl(link);
          console.log(
            "PrivacyLens: linked page text length ->",
            linkedText?.length || 0,
          );
          try {
            if (!linkedText || linkedText.trim().length < 40)
              throw new Error("EMPTY_LINKED_PAGE");
            data = await analyzePolicy({
              apiUrl: s.apiUrl,
              domain: t.domain,
              pageText: linkedText,
              preference: s.preference,
              token: a?.token,
            });
          } catch (linkErr) {
            // The linked page didn't pan out (no/short text, or the
            // backend rejected it as NOT_A_POLICY) — fall back to the
            // current page's own text, today's original last resort.
            console.warn(
              "PrivacyLens: linked page analysis failed, falling back to current page ->",
              linkErr?.message,
            );
            if (!pageText || pageText.trim().length < 40)
              throw new Error("EMPTY_PAGE");
            data = await analyzePolicy({
              apiUrl: s.apiUrl,
              domain: t.domain,
              pageText,
              preference: s.preference,
              token: a?.token,
            });
          }
        } else {
          if (!pageText || pageText.trim().length < 40)
            throw new Error("EMPTY_PAGE");
          data = await analyzePolicy({
            apiUrl: s.apiUrl,
            domain: t.domain,
            pageText,
            preference: s.preference,
            token: a?.token,
          });
        }

        stopLoadingMessages();
        setAnalysis(data);
        setAnalyzedAt(new Date());
        setView("results");
        setBadge(t.id, data.risk_score, data.risk_level);
      } catch (err) {
        stopLoadingMessages();
        const msg = err?.message || "";
        if (msg === "UNSCANNABLE") {
          setError({
            title: "This page can't be scanned",
            message:
              "Browser system pages can't be analyzed. Try a regular website.",
          });
        } else if (msg === "EMPTY_PAGE") {
          setError({
            title: "Not enough text found",
            message: "Try opening the site's actual privacy policy page.",
          });
        } else if (msg === "NOT_A_POLICY") {
          setError({
            title: "Couldn't find a privacy policy on this site",
            message:
              "We looked for a linked privacy policy page but couldn't find or reach one. Try navigating to it directly.",
          });
        } else if (msg === "Failed to fetch" || msg === "SERVER_ERROR") {
          setError({
            title: "Can't reach the PrivacyLens server",
            message:
              "The local and production PrivacyLens backends could not be reached. Please try again.",
          });
        } else if (msg === "TIMEOUT") {
          setError({
            title: "This is taking too long",
            message:
              "The server didn't respond in time. It may be overloaded or stuck — try again in a moment.",
          });
        } else {
          setError({
            title: "Couldn't complete the scan",
            message: msg || "Something unexpected happened.",
          });
        }
        setView("error");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, tab, auth],
  );

  const updateSettings = useCallback(
    async (patch) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await saveSettings(next);
    },
    [settings],
  );

  const ask = useCallback(
    async (question) => {
      if (!question.trim()) return;
      setChatLog((log) => [...log, { role: "user", text: question }]);
      setAsking(true);
      try {
        const answer = await askAboutPolicy({
          apiUrl: settings.apiUrl,
          question,
          analysis,
        });
        setChatLog((log) => [...log, { role: "ai", text: answer }]);
      } catch {
        setChatLog((log) => [
          ...log,
          { role: "ai", text: "Couldn't reach the server." },
        ]);
      } finally {
        setAsking(false);
      }
    },
    [settings.apiUrl, analysis],
  );

  const goToWebApp = useCallback(
    (path) => openWebApp(settings.webAppUrl, path),
    [settings.webAppUrl],
  );

  const downloadReport = useCallback(() => {
    if (!analysis) return;
    const domain = tab.domain || "policy";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>PrivacyLens Report — ${domain}</title>
      <style>body{font-family:Arial,sans-serif;max-width:640px;margin:40px auto;color:#0f172a;line-height:1.6}
      h1{color:#6366F1} .score{font-size:32px;font-weight:bold}</style></head><body>
      <h1>PrivacyLens Report</h1>
      <p><strong>Site:</strong> ${domain}</p>
      <p class="score">Risk Score: ${analysis.risk_score}/100 (${analysis.risk_level || ""})</p>
      <pre style="white-space:pre-wrap;font-family:inherit">${analysis.privacy_report || ""}</pre>
      </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PrivacyLens_${domain}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, [analysis, tab.domain]);

  return {
    settings,
    updateSettings,
    auth,
    tab,
    view,
    loadingMessage,
    analysis,
    analyzedAt,
    error,
    chatLog,
    asking,
    scan: () => scan(),
    ask,
    goToWebApp,
    downloadReport,
  };
}
