const API_BASE = "http://127.0.0.1:8080";
const API_ASK = `${API_BASE}/ask`;
const API_HEALTH = `${API_BASE}/health`;

console.log("[PF] background loaded");
chrome.runtime.onInstalled.addListener(() => console.log("[PF] installed"));

// Listen for tab updates (when a page reloads or navigates)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only proceed if the page has fully loaded
  if (changeInfo.status === 'complete' && tab.url.startsWith('http')) {
    chrome.storage.local.get(['pathfinderSteps'], (result) => {
      const steps = result.pathfinderSteps;
      if (steps && steps.length > 0) {
        console.log("[PF] Found steps in storage, sending the next one.");
        
        // Send the next highlight message to the new page
        chrome.tabs.sendMessage(tabId, {
          action: "highlight",
          text: steps[0]
        });
        
        // Remove the step that was just sent
        const remainingSteps = steps.slice(1);
        chrome.storage.local.set({ pathfinderSteps: remainingSteps });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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

          const matches = responseText.match(/\*\*(.*?)\*\*/g);
          if (matches && matches.length > 0) {
            const cleanedMatches = matches.map(m => m.replace(/\*\*/g, "").trim());

            // Save all steps to storage
            chrome.storage.local.set({ pathfinderSteps: cleanedMatches }, () => {
              console.log("[PF] Steps saved to storage:", cleanedMatches);
              
              // Send the first highlight immediately
              chrome.tabs.sendMessage(sender.tab.id, {
                action: "highlight",
                text: cleanedMatches[0]
              });
              
              // Remove the first step from the stored array
              const remainingSteps = cleanedMatches.slice(1);
              chrome.storage.local.set({ pathfinderSteps: remainingSteps });
            });
          }
          response = { ok: true, text: responseText };
        }
      }
    } catch (e) {
      console.error("[PF] fetch error:", e);
      response.error = String(e);
    } finally {
      sendResponse(response);
    }
  })();

  return true;
});