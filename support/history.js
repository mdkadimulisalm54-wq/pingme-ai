// ==========================================================
// PingMe AI — History Support
// ==========================================================

const PINGME_HISTORY_KEY = "pingme_chat_history";


// ==========================================================
// GET HISTORY
// ==========================================================

function getChatHistory() {

  try {

    const saved =
      localStorage.getItem(
        PINGME_HISTORY_KEY
      );

    if (!saved) {
      return [];
    }

    const history =
      JSON.parse(saved);

    return Array.isArray(history)
      ? history
      : [];

  } catch (error) {

    console.error(
      "PingMe History Load Error:",
      error
    );

    return [];

  }

}


// ==========================================================
// SAVE HISTORY
// ==========================================================

function saveChatHistory(history) {

  try {

    localStorage.setItem(
      PINGME_HISTORY_KEY,
      JSON.stringify(history)
    );

    return true;

  } catch (error) {

    console.error(
      "PingMe History Save Error:",
      error
    );

    return false;

  }

}


// ==========================================================
// ADD CHAT TO HISTORY
// ==========================================================

function addChatToHistory(chat) {

  if (!chat) {
    return false;
  }

  const history =
    getChatHistory();

  history.push({

    ...chat,

    timestamp:
      Date.now()

  });

  return saveChatHistory(
    history
  );

}


// ==========================================================
// CLEAR HISTORY
// ==========================================================

function clearChatHistory() {

  try {

    localStorage.removeItem(
      PINGME_HISTORY_KEY
    );

    return true;

  } catch (error) {

    console.error(
      "PingMe History Clear Error:",
      error
    );

    return false;

  }

}


// ==========================================================
// GET LATEST CHAT
// ==========================================================

function getLatestChat() {

  const history =
    getChatHistory();

  if (!history.length) {
    return null;
  }

  return history[
    history.length - 1
  ];

}


// ==========================================================
// HISTORY SUPPORT READY
// ==========================================================

console.log(
  "PingMe AI — History Support Connected"
);