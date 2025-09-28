// content.js
console.log("PathFinder content script loaded on", window.location.href);

// Add highlight CSS class
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

function highlightClickableElements(keyword) {
  if (!keyword) return;

  // Remove old highlights first
  document.querySelectorAll(".ai-highlight").forEach(el => {
    el.classList.remove("ai-highlight");
    el.style.outline = "";
    el.style.backgroundColor = "";
  });

  // Broad selector for clickable elements
  const clickables = document.querySelectorAll(
    "button, a, input[type=button], input[type=submit], " +
    "div[role=button], span[role=button], div[onclick], span[onclick]"
  );

  let found = false;

  clickables.forEach(el => {
    // Get text from various possible attributes and inner text
    const text = (el.innerText || el.value || el.getAttribute("aria-label") || "").toLowerCase();

    // Check if the element's text includes the keyword
    if (text.includes(keyword.toLowerCase())) {
      console.log("✅ Highlighting element:", el, "with text:", text);
      el.classList.add("ai-highlight");
      found = true;
    }
  });

  if (!found) {
    console.log("❌ No clickable elements matched for:", keyword);
  }
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlight") {
    // The message.text will now be the specific UI label like "Account"
    highlightClickableElements(request.text);
  }
});