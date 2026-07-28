// Tiny renderer for the small markdown subset the AI report/chat use
// (## headings, **bold**, "- " bullets, plain paragraphs).
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineMd(text) {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function renderMarkdown(md) {
  if (!md) return "<p>No report available.</p>";
  const lines = escapeHtml(md).split("\n");
  let html = "";
  let inList = false;

  const closeList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line) return;

    if (line.startsWith("## ")) {
      closeList();
      html += `<h4>${inlineMd(line.slice(3))}</h4>`;
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${inlineMd(line.slice(2))}</li>`;
    } else {
      closeList();
      html += `<p>${inlineMd(line)}</p>`;
    }
  });
  closeList();
  return html;
}
