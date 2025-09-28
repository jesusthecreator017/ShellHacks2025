// background.js
const API_BASE = "http://127.0.0.1:8080";
const API_ASK = `${API_BASE}/ask`;
const API_HEALTH = `${API_BASE}/health`;

console.log("[PF] background loaded");
chrome.runtime.onInstalled.addListener(() => console.log("[PF] installed"));

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "ASK") return;

  console.log("[PF] received ASK:", msg.query);

  (async () => {
    try {
      const h = await fetch(API_HEALTH);
      console.log("[PF] /health status:", h.status);
      if (!h.ok) return sendResponse({ ok: false, error: `/health ${h.status}` });

      const r = await fetch(API_ASK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: msg.query })
      });
      console.log("[PF] /ask status:", r.status);

      if (!r.ok) return sendResponse({ ok: false, error: `Server ${r.status}` });

      const data = await r.json();
      console.log("[PF] /ask payload:", data);

      // Forward the AI’s output to the active tab for highlighting
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "highlight",
            text: data?.text || ""
          });
        }
      });

      // Also reply to the original sender (popup)
      sendResponse({ ok: true, text: data?.text || "" });
    } catch (e) {
      console.error("[PF] fetch error:", e);
      sendResponse({ ok: false, error: String(e) });
    }
  })();

  return true; // keep the message channel open
});

console.log("[PF] AI response text:", data?.text);