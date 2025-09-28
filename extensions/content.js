
console.log("PathFinder content script loaded on", window.location.href);

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

// Listen for background.js messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlight") {
    highlightClickableElements(request.text);
  }
});

let lastKeyword = ""; // Store the last keyword for re-highlighting

const observer = new MutationObserver(() => {
  if (lastKeyword) {
    highlightClickableElements(lastKeyword);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

function highlightClickableElements(keyword) {
  lastKeyword = keyword; // Update the last keyword
  // Existing logic...
}