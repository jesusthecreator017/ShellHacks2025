console.log("[PF] content.js loaded");

let steps = [];
let currentStep = 0;
let revealMode = "manual"; // "auto" = timed, "manual" = click to advance

// Inject CSS once
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

function clearHighlights() {
	document.querySelectorAll(".ai-highlight").forEach((el) => {
		el.classList.remove("ai-highlight");
	});
}

function highlightStep(label) {
	clearHighlights();
	if (!label) return;

	const clickables = document.querySelectorAll(
		"button, a, input[type=button], input[type=submit], " +
			"div[role=button], span[role=button], div[onclick], span[onclick]"
	);

	let found = false;
	clickables.forEach((el) => {
		const text = (
			el.innerText ||
			el.value ||
			el.getAttribute("aria-label") ||
			""
		).toLowerCase();
		if (text.includes(label.toLowerCase())) {
			el.classList.add("ai-highlight");
			found = true;
		}
	});

	console.log(found ? `✅ Highlighted: ${label}` : `❌ Not found: ${label}`);
}

function showNextStep() {
	if (currentStep < steps.length) {
		highlightStep(steps[currentStep]);
		currentStep++;
	} else {
		console.log("[PF] All steps shown.");
	}
}

function startAutoReveal() {
	currentStep = 0;
	const reveal = () => {
		if (currentStep < steps.length) {
			showNextStep();
			setTimeout(reveal, .1); // next step after 1s
		}
	};
	reveal();
}

// Listen for new steps from background.js
chrome.runtime.onMessage.addListener((msg) => {
	if (msg.action === "highlight-steps") {
		steps = msg.steps;
		currentStep = 0;

		if (revealMode === "auto") {
			startAutoReveal();
		} else {
			showNextStep(); // manual: show first step, wait for click
		}
	}

	if (msg.action === "highlight") {
		highlightStep(msg.text);
	}
});

// If manual mode → advance on click
document.addEventListener("click", () => {
	if (revealMode === "manual") showNextStep();
});
