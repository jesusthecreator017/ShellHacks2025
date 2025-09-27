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