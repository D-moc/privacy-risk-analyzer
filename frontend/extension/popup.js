let pageText = "";

// 🔥 TOGGLE ACCORDION
function toggle(btn) {
  const content = btn.nextElementSibling;
  content.style.display =
    content.style.display === "block" ? "none" : "block";
}

document.getElementById("analyze").onclick = async () => {

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.body.innerText
  }, async (results) => {

    pageText = results[0].result;

    const res = await fetch("http://127.0.0.1:8000/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: pageText }),
    });

    const data = await res.json();

    // 🔥 RISK
    const riskEl = document.getElementById("risk");
    riskEl.innerText = data.risk_score + "%";

    if (data.risk_score < 30) riskEl.className = "risk low";
    else if (data.risk_score < 70) riskEl.className = "risk medium";
    else riskEl.className = "risk high";

    // 🔥 SUMMARY
    document.getElementById("summary").innerText = data.summary;

    // 🔥 DETAILS
    document.getElementById("collection").innerText =
      data.clauses.data_collection.join(", ");

    document.getElementById("sharing").innerText =
      data.clauses.data_sharing.join(", ");

    document.getElementById("cookies").innerText =
      data.clauses.cookies.join(", ");

    document.getElementById("retention").innerText =
      data.clauses.retention.join(", ");
  });
};

// 🤖 CHATBOT
document.getElementById("ask").onclick = async () => {
  const question = document.getElementById("question").value;

  const res = await fetch("http://127.0.0.1:8000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      context: pageText
    }),
  });

  const data = await res.json();

  document.getElementById("answer").innerText = data.answer;
};