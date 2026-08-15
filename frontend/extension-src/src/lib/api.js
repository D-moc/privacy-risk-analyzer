const TIMEOUT_MS = 30000;

const PRODUCTION_API_URL =
  "https://privacy-risk-analyzer.onrender.com";

async function fetchWithTimeout(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("TIMEOUT");
    }

    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Try the configured backend first.
// If localhost is unavailable, automatically use Render.
async function fetchWithFallback({
  apiUrl,
  path,
  options,
}) {
  const primaryUrl = (apiUrl || "").replace(/\/$/, "");

  const urls = [];

  if (primaryUrl) {
    urls.push(`${primaryUrl}${path}`);
  }

  // Don't duplicate production URL
  if (
    PRODUCTION_API_URL &&
    primaryUrl !== PRODUCTION_API_URL
  ) {
    urls.push(`${PRODUCTION_API_URL}${path}`);
  }

  let lastError = null;

  for (const url of urls) {
    try {
      console.log("PrivacyLens: trying backend ->", url);

      const res = await fetchWithTimeout(
        url,
        options,
        TIMEOUT_MS
      );

      // Network succeeded.
      // Don't fallback for normal API errors such as 400/401/422/500.
      if (!res.ok) {
        throw new Error("SERVER_ERROR");
      }

      console.log("PrivacyLens: backend connected ->", url);

      return res;
    } catch (err) {
      lastError = err;

      console.warn(
        "PrivacyLens: backend unavailable ->",
        url,
        err?.message
      );

      // Continue to the next backend.
    }
  }

  throw lastError || new Error("SERVER_ERROR");
}


export async function analyzePolicy({
  apiUrl,
  domain,
  pageText,
  preference,
  token,
}) {
  const createFormData = () => {
    const formData = new FormData();

    formData.append(
      "policy_name",
      domain || "Untitled Policy"
    );

    formData.append(
      "input",
      pageText.slice(0, 20000)
    );

    formData.append(
      "preference",
      preference || "balanced"
    );

    return formData;
  };

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetchWithFallback({
    apiUrl,
    path: "/api/analyze",
    options: {
      method: "POST",
      headers,
      body: createFormData(),
    },
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}


export async function askAboutPolicy({
  apiUrl,
  question,
  analysis,
}) {
  const res = await fetchWithFallback({
    apiUrl,
    path: "/api/chat",
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
  });

  const data = await res.json();

  return data.answer || "No answer available.";
}