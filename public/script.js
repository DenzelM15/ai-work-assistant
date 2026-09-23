const state = {
  mode: "analyze",
  conversation: [],
  controller: null,
  isGenerating: false
};

const modeInfo = {
  analyze: {
    title: "Analyze",
    subtitle: "Understand information and turn it into action.",
    icon: "✦",
    welcome: "What are you working on?",
    description: "Give me the context and I'll help you understand it, improve it, or turn it into your next action.",
    placeholder: "Paste something here or tell me what you need analyzed...",
    hint: "Paste text, ask a question, or describe what you need."
  },

  apply: {
    title: "Job Application",
    subtitle: "Prepare smarter for your next opportunity.",
    icon: "💼",
    welcome: "Let's strengthen your application.",
    description: "Paste a job description and I'll help you understand what the employer is looking for.",
    placeholder: "Paste the job description here...",
    hint: "Include the full job description for better analysis."
  },

  email: {
    title: "Write Email",
    subtitle: "Create clear, professional messages.",
    icon: "✉",
    welcome: "What do you need to say?",
    description: "Give me the situation and I'll turn it into a natural professional email.",
    placeholder: "Describe the situation and what you want to communicate...",
    hint: "Tell me who you're writing to and what you need to say."
  },

  summarize: {
    title: "Summarize",
    subtitle: "Turn long information into useful essentials.",
    icon: "☰",
    welcome: "Let's simplify it.",
    description: "Paste an article, document, notes, or any information you want condensed.",
    placeholder: "Paste the content you want summarized...",
    hint: "Longer content works well here."
  },

  brainstorm: {
    title: "Brainstorm",
    subtitle: "Turn problems into practical possibilities.",
    icon: "💡",
    welcome: "Let's generate some ideas.",
    description: "Describe your goal, problem, or project and we'll explore useful directions.",
    placeholder: "What are you trying to build, improve, solve, or achieve?",
    hint: "Give me your goal and any constraints you have."
  },

  code: {
    title: "Code",
    subtitle: "Build, debug and solve technical problems.",
    icon: "</>",
    welcome: "What are we building?",
    description: "Share your code, error, or technical problem and I'll help you work through it.",
    placeholder: "Paste your code, error message, or explain the problem...",
    hint: "Include the relevant code and error message if possible."
  }
};

const contentInput = document.getElementById("contentInput");
const targetContactInput = document.getElementById("targetContactInput");
const contactField = document.getElementById("contactField");

const generateBtn = document.getElementById("generateBtn");
const stopBtn = document.getElementById("stopBtn");

const responseSection = document.getElementById("responseSection");
const responseBody = document.getElementById("responseBody");
const responseStatus = document.getElementById("responseStatus");

const suggestions = document.getElementById("suggestions");

const charCount = document.getElementById("charCount");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

const themeBtn = document.getElementById("themeBtn");

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");

const clearInputBtn = document.getElementById("clearInputBtn");
const clearResponseBtn = document.getElementById("clearResponseBtn");
const copyBtn = document.getElementById("copyBtn");
const regenerateBtn = document.getElementById("regenerateBtn");
const newChatBtn = document.getElementById("newChatBtn");

const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const currentModeIcon = document.getElementById("currentModeIcon");

const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeText = document.getElementById("welcomeText");
const inputHint = document.getElementById("inputHint");


// --------------------------------------------------
// THEME
// --------------------------------------------------

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  localStorage.setItem("ai-theme", theme);

  themeBtn.textContent = theme === "dark" ? "☀" : "☾";
  themeBtn.title = theme === "dark"
    ? "Switch to light mode"
    : "Switch to dark mode";
}

const savedTheme = localStorage.getItem("ai-theme");

applyTheme(
  savedTheme ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
);

themeBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");

  applyTheme(current === "dark" ? "light" : "dark");
});


// --------------------------------------------------
// TOAST
// --------------------------------------------------

let toastTimer;

function showToast(message, icon = "✓") {
  toastMessage.textContent = message;
  document.getElementById("toastIcon").textContent = icon;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}


// --------------------------------------------------
// MODE
// --------------------------------------------------

function setMode(mode) {
  if (!modeInfo[mode]) {
    mode = "analyze";
  }

  state.mode = mode;

  const info = modeInfo[mode];

  pageTitle.textContent = info.title;
  pageSubtitle.textContent = info.subtitle;

  currentModeIcon.textContent = info.icon;

  welcomeTitle.textContent = info.welcome;
  welcomeText.textContent = info.description;

  contentInput.placeholder = info.placeholder;
  inputHint.textContent = info.hint;

  // Sidebar modes
  document.querySelectorAll(".side-mode").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.mode === mode
    );
  });

  // Main mode cards
  document.querySelectorAll(".mode-card").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.mode === mode
    );
  });

  // Contact field only for email
  if (mode === "email") {
    contactField.classList.remove("hidden");
  } else {
    contactField.classList.add("hidden");
  }

  closeSidebar();
}


// --------------------------------------------------
// MODE EVENTS
// --------------------------------------------------

document.querySelectorAll("[data-mode]").forEach(button => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
  });
});


// --------------------------------------------------
// CHARACTER COUNT
// --------------------------------------------------

function updateCharCount() {
  charCount.textContent =
    `${contentInput.value.length.toLocaleString()} / 10,000`;
}

contentInput.addEventListener("input", updateCharCount);


// --------------------------------------------------
// MARKDOWN RENDERER
// --------------------------------------------------

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMarkdown(markdown) {
  let html = escapeHtml(markdown);

  // Code blocks
  html = html.replace(
    /```(?:([\w+-]+)\n)?([\s\S]*?)```/g,
    (_, language, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    }
  );

  // Inline code
  html = html.replace(
    /`([^`\n]+)`/g,
    "<code>$1</code>"
  );

  // Bold
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  // Italic
  html = html.replace(
    /\*(.*?)\*/g,
    "<em>$1</em>"
  );

  // Headings
  html = html.replace(
    /^### (.*)$/gm,
    "<h3>$1</h3>"
  );

  html = html.replace(
    /^## (.*)$/gm,
    "<h2>$1</h2>"
  );

  html = html.replace(
    /^# (.*)$/gm,
    "<h1>$1</h1>"
  );

  // Unordered lists
  html = html.replace(
    /(?:^|\n)([-*] .+(?:\n[-*] .+)*)/g,
    match => {
      const items = match
        .trim()
        .split("\n")
        .map(line => `<li>${line.replace(/^[-*] /, "")}</li>`)
        .join("");

      return `<ul>${items}</ul>`;
    }
  );

  // Ordered lists
  html = html.replace(
    /(?:^|\n)((?:\d+\. .+(?:\n|$))+)/g,
    match => {
      const items = match
        .trim()
        .split("\n")
        .filter(Boolean)
        .map(line => `<li>${line.replace(/^\d+\. /, "")}</li>`)
        .join("");

      return `<ol>${items}</ol>`;
    }
  );

  // Blockquotes
  html = html.replace(
    /^&gt; (.*)$/gm,
    "<blockquote>$1</blockquote>"
  );

  // Paragraphs
  html = html
    .split(/\n{2,}/)
    .map(block => {
      const trimmed = block.trim();

      if (!trimmed) return "";

      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<blockquote")
      ) {
        return trimmed;
      }

      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");

  return html;
}


// --------------------------------------------------
// GENERATION UI
// --------------------------------------------------

function setGenerating(generating) {
  state.isGenerating = generating;

  generateBtn.classList.toggle("hidden", generating);
  stopBtn.classList.toggle("hidden", !generating);

  contentInput.disabled = generating;
  targetContactInput.disabled = generating;

  responseStatus.textContent = generating
    ? "Generating response..."
    : "Response complete";
}


// --------------------------------------------------
// GENERATE
// --------------------------------------------------

async function generateResponse() {
  const content = contentInput.value.trim();

  if (!content) {
    showToast("Tell me what you need help with first.", "!");
    contentInput.focus();
    return;
  }

  if (state.isGenerating) {
    return;
  }

  state.controller = new AbortController();

  setGenerating(true);

  responseSection.classList.remove("hidden");
  suggestions.classList.add("hidden");

  responseBody.innerHTML = `
    <div class="typing">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  responseSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  const previousConversation = [...state.conversation];

  try {
    const response = await fetch("/api/assist", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        content,
        targetContactName: targetContactInput.value.trim(),
        mode: state.mode,
        conversation: previousConversation
      }),

      signal: state.controller.signal
    });

    if (!response.ok) {
      let errorMessage = "AI request failed.";

      try {
        const data = await response.json();

        if (data?.error) {
          errorMessage = data.error;
        }
      } catch {
        // Response was not JSON.
      }

      throw new Error(errorMessage);
    }

    if (!response.body) {
      throw new Error("The server did not return a response stream.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let assistantText = "";

    responseBody.innerHTML = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, {
        stream: true
      });

      assistantText += chunk;

      responseBody.innerHTML =
        renderMarkdown(assistantText);

      responseBody.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }

    if (!assistantText.trim()) {
      throw new Error("The AI returned an empty response.");
    }

    // Save conversation only after successful completion.
    state.conversation.push({
      role: "user",
      content
    });

    state.conversation.push({
      role: "assistant",
      content: assistantText
    });

    // Clear inputs after successful generation.
    contentInput.value = "";
    targetContactInput.value = "";

    updateCharCount();

    showToast("Response generated successfully.");

  } catch (error) {

    if (error.name === "AbortError") {
      showToast("Generation stopped.", "■");
      responseStatus.textContent = "Generation stopped";
      return;
    }

    console.error(error);

    responseBody.innerHTML = `
      <div>
        <h3>Something went wrong</h3>
        <p>${escapeHtml(error.message || "The AI request failed.")}</p>
        <p>
          Check your server/API status and try again.
        </p>
      </div>
    `;

    responseStatus.textContent = "Request failed";

    showToast("The request failed.", "!");
  } finally {
    setGenerating(false);
    state.controller = null;
  }
}


// --------------------------------------------------
// STOP
// --------------------------------------------------

function stopGeneration() {
  if (state.controller) {
    state.controller.abort();
  }
}

stopBtn.addEventListener("click", stopGeneration);


// --------------------------------------------------
// GENERATE BUTTON
// --------------------------------------------------

generateBtn.addEventListener("click", generateResponse);


// --------------------------------------------------
// ENTER SHORTCUT
// --------------------------------------------------

contentInput.addEventListener("keydown", event => {

  if (
    event.key === "Enter" &&
    (event.ctrlKey || event.metaKey)
  ) {
    event.preventDefault();

    generateResponse();
  }

});


// --------------------------------------------------
// CLEAR INPUT
// --------------------------------------------------

clearInputBtn.addEventListener("click", () => {

  contentInput.value = "";
  targetContactInput.value = "";

  updateCharCount();

  contentInput.focus();

});


// --------------------------------------------------
// COPY RESPONSE
// --------------------------------------------------

copyBtn.addEventListener("click", async () => {

  const text = responseBody.innerText.trim();

  if (!text) {
    showToast("There is no response to copy.", "!");
    return;
  }

  try {

    await navigator.clipboard.writeText(text);

    showToast("Response copied.");

  } catch (error) {

    console.error(error);

    showToast("Could not copy the response.", "!");
  }

});


// --------------------------------------------------
// REGENERATE
// --------------------------------------------------

regenerateBtn.addEventListener("click", async () => {

  if (state.isGenerating) {
    return;
  }

  if (state.conversation.length < 2) {
    showToast("Generate a response first.", "!");
    return;
  }

  const lastAssistant =
    state.conversation[state.conversation.length - 1];

  const lastUser =
    state.conversation[state.conversation.length - 2];

  if (
    lastAssistant?.role !== "assistant" ||
    lastUser?.role !== "user"
  ) {
    showToast("There is no response to regenerate.", "!");
    return;
  }

  // Remove the previous assistant answer.
  state.conversation =
    state.conversation.slice(0, -1);

  const request = lastUser.content;

  state.controller = new AbortController();

  setGenerating(true);

  responseBody.innerHTML = `
    <div class="typing">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  try {

    const response = await fetch("/api/assist", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        content: request,
        targetContactName: targetContactInput.value.trim(),
        mode: state.mode,
        conversation: state.conversation
      }),

      signal: state.controller.signal
    });

    if (!response.ok) {

      let errorMessage = "Regeneration failed.";

      try {
        const data = await response.json();

        if (data?.error) {
          errorMessage = data.error;
        }

      } catch {
        // Ignore JSON parsing errors.
      }

      throw new Error(errorMessage);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let assistantText = "";

    responseBody.innerHTML = "";

    while (true) {

      const { value, done } =
        await reader.read();

      if (done) break;

      assistantText += decoder.decode(value, {
        stream: true
      });

      responseBody.innerHTML =
        renderMarkdown(assistantText);
    }

    state.conversation.push({
      role: "assistant",
      content: assistantText
    });

    responseStatus.textContent =
      "Response regenerated";

    showToast("Response regenerated.");

  } catch (error) {

    if (error.name === "AbortError") {
      showToast("Regeneration stopped.", "■");
      return;
    }

    console.error(error);

    responseBody.innerHTML = `
      <h3>Regeneration failed</h3>
      <p>${escapeHtml(error.message || "Please try again.")}</p>
    `;

    showToast("Regeneration failed.", "!");
  } finally {

    setGenerating(false);
    state.controller = null;
  }

});


// --------------------------------------------------
// CLEAR RESPONSE
// --------------------------------------------------

clearResponseBtn.addEventListener("click", () => {

  responseSection.classList.add("hidden");

  responseBody.innerHTML = "";

  suggestions.classList.remove("hidden");

});


// --------------------------------------------------
// NEW CHAT
// --------------------------------------------------

newChatBtn.addEventListener("click", () => {

  if (state.isGenerating) {
    showToast("Stop the current response first.", "!");
    return;
  }

  state.conversation = [];

  contentInput.value = "";
  targetContactInput.value = "";

  updateCharCount();

  responseBody.innerHTML = "";

  responseSection.classList.add("hidden");

  suggestions.classList.remove("hidden");

  setMode("analyze");

  contentInput.focus();

  showToast("New workspace started.");

});


// --------------------------------------------------
// QUICK SUGGESTIONS
// --------------------------------------------------

document.querySelectorAll(".suggestion").forEach(button => {

  button.addEventListener("click", () => {

    const text = button.dataset.suggestion;

    contentInput.value = text;

    updateCharCount();

    contentInput.focus();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  });

});


// --------------------------------------------------
// MOBILE SIDEBAR
// --------------------------------------------------

function openSidebar() {

  sidebar.classList.add("open");

  sidebarOverlay.classList.remove("hidden");

}

function closeSidebar() {

  sidebar.classList.remove("open");

  sidebarOverlay.classList.add("hidden");

}

mobileMenuBtn.addEventListener("click", openSidebar);

sidebarOverlay.addEventListener("click", closeSidebar);


// --------------------------------------------------
// INITIALIZE
// --------------------------------------------------

setMode("analyze");

updateCharCount();

contentInput.focus();
