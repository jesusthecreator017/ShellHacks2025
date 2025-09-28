const API_BASE = "http://127.0.0.1:8080";
const API_ASK = `${API_BASE}/ask`;
const API_HEALTH = `${API_BASE}/health`;

console.log("[PF] background loaded");
chrome.runtime.onInstalled.addListener(() => console.log("[PF] installed"));

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "ASK") return;

  (async () => {
    let response = { ok: false, text: "", error: "Unexpected error." };

    try {
      const h = await fetch(API_HEALTH);
      if (!h.ok) throw new Error(`/health ${h.status}`);

      const r = await fetch(API_ASK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: msg.query })
      });

      if (!r.ok) throw new Error(`Server ${r.status}`);

      const data = await r.json();
      const responseText = data?.text || "";

      const matches = responseText.match(/\*\*(.*?)\*\*/g);
      if (matches?.length) {
        const cleaned = matches.map(m => m.replace(/\*\*/g, "").trim());

        // Send the full list to content.js
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "highlight-steps",
              steps: cleaned
            });
          }
        });
      }

      response = { ok: true, text: responseText };
    } catch (e) {
      console.error("[PF] error:", e);
      response.error = String(e);
    } finally {
      sendResponse(response);
    }
  })();

  return true; // keep channel open
});
