// ADD THIS WRAPPER so elements exist before we query them
document.addEventListener("DOMContentLoaded", () => {
	const API_URL = "http://127.0.0.1:8080/ask"; // unchanged

	const form = document.getElementById("search-form");
	const input = document.getElementById("inputbox");
	const messages = document.getElementById("messages");
	const messagesBox = document.getElementById("messages-box");
	const arrowBtn = document.getElementById("button-1");
	const historyBtn = document.getElementById("button-3"); // —— GLOBAL (not per-site) persistence via localStorage ——

	const GLOBAL_STATE_KEY = "PF_LOCAL_LAST";

	function loadLastState() {
		try {
			const raw = localStorage.getItem(GLOBAL_STATE_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch (e) {
			console.warn("loadLastState error:", e);
			return null;
		}
	}

	function saveLastState(state) {
		try {
			localStorage.setItem(GLOBAL_STATE_KEY, JSON.stringify(state));
		} catch (e) {
			console.warn("saveLastState error:", e);
		}
	} // (keep your existing functions as-is)
	async function getActiveHostname() {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		try {
			return new URL(tab.url).hostname;
		} catch {
			return "";
		}
	}

	function renderText(text) {
		messages.innerHTML = "";
		const pre = document.createElement("pre");
		pre.style.whiteSpace = "pre-wrap";
		pre.style.wordBreak = "break-word";
		pre.textContent = text || "No response.";
		pre.style.color = "white";
		pre.style.fontSize = "12px";
		messages.appendChild(pre);
	}

	function buildQuery(hostname, task) {
		return (
			`How do I "${task}" on ${hostname}? ` +
			`Give 4–8 numbered steps with **bold** UI labels and a safe fallback.`
		);
	} // 🔹 Make the blue arrow actually submit the form

	if (arrowBtn) {
		arrowBtn.addEventListener("click", () => {
			form?.requestSubmit();
		});
	}

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const task = (input.value || "").trim();
		messages.textContent = "Thinking…";
		messages.style.color = "white";

		const hostname = await getActiveHostname();
		if (!hostname) return renderText("Open a normal page and try again.");
		if (!task) return renderText("Please enter what you want to do.");

		addToHistory(task);

		input.value = "";

		const query = buildQuery(hostname, task); // 🔹 Send to background (do NOT fetch here)

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
			renderText(resp.text || "No response."); // —— Save globally so it shows next time popup opens ——
			saveLastState({
				task,
				text: resp.text || "",
				ts: Date.now(),
			});
		});
	}); // Enter key submits

	input.addEventListener("keydown", (e) => {
		if (e.key === "Enter") form.requestSubmit();
	}); // Focus for convenience

	input.focus(); // —— Restore the last AI output globally on open ——

	(() => {
		const state = loadLastState();
		if (state) {
			if (state.task) input.value = state.task; // optional: repopulate last task
			if (state.text) renderText(state.text); // show last AI response
		}
	})();

	let searchHistory = [];
	let historyVisible = false;

	const historyContainer = document.createElement("div");
	historyContainer.id = "historyContainer";
	historyContainer.style.display = "none";
	historyContainer.style.width = "250px";
	historyContainer.style.height = "275px";
	historyContainer.style.backgroundColor = "#778da9";
	historyContainer.style.marginLeft = "25px";
	historyContainer.style.borderRadius = "15px";
	historyContainer.style.overflowX = "hidden";
	historyContainer.style.overflowY = "auto";
	historyContainer.style.padding = "15px";
	historyContainer.style.boxSizing = "border-box";

	if (messagesBox) {
		messagesBox.before(historyContainer);
	} else {
		console.warn("Failed to get message box");
	}

	function renderHistory() {
		historyContainer.innerHTML = "";

		if (searchHistory.length === 0) {
			const empty = document.createElement("p");
			empty.textContent = "This is an empty history";
			empty.style.color = "white";
			historyContainer.appendChild(empty);
			return;
		}

		searchHistory.forEach((item) => {
			const historyItem = document.createElement("div");
			historyItem.textContent = item;
			historyItem.style.padding = "8px";
			historyItem.style.margin = "4px 0";
			historyItem.style.cursor = "pointer";
			historyItem.style.borderRadius = "4px";
			historyItem.style.backgroundColor = "#FFFFFF";
			historyItem.style.border = "1px solid #333"; // Hover effects

			historyItem.addEventListener("mouseenter", () => {
				historyItem.style.backgroundColor = "#c9c9c9";
			});
			historyItem.addEventListener("mouseleave", () => {
				historyItem.style.backgroundColor = "#FFFFFF";
			}); // Click to use history item

			historyItem.addEventListener("click", () => {
				input.value = item;
				toggleHistory(); // Close history
				form.requestSubmit(); // Auto-submit
			});

			historyContainer.appendChild(historyItem);
		});
	}

	function toggleHistory() {
		historyVisible = !historyVisible;
		if (historyVisible) {
			renderHistory();
			messagesBox.style.display = "none";
			historyContainer.style.display = "block";
		} else {
			historyContainer.style.display = "none";
			messagesBox.style.display = "block";
		}
	}
	function saveHistory() {
		try {
			// Try chrome storage first
			if (
				typeof chrome !== "undefined" &&
				chrome.storage &&
				chrome.storage.local
			) {
				chrome.storage.local.set({ searchHistory: searchHistory });
			} else {
				// Fallback to localStorage for Arc browser
				localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
			}
		} catch (error) {
			console.warn("Could not save history:", error);
		}
	}

	function loadHistory() {
		try {
			// Try chrome storage first
			if (
				typeof chrome !== "undefined" &&
				chrome.storage &&
				chrome.storage.local
			) {
				chrome.storage.local.get(["searchHistory"], (result) => {
					if (chrome.runtime.lastError) {
						console.warn(
							"Could not load from chrome storage, trying localStorage"
						);
						loadFromLocalStorage();
						return;
					}
					if (result.searchHistory && Array.isArray(result.searchHistory)) {
						searchHistory = result.searchHistory;
					}
				});
			} else {
				// Fallback to localStorage for Arc browser
				loadFromLocalStorage();
			}
		} catch (error) {
			console.warn("Could not load history:", error);
			loadFromLocalStorage();
		}
	}

	function loadFromLocalStorage() {
		try {
			const saved = localStorage.getItem("searchHistory");
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed)) {
					searchHistory = parsed;
				}
			}
		} catch (error) {
			console.warn("Could not load from localStorage:", error);
		}
	}

	function addToHistory(task) {
		if (!task || !task.trim()) return; // Don't add duplicate consecutive entries
		if (searchHistory[0] === task) return; // Add to beginning of array
		searchHistory.unshift(task); // Keep only last 10 items
		if (searchHistory.length > 10) {
			searchHistory = searchHistory.slice(0, 10);
		} // Save to chrome storage // Save to chrome storage with error handling // Save to chrome storage
		saveHistory();
	}

	loadHistory();

	historyBtn.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();
		toggleHistory();
	});
}); // <-- end DOMContentLoaded
