/* 
document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("button-1");
    const inputBox = document.getElementById("inputbox");
    const messages = document.getElementById("messages");
    const form = document.getElementById("search-form");

    function handleSearch(){
        const query = inputBox.value.trim();
        messages.textContent = "";

        if(query === ""){
            messages.textContent = "Please Enter Some Text!";
            messages.style.color = "red";
            messages.style.font = "13px courier";
            messages.style.padding = "10px";
        } else {
            const p = document.createElement("p");
            p.textContent = `You Typed: ${query}`;
            p.style.color = "white";
            p.style.font = "13px courier";
            p.style.padding = "10px";
            messages.appendChild(p);
            inputBox.value = "";
        }
     }

   
    function addToHistory() {
        const query = searchButton.value.trim();
        if (query !== "") {
        const p = document.createElement("p");
        p.textContent = `History: ${query}`;
        p.style.color = "yellow";
        messages.appendChild(p);
        inputBox.value = "";
        }
    }

    searchButton.addEventListener("click", handleSearch);
    messages.addEventListener("click", addToHistory);
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSearch();
    });
});
*/

// popup.js

// ADD THIS WRAPPER so elements exist before we query them
document.addEventListener("DOMContentLoaded", () => {

  const API_URL = "http://127.0.0.1:8080/ask"; // unchanged

  const form = document.getElementById("search-form");
  const input = document.getElementById("inputbox");
  const messages = document.getElementById("messages");
  const arrowBtn = document.getElementById("button-1"); // the blue arrow

  // (keep your existing functions as-is)
  async function getActiveHostname() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try { return new URL(tab.url).hostname; } catch { return ""; }
  }

  function renderText(text) {
    messages.innerHTML = "";
    const pre = document.createElement("pre");
    pre.style.whiteSpace = "pre-wrap";
    pre.style.wordBreak = "break-word";
    pre.textContent = text || "No response.";
    messages.appendChild(pre);
  }

  function buildQuery(hostname, task) {
    return `How do I "${task}" on ${hostname}? ` +
           `Give 4–8 numbered steps with **bold** UI labels and a safe fallback.`;
  }

  // 🔹 Make the blue arrow actually submit the form
  if (arrowBtn) {
    arrowBtn.addEventListener("click", () => {
      form?.requestSubmit();
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const task = (input.value || "").trim();
    messages.textContent = "Thinking…";

    const hostname = await getActiveHostname();
    if (!hostname) return renderText("Open a normal page and try again.");
    if (!task)     return renderText("Please enter what you want to do.");

    const query = buildQuery(hostname, task);

    // 🔹 Send to background (do NOT fetch here)
    chrome.runtime.sendMessage({ type: "ASK", query }, (resp) => {
      if (chrome.runtime.lastError) {
        renderText("Extension error: " + chrome.runtime.lastError.message);
        return;
      }
      if (!resp) {
        renderText("Network error: no response from background.");
        return;
      }
      if (!resp.ok) {
        renderText("Network error: " + (resp.error || "Failed to fetch"));
        return;
      }
      renderText(resp.text || "No response.");
    });
  });

  // Enter key submits
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") form.requestSubmit();
  });

  // Focus for convenience
  input.focus();
}); // <-- end DOMContentLoaded
