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

const API_URL = "http://127.0.0.1:8080/ask"; // change port if needed

const form = document.getElementById("search-form");
const input = document.getElementById("inputbox");
const messages = document.getElementById("messages");

// Get the active tab's hostname (e.g., "spotify.com")
async function getActiveHostname() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	try {
		const url = new URL(tab.url);
		return url.hostname; // "spotify.com"
	} catch {
		return "";
	}
}

// Render plain text with basic linebreaks
function renderText(text) {
	messages.innerHTML = "";
	const pre = document.createElement("pre");
	pre.style.whiteSpace = "pre-wrap";
	pre.style.wordBreak = "break-word";
	pre.textContent = text || "No response.";
	messages.appendChild(pre);
}

// Build a good query string for the /ask endpoint
function buildQuery(hostname, task) {
	// You can keep this as a natural language question,
	// or use a structured style to steer the model:
	//
	// Structured prompt (recommended with your agent instructions):
	// return `DOMAIN: ${hostname}\nTASK: ${task}\n` +
	//        `Produce 4–8 numbered steps with **bold** UI labels and a safe fallback.`;
	//
	// Natural language version (works too):
	return (
		`How do I "${task}" on ${hostname}? ` +
		`Give 4–8 numbered steps with **bold** UI labels and a safe fallback.`
	);
}

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const task = (input.value || "").trim();
	messages.textContent = "Thinking…"; // Get current site automatically

	const hostname = await getActiveHostname();
	if (!hostname) {
		messages.textContent =
			"Could not detect the current tab’s website. Open a normal page and try again.";
		return;
	}
	if (!task) {
		messages.textContent =
			"Please enter what you want to do (e.g., “cancel subscription”).";
		return;
	}

	const query = buildQuery(hostname, task);

	try {
		const resp = await fetch(API_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query }),
		});

		if (!resp.ok) {
			renderText(`Server error (${resp.status}).`);
			return;
		}

		const data = await resp.json(); // Your /ask endpoint returns { text: "..." }
		renderText(data.text || "No response.");
	} catch (err) {
		renderText("Network error: " + err.message);
	}
});

// Optional: submit on Enter even if focus is still in the input
input.addEventListener("keydown", (e) => {
	if (e.key === "Enter") form.requestSubmit();
});

// Optional: autofocus for faster use
input.focus();
