const API_BASE = "http://127.0.0.1:8080";
const API_ASK = `${API_BASE}/ask`;
const API_HEALTH = `${API_BASE}/health`;

console.log("[PF] background loaded");
chrome.runtime.onInstalled.addListener(() => console.log("[PF] installed"));

// Listen for a message from content.js after a user clicks a button
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "ASK") {
    console.log("[PF] received ASK:", msg.query);

    (async () => {
      let response = { ok: false, text: "", error: "An unexpected error occurred." };
      try {
        const h = await fetch(API_HEALTH);
        if (!h.ok) {
          response.error = `/health ${h.status}`;
        } else {
          const r = await fetch(API_ASK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: msg.query })
          });
          if (!r.ok) {
            response.error = `Server ${r.status}`;
          } else {
            const data = await r.json();
            const responseText = data?.text || "";
            const matches = responseText.match(/\*\*(.*?)\*\*/g);

            if (matches && matches.length > 0) {
              const cleanedMatches = matches.map(m => m.replace(/\*\*/g, "").trim());
              // Store all steps in local storage
              chrome.storage.local.set({ pathfinderSteps: cleanedMatches, currentStep: 0 });

              // Send the first highlight immediately to the content script
              chrome.tabs.sendMessage(sender.tab.id, {
                action: "highlight",
                text: cleanedMatches[0]
              });
            }
            response = { ok: true, text: responseText };
          }
        }
      } catch (e) {
        response.error = String(e);
      } finally {
        sendResponse(response);
      }
    })();
    return true; // Keep the message channel open
  } else if (msg?.action === "stepComplete") {
    // A step was just completed, time to highlight the next one
    chrome.storage.local.get(['pathfinderSteps', 'currentStep'], (result) => {
      const { pathfinderSteps, currentStep } = result;

      // Check if there are more steps
      if (pathfinderSteps && currentStep < pathfinderSteps.length - 1) {
        const nextStepIndex = currentStep + 1;
        const nextStepText = pathfinderSteps[nextStepIndex];

        // Update the current step in storage
        chrome.storage.local.set({ currentStep: nextStepIndex }, () => {
          // Send the next highlight to the current tab
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "highlight",
            text: nextStepText
          });
        });
      } else {
        // No more steps to highlight, clean up storage
        console.log("Task completed. No more steps to highlight.");
        chrome.storage.local.remove(['pathfinderSteps', 'currentStep']);
      }
    });
  }
});

// Listener for page navigations/reloads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.startsWith('http')) {
    // When the page loads, check if there are steps to highlight
    chrome.storage.local.get(['pathfinderSteps', 'currentStep'], (result) => {
      const { pathfinderSteps, currentStep } = result;
      if (pathfinderSteps && currentStep < pathfinderSteps.length) {
        // Resend the highlight for the current step
        chrome.tabs.sendMessage(tabId, {
          action: "highlight",
          text: pathfinderSteps[currentStep]
        });
      }
    });
  }
});