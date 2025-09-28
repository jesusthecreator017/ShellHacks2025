#ShellHacks2025
# Pathfinder

A Chrome extension that makes web browsing seamless and intuitive by taking in a natural text input request from a user, and then responding with a step-by-step guide on where to find specified information on **any** website.
Asking a question like **“Where are my classes?”** on your school website, **"How can I print out a package label?"** from the local post office, **"When does my Spotify Membership end?"** within Spotify's website, etc has never been easier with Pathfinder.

Pathfinder highlights the right buttons, guides you step by step, and smartly tracks your previous — no more endless clicking or getting lost in menus.  

---

## Inspiration
Our team drew inspiration from real struggles:  
- The idea that web browsing should feel **fluid**, not like a scavenger hunt. 
- Helping people at UPS (especially Spanish speakers) navigate returns online.  
- The frustration of finding information on clunky school websites.
- Students being unsure on where to find a credible and reliable academic research paper

We wanted to make the web more accessible for everyone — students, workers, and even those less tech-savvy.  

---

## What it does
- Uses the **Google ADK model** provided for Shell Hack's 2025 Google Cloud ADK/A2A Achallenge.  
- Scans a website’s **sitemap** and understands your request through the **Gemini 2.5 Flash Model**
- Highlights the exact buttons and paths you need to click
- Guides and directs the user **step by step**

---

## How we built it
- **Tech Stack:** HTML, CSS, JavaScript, Google ADK, Gemini 2.5 Flash Model
- **Tools:** VS Code (and vscode.dev), GitHub for collaboration, Git
- **Extra helpers:** ChatGPT, CSS resources, cheat sheets  

---

## Challenges we ran into
- Issues connecting the AI agent protocol with the extension itself and the UI
- MacOS version issues that blocked local VS Code updates (ended up switching to the web versionz)
- Git commit / push / pull sync issues while collaborating with different branches
- Making the UI be as simple to navigate whilst being useful for the user

---

## Accomplishments we're proud of
- Creating a tool that has **real-world usefulness** for people of all ages by making web navigation easier than ever
- Utilizing Google Cloud ADK to create agents that are specialized to solve the tasks
- Building a working **Google Chrome extension prototype** as first-time hackers.
- Presisting through tough Git and workflow issues as a team together 

---

## What we learned
- Hands-on practice with **Git, repos, and project management within a team effort**.  
- Setting up and using **brew, terminal tools, and efficient workflows that were delegated on each member's strengths**.  
- How much faster you learn when you’re building something real with a team. 

---

## Installation & Usage
1. Clone and download this repository.  
2. Open **Google Chrome** and navigate to: `chrome://extensions/`.  
3. Enable **Developer Mode** (top right).  
4. Click **Load unpacked** and select the project folder where Pathfinder was downloaded into.  
5. Pathfinder is ready to be used — just type your request and let it search for what you need!  

---

## Team
- **Galyn Ridley** – (All Hands/Presentation)  
- **Alvaro Canseco-Martinez** – (UI/Presentation)  
- **Jesus Gonzalez** – (UI/Backend)  
- **Adib Saeed** – (AI/Backend)  
