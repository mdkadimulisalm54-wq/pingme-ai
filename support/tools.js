// PingMe AI — Tools Support

const pingmeTools = {
    camera: {
        enabled: true
    },

    images: {
        enabled: true
    },

    files: {
        enabled: true
    },

    scanner: {
        enabled: true
    },

    voice: {
        speechToText: true,
        textToSpeech: true,
        visualization: true,
        processing: false,
        aiSpeaking: false
    }
};

// Get tool status
function getToolStatus(toolName) {
    return pingmeTools[toolName];
}

// Enable or disable a tool
function setToolEnabled(toolName, enabled) {
    if (!pingmeTools[toolName]) {
        console.warn("Unknown tool:", toolName);
        return;
    }

    pingmeTools[toolName].enabled = enabled;

    console.log("Tool Status Changed:", toolName, enabled);
}

// Set voice state
function setVoiceState(state, value) {
    if (!(state in pingmeTools.voice)) {
        console.warn("Unknown voice state:", state);
        return;
    }

    pingmeTools.voice[state] = value;

    console.log("Voice State Changed:", state, value);
}

// Get voice state
function getVoiceState(state) {
    return pingmeTools.voice[state];
}

// Reset voice states
function resetVoiceState() {
    pingmeTools.voice.processing = false;
    pingmeTools.voice.aiSpeaking = false;
}

console.log("Tools Support Connected");