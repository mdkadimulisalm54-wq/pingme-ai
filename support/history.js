// PingMe AI — History Support

const PINGME_HISTORY_KEY = "pingme_chat_history";

// Get all saved chat history
function getChatHistory() {
    try {
        const history = localStorage.getItem(PINGME_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error("Failed to load chat history:", error);
        return [];
    }
}

// Save chat history
function saveChatHistory(history) {
    try {
        localStorage.setItem(
            PINGME_HISTORY_KEY,
            JSON.stringify(history)
        );
    } catch (error) {
        console.error("Failed to save chat history:", error);
    }
}

// Add a new chat to history
function addChatToHistory(chat) {
    const history = getChatHistory();

    history.push({
        ...chat,
        timestamp: Date.now()
    });

    saveChatHistory(history);
}

// Remove all saved chat history
function clearChatHistory() {
    try {
        localStorage.removeItem(PINGME_HISTORY_KEY);
        console.log("Chat History Cleared");
    } catch (error) {
        console.error("Failed to clear chat history:", error);
    }
}

// Get the latest chat
function getLatestChat() {
    const history = getChatHistory();

    if (history.length === 0) {
        return null;
    }

    return history[history.length - 1];
}

console.log("History Support Connected");