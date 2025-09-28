
console.log("PathFinder content script loaded on", window.location.href);

// 🔹 Inject highlight CSS
const style = document.createElement("style");
style.textContent = `
  .ai-highlight {
    outline: 3px solid #FFD700 !important; /* gold glow */
    background-color: rgba(255, 255, 0, 0.3) !important;
    border-radius: 6px;
    transition: 0.3s ease;
  }
`;
document.head.appendChild(style);

// 🔹 Core highlight function
function highlightClickableElements(keyword) {
  if (!keyword) return;

  // Remove old highlights first
  document.querySelectorAll(".ai-highlight").forEach(el => {
    el.classList.remove("ai-highlight");
  });

  // Collect clickable elements
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

    console.log("Checking element:", el, "with text:", text);

    if (text.includes(keyword.toLowerCase())) {
      console.log("✅ Highlighting element:", el, "with text:", text);
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

// 🔹 Highlight all keywords from AI response
function highlightAIResponse(text) {
  const keywords = extractKeywordsFromAI(text);
  if (keywords.length === 0) {
    console.log("⚠️ No bolded keywords found in AI response.");
  }
  keywords.forEach(k => highlightClickableElements(k));
}

// 🔹 Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlight") {
    highlightAIResponse(request.text);
  }
});

// 🔹 Support dynamic content changes
let lastResponseText = "";

const observer = new MutationObserver(() => {
  if (lastResponseText) {
    highlightAIResponse(lastResponseText);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Keep last response for re-highlighting
function highlightClickableElements(keyword) {
  lastResponseText = keyword;
}
