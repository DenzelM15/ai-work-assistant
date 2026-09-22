# 💼 AI Career & Networking Assistant

A lightweight **Node.js** web application that reads messy job descriptions and instantly streams back bulleted summaries alongside personalized LinkedIn networking outreach. 

## 🔗 Live Application
👉 **[Try the Live Web App on Render](https://onrender.com)** *(Replace this with your real Render link!)*

## 🛠️ The Tech Stack
* **Backend:** Node.js (ES Modules), Express.js
* **AI Orchestration:** Vercel AI SDK
* **AI Model:** Google Gemini 3.6 Flash
* **Frontend:** Vanilla JavaScript, Semantic HTML5, CSS3

## ✨ Core Features
* **Word-by-Word Streaming:** Uses chunked HTTP data transfer to print responses onto the screen in real-time, eliminating loading spin screens.
* **Production-Safe Security:** Keeps secret developer keys completely isolated on the server using environment configuration systems. Keys are blocked from leaking online via `.gitignore`.
* **Zero-Bloat UI:** Built entirely with native Web Browser APIs (`fetch`, `TextDecoder`) to keep the frontend fast and perfectly responsive on mobile screens.
* **One-Tap Clipboard:** Includes a streamlined clipboard interface so users can instantly copy the generated outreach text block.

## 📦 How to Run Locally
1. Clone the project and install the package requirements:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root folder and add your key:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_secret_gemini_key_here
   ```
3. Start the application server run script:
   ```bash
   node index.js
   ```
