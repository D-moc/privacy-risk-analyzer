const TIMEOUT_MS = 30000;

const PRODUCTION_API_URL =
  "https://privacy-risk-analyzer.onrender.com";

async function fetchWithTimeout(
  url,
  options,
  ms
) {
  const controller =
    new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    ms
  );

  try {
    return await fetch(
      url,
      {
        ...options,
        signal:
          controller.signal,
      }
    );
  } catch (err) {
    if (
      err?.name === "AbortError"
    ) {
      throw new Error(
        "TIMEOUT"
      );
    }

    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------
// API request
// Production backend only
// ---------------------------------------------------------

async function request(
  path,
  options = {}
) {
  const url =
    `${PRODUCTION_API_URL}${path}`;

  console.log(
    "PrivacyLens: backend ->",
    url
  );

  const response =
    await fetchWithTimeout(
      url,
      options,
      TIMEOUT_MS
    );

  if (!response.ok) {
    console.error(
      `PrivacyLens backend returned HTTP ${response.status}`
    );

    throw new Error(
      "SERVER_ERROR"
    );
  }

  return response;
}

// ---------------------------------------------------------
// Analyze Privacy Policy
// ---------------------------------------------------------

export async function analyzePolicy({
  apiUrl,
  domain,
  pageText,
  preference,
  token,
}) {
  const formData =
    new FormData();

  formData.append(
    "policy_name",
    domain ||
      "Untitled Policy"
  );

  formData.append(
    "input",
    pageText.slice(
      0,
      20000
    )
  );

  formData.append(
    "preference",
    preference ||
      "moderate"
  );

  const headers = {};

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const res =
    await request(
      "/api/analyze",
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

  const data =
    await res.json();

  if (data.error) {
    throw new Error(
      data.error
    );
  }

  return data;
}

// ---------------------------------------------------------
// Ask PrivacyLens AI
// ---------------------------------------------------------

export async function askAboutPolicy({
  apiUrl,
  question,
  analysis,
}) {
  const res =
    await request(
      "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          question,
          policy_data:
            analysis
              ? {
                  risk:
                    analysis.risk_score,

                  clauses:
                    analysis.clauses,

                  darkPatterns:
                    analysis.dark_patterns,

                  report:
                    analysis.privacy_report,
                }
              : null,
        }),
      }
    );

  const data =
    await res.json();

  return (
    data.answer ||
    "No answer available."
  );
}