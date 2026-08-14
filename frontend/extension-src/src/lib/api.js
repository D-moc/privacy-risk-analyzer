// Without this, a hung/slow backend (or a slow third-party call it makes,
// e.g. the ToS;DR lookup) left the popup stuck on the loading screen
// forever, since a plain fetch() never gives up on its own.
const TIMEOUT_MS = 30000;

async function fetchWithTimeout(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") throw new Error("TIMEOUT");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function analyzePolicy({ apiUrl, domain, pageText, preference, token }) {
  const formData = new FormData();
  formData.append("policy_name", domain || "Untitled Policy");
  formData.append("input", pageText.slice(0, 20000));
  formData.append("preference", preference);

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetchWithTimeout(
    `${apiUrl}/api/analyze`,
    { method: "POST", headers, body: formData },
    TIMEOUT_MS
  );

  if (!res.ok) throw new Error("SERVER_ERROR");

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function askAboutPolicy({ apiUrl, question, analysis }) {
  const res = await fetchWithTimeout(
    `${apiUrl}/api/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        policy_data: analysis
          ? {
              risk: analysis.risk_score,
              clauses: analysis.clauses,
              darkPatterns: analysis.dark_patterns,
              report: analysis.privacy_report,
            }
          : null,
      }),
    },
    TIMEOUT_MS
  );
  const data = await res.json();
  return data.answer || "No answer available.";
}
