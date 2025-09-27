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
        } else {
            const p = document.createElement("p");
            p.textContent = `You Typed: ${query}`;
            p.style.color = "white";
            p.style.padding = "10px";
            messages.appendChild(p);
            inputBox.value = "";
        }
    }

    searchButton.addEventListener("click", handleSearch);
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSearch();
    });
});