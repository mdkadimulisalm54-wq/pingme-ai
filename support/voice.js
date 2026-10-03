// PingMe AI — Voice Support

let pingmeSpeechRecognition = null;
let pingmeSpeechSynthesis = window.speechSynthesis || null;

let voiceInputActive = false;
let aiSpeaking = false;

// Check Speech-to-Text support
function isSpeechRecognitionSupported() {
    return !!(
        window.SpeechRecognition ||
        window.webkitSpeechRecognition
    );
}

// Start Speech-to-Text
function startVoiceInput(language = "en-US") {
    if (!isSpeechRecognitionSupported()) {
        console.warn("Speech Recognition is not supported.");
        return null;
    }

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    pingmeSpeechRecognition = new Recognition();

    pingmeSpeechRecognition.lang = language;
    pingmeSpeechRecognition.continuous = false;
    pingmeSpeechRecognition.interimResults = true;

    voiceInputActive = true;

    setVoiceStateSafe("processing", false);

    pingmeSpeechRecognition.onstart = () => {
        voiceInputActive = true;
        console.log("Voice Input Started");
    };

    pingmeSpeechRecognition.onend = () => {
        voiceInputActive = false;
        console.log("Voice Input Ended");
    };

    pingmeSpeechRecognition.onerror = (event) => {
        voiceInputActive = false;
        console.error("Voice Input Error:", event.error);
    };

    pingmeSpeechRecognition.start();

    return pingmeSpeechRecognition;
}

// Stop Speech-to-Text
function stopVoiceInput() {
    if (!pingmeSpeechRecognition) {
        return;
    }

    try {
        pingmeSpeechRecognition.stop();
    } catch (error) {
        console.warn("Voice Input Stop Error:", error);
    }

    voiceInputActive = false;
}

// Speak AI response
function speakAI(text, language = "en-US", speed = 1) {
    if (!pingmeSpeechSynthesis || !text) {
        return;
    }

    stopAISpeaking();

    const utterance = new Speech