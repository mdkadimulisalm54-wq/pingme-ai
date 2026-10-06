// PingMe AI — AI Support
// =========================================================
// AI Model & Chat Session Support
// =========================================================

let activeAIModel = "gemini-3.8-flash";
let activeChatSession = null;


// =========================================================
// SET AI MODEL
// =========================================================

function setAIModel(modelName) {

    activeAIModel =
        modelName;

    activeChatSession =
        null;

    console.log(
        "AI Model Changed:",
        activeAIModel
    );
}


// =========================================================
// GET AI MODEL
// =========================================================

function getAIModel() {

    return activeAIModel;

}


// =========================================================
// SET AI SESSION
// =========================================================

function setAISession(session) {

    activeChatSession =
        session;

}


// =========================================================
// GET AI SESSION
// =========================================================

function getAISession() {

    return activeChatSession;

}


// =========================================================
// RESET AI SESSION
// =========================================================

function resetAISession() {

    activeChatSession =
        null;

    console.log(
        "AI Session Reset"
    );

}


// =========================================================
// GLOBAL AI API
// =========================================================

window.PingMeAI = {

    setModel:
        setAIModel,

    getModel:
        getAIModel,

    setSession:
        setAISession,

    getSession:
        getAISession,

    resetSession:
        resetAISession

};


// =========================================================
// GLOBAL FUNCTIONS
// =========================================================

window.setAIModel =
    setAIModel;

window.getAIModel =
    getAIModel;

window.setAISession =
    setAISession;

window.getAISession =
    getAISession;

window.resetAISession =
    resetAISession;


// =========================================================
// START AI SUPPORT
// =========================================================

console.log(
    "PingMe AI — AI Support Connected"
);