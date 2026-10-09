// ==========================================================
// ADD MESSAGE — TYPING SUPPORT
// ==========================================================

function addMessage(text, sender, typing = false) {

  if (welcomeScreen) {
    welcomeScreen.style.display = "none";
  }

  const row = document.createElement("div");
  row.className = sender === "user"
    ? "message-row user"
    : "message-row ai";

  const box = document.createElement("div");
  box.className = "message-box";

  const message = document.createElement("div");
  message.className = "message";

  message.textContent = typing ? "" : text;
  box.appendChild(message);

  if (sender === "ai") {

    const actions = document.createElement("div");
    actions.className = "message-actions";

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "message-action-btn";
    copyBtn.textContent = "📋 Copy";

    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "✓ Copied";

        setTimeout(() => {
          copyBtn.textContent = "📋 Copy";
        }, 1500);
      } catch {
        copyBtn.textContent = "Copy failed";
      }
    };

    const linkBtn = document.createElement("button");
    linkBtn.type = "button";
    linkBtn.className = "message-action-btn";
    linkBtn.textContent = "🔗 Copy Link";

    linkBtn.onclick = async () => {
      const match = String(text).match(/https?:\/\/[^\s]+/i);

      if (!match) {
        linkBtn.textContent = "No link";
        setTimeout(() => {
          linkBtn.textContent = "🔗 Copy Link";
        }, 1500);
        return;
      }

      try {
        await navigator.clipboard.writeText(match[0]);
        linkBtn.textContent = "✓ Link Copied";

        setTimeout(() => {
          linkBtn.textContent = "🔗 Copy Link";
        }, 1500);
      } catch {
        linkBtn.textContent = "Copy failed";
      }
    };

    actions.append(copyBtn, linkBtn);
    box.appendChild(actions);
  }

  row.appendChild(box);
  chatArea.appendChild(row);

  chatArea.scrollTop = chatArea.scrollHeight;

  return row;
}