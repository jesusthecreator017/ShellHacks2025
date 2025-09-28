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

  // First, remove all previous highlights
  document.querySelectorAll(".ai-highlight").forEach(el => {
    el.classList.remove("ai-highlight");
    // Remove the click listener to avoid multiple event handlers
    el.removeEventListener('click', handleHighlightClick);
  });

  // Now, find and highlight the correct element
  const clickables = document.querySelectorAll(
    "button, a, input[type=button], input[type=submit], " +
    "div[role=button], span[role=button], div[onclick], span[onclick]"
  );

  let found = false;

  clickables.forEach(el => {
    const text = (el.innerText || el.value || el.getAttribute("aria-label") || "").toLowerCase();

    if (text.includes(keyword.toLowerCase())) {
      console.log("✅ Highlighting element:", el, "with text:", text);
      el.classList.add("ai-highlight");
      found = true;

      // Add a single event listener to the highlighted element
      el.addEventListener('click', handleHighlightClick);
    }
  });

  if (!found) {
    console.log("❌ No clickable elements matched for:", keyword);
  }
}

// Handler for the click event on a highlighted element
function handleHighlightClick() {
  // Un-highlight the element
  this.classList.remove("ai-highlight");

  // Send a message to background.js to request the next step
  chrome.runtime.sendMessage({ action: "stepComplete" });
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlight") {
    highlightClickableElements(request.text);
  }
});