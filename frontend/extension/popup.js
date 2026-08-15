let pageText = "";

// ---------------------------------------------------------------------------
// Backend configuration
// ---------------------------------------------------------------------------

const LOCAL_API_URL = "http://127.0.0.1:8811";
const PRODUCTION_API_URL =
  "https://privacy-risk-analyzer.onrender.com";

// ---------------------------------------------------------------------------
// Toggle accordion
// ---------------------------------------------------------------------------

function toggle(btn) {
  const content = btn.nextElementSibling;

  content.style.display =
    content.style.display === "block"
      ? "none"
      : "block";
}

// ---------------------------------------------------------------------------
// Get configured backend URLs
// ---------------------------------------------------------------------------

async function getApiUrls() {
  const { settings } =
    await chrome.storage.local.get(["settings"]);

  const localUrl =
    settings?.apiUrl || LOCAL_API_URL;

  const productionUrl =
    settings?.productionApiUrl ||
    PRODUCTION_API_URL;

  return [
    ...new Set([
      localUrl,
      productionUrl,
    ]),
  ];
}

// ---------------------------------------------------------------------------
// Analyze request
// Local backend first → Render fallback
// ---------------------------------------------------------------------------

async function analyzePolicy(text) {
  const apiUrls = await getApiUrls();

  for (const apiUrl of apiUrls) {
    try {
      console.log(
        "PrivacyLens popup: trying backend ->",
        apiUrl
      );

      const res = await fetch(
        `${apiUrl}/api/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
          }),
        }
      );

      if (!res.ok) {
        console.warn(
          `PrivacyLens popup: ${apiUrl} returned HTTP ${res.status}`
        );

        continue;
      }

      const data = await res.json();

      console.log(
        "PrivacyLens popup: analysis successful ->",
        apiUrl
      );

      return data;
    } catch (error) {
      console.warn(
        "PrivacyLens popup: backend unavailable ->",
        apiUrl
      );
    }
  }

  throw new Error(
    "PrivacyLens backend is unavailable."
  );
}

// ---------------------------------------------------------------------------
// Chat request
// Local backend first → Render fallback
// ---------------------------------------------------------------------------

async function askBackend(
  question,
  context
) {
  const apiUrls = await getApiUrls();

  for (const apiUrl of apiUrls) {
    try {
      console.log(
        "PrivacyLens chat: trying backend ->",
        apiUrl
      );

      const res = await fetch(
        `${apiUrl}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            context,
          }),
        }
      );

      if (!res.ok) {
        console.warn(
          `PrivacyLens chat: ${apiUrl} returned HTTP ${res.status}`
        );

        continue;
      }

      const data = await res.json();

      console.log(
        "PrivacyLens chat: request successful ->",
        apiUrl
      );

      return data;
    } catch (error) {
      console.warn(
        "PrivacyLens chat: backend unavailable ->",
        apiUrl
      );
    }
  }

  throw new Error(
    "PrivacyLens backend is unavailable."
  );
}

// ---------------------------------------------------------------------------
// Analyze button
// ---------------------------------------------------------------------------

document.getElementById(
  "analyze"
).onclick = async () => {
  try {
    const [tab] =
      await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

    if (!tab?.id) {
      throw new Error(
        "Could not access the current tab."
      );
    }

    const results =
      await chrome.scripting.executeScript({
        target: {
          tabId: tab.id,
        },

        func: () =>
          document.body?.innerText || "",
      });

    pageText =
      results?.[0]?.result || "";

    if (pageText.trim().length < 40) {
      alert(
        "Not enough page content to analyze."
      );

      return;
    }

    // Analyze using local backend first,
    // then Render if local is unavailable.
    const data =
      await analyzePolicy(pageText);

    // -----------------------------------------------------------------------
    // Risk
    // -----------------------------------------------------------------------

    const riskEl =
      document.getElementById(
        "risk"
      );

    riskEl.innerText =
      data.risk_score + "%";

    if (data.risk_score < 30) {
      riskEl.className =
        "risk low";
    } else if (
      data.risk_score < 70
    ) {
      riskEl.className =
        "risk medium";
    } else {
      riskEl.className =
        "risk high";
    }

    // -----------------------------------------------------------------------
    // Summary
    // -----------------------------------------------------------------------

    document.getElementById(
      "summary"
    ).innerText =
      data.summary || "No summary available.";

    // -----------------------------------------------------------------------
    // Details
    // -----------------------------------------------------------------------

    const clauses =
      data.clauses || {};

    document.getElementById(
      "collection"
    ).innerText =
      Array.isArray(
        clauses.data_collection
      )
        ? clauses.data_collection.join(", ")
        : "";

    document.getElementById(
      "sharing"
    ).innerText =
      Array.isArray(
        clauses.data_sharing
      )
        ? clauses.data_sharing.join(", ")
        : "";

    document.getElementById(
      "cookies"
    ).innerText =
      Array.isArray(
        clauses.cookies
      )
        ? clauses.cookies.join(", ")
        : "";

    document.getElementById(
      "retention"
    ).innerText =
      Array.isArray(
        clauses.retention
      )
        ? clauses.retention.join(", ")
        : "";
  } catch (error) {
    console.error(
      "PrivacyLens analysis error:",
      error
    );

    alert(
      "PrivacyLens could not connect to the backend. Make sure the local backend is running or the deployed backend is available."
    );
  }
};

// ---------------------------------------------------------------------------
// Chatbot
// ---------------------------------------------------------------------------

document.getElementById(
  "ask"
).onclick = async () => {
  try {
    const question =
      document.getElementById(
        "question"
      ).value.trim();

    if (!question) {
      alert(
        "Please enter a question."
      );

      return;
    }

    if (!pageText) {
      alert(
        "Please analyze the page first."
      );

      return;
    }

    const data =
      await askBackend(
        question,
        pageText
      );

    document.getElementById(
      "answer"
    ).innerText =
      data.answer ||
      "No answer available.";
  } catch (error) {
    console.error(
      "PrivacyLens chat error:",
      error
    );

    document.getElementById(
      "answer"
    ).innerText =
      "Unable to connect to the PrivacyLens backend.";
  }
};