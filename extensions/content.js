console.log("PathFinder content script loaded on", window.location.href);

// 🔹 Inject highlight CSS
const style = document.createElement("style");
style.textContent = `
  .ai-highlight {
    outline: 3px solid #FFD700 !important;
    background-color: rgba(255, 255, 0, 0.3) !important;
    border-radius: 6px;
    transition: 0.3s ease;
  }
`;
document.head.appendChild(style);

// 🔹 Store last AI response for dynamic updates
let lastResponseText = "";

// 🔹 Highlight single keyword
function highlightClickableElements(keyword) {
  if (!keyword) return;

  // Remove old highlights first
  document.querySelectorAll(".ai-highlight").forEach(el => {
    el.classList.remove("ai-highlight");
  });

  const clickables = document.querySelectorAll(
    "button, a, input[type=button], input[type=submit]"
  );

  let found = false;

  clickables.forEach(el => {
    const text = (
      el.innerText ||
      el.value ||
      el.getAttribute("aria-label") ||
      ""
    ).toLowerCase();

    if (text.includes(keyword.toLowerCase())) {
      el.classList.add("ai-highlight");
      found = true;
    }
  });

  if (!found) {
    console.log("❌ No clickable elements matched:", keyword);
  }
}

// 🔹 Extract bolded keywords from AI response
function extractKeywordsFromAI(text) {
  const regex = /\*\*(.*?)\*\*/g;
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

// 🔹 Highlight all bolded keywords in AI response
function highlightAIResponse(text) {
  lastResponseText = text; // store for mutation observer
  const keywords = extractKeywordsFromAI(text);
  if (keywords.length === 0) {
    console.log("⚠️ No bolded keywords found in AI response.");
    return;
  }
  keywords.forEach(k => highlightClickableElements(k));
}

// 🔹 Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === "highlight") {
    highlightAIResponse(request.text);
  }
});

// 🔹 Watch DOM changes and re-apply highlights
const observer = new MutationObserver(() => {
  if (lastResponseText) {
    highlightAIResponse(lastResponseText);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

