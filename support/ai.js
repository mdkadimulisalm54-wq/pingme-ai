// PingMe AI — AI Support

let activeAIModel = "gemini-3.8-flash";
let activeChatSession = null;

// Set the current AI model
function setAIModel(modelName) {
    activeAIModel = modelName;
    activeChatSession = null;

    console.log("AI Model Changed:", activeAIModel);
}

// Get the current AI model
function getAIModel() {
    return activeAIModel;
}

// Save the current AI chat session
function setAISession(session) {
    activeChatSession = session;
}

// Get the current AI chat session
function getAISession() {
    return activeChatSession;
}

// Reset the AI session
function resetAISession() {
    activeChatSession = null;
    console.log("AI Session Reset");
}

console.log("AI Support Connected");