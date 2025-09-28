const API_BASE = "http://127.0.0.1:8080";
const API_ASK = `${API_BASE}/ask`;
const API_HEALTH = `${API_BASE}/health`;

console.log("[PF] background loaded");
chrome.runtime.onInstalled.addListener(() => console.log("[PF] installed"));

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "ASK") return;

  console.log("[PF] received ASK:", msg.query);

  (async () => {
    let response = { ok: false, text: "", error: "An unexpected error occurred." };

    try {
      const h = await fetch(API_HEALTH);
      console.log("[PF] /health status:", h.status);
      if (!h.ok) {
        response.error = `/health ${h.status}`;
      } else {
        const r = await fetch(API_ASK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: msg.query })
        });
        console.log("[PF] /ask status:", r.status);

        if (!r.ok) {
          response.error = `Server ${r.status}`;
        } else {
          const data = await r.json();
          const responseText = data?.text || "";
          console.log("[PF] /ask payload:", responseText);

          if (!responseText) {
            console.warn("[PF] Empty response text received from /ask.");
          }

          // --- EDITED LOGIC: Extract and highlight all bolded text sequentially ---
          const matches = responseText.match(/\*\*(.*?)\*\*/g); // Finds all text between **
          if (matches && matches.length > 0) {
            const cleanedMatches = matches.map(m => m.replace(/\*\*/g, "").trim());

            // Recursive function to send highlights with a delay
            const highlightNextStep = (index) => {
              if (index >= cleanedMatches.length) {
                console.log("[PF] All steps have been sent for highlighting.");
                return;
              }

              const highlightText = cleanedMatches[index];

              // Forward the extracted UI label to the active tab
              chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                if (tabs.length > 0 && tabs[0]?.id) {
                  chrome.tabs.sendMessage(tabs[0].id, {
                    action: "highlight",
                    text: highlightText
                  });

                  // Set a delay before sending the next step
                  setTimeout(() => {
                    highlightNextStep(index + 1);
                  }, 5000); // 5-second delay
                } else {
                  console.error("[PF] No active tab found to send the message.");
                }
              });
            };

            // Start the highlighting process
            highlightNextStep(0);
          }
          response = { ok: true, text: responseText };
        }
      }
    } catch (e) {
      console.error("[PF] fetch error:", e);
      response.error = String(e);
    } finally {
      // Call sendResponse only once at the end
      sendResponse(response);
    }
  })();

  return true; // Keep the message channel open for the asynchronous response
});
