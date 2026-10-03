// PingMe AI — Voice Support

let pingmeSpeechRecognition = null;
let voiceInputActive = false;


// Check Speech-to-Text support
function isSpeechRecognitionSupported() {
    return !!(
        window.SpeechRecognition ||
        window.webkitSpeechRecognition
    );
}


// Start Speech-to-Text
function startVoiceInput(language = "bn-BD", callbacks = {}) {

    if (!isSpeechRecognitionSupported()) {

        console.warn(
            "Speech Recognition is not supported."
        );

        if (typeof callbacks.onError === "function") {
            callbacks.onError(
                "Speech Recognition is not supported."
            );
        }

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


    pingmeSpeechRecognition.onstart = () => {

        voiceInputActive = true;

        if (typeof callbacks.onStart === "function") {
            callbacks.onStart();
        }

        console.log("Voice Input Started");
    };


    pingmeSpeechRecognition.onresult = (event) => {

        let finalText = "";

        let interimText = "";


        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            const transcript =
                event.results[i][0].transcript;


            if (event.results[i].isFinal) {

                finalText += transcript;

            } else {

                interimText += transcript;

            }
        }


        if (typeof callbacks.onResult === "function") {

            callbacks.onResult({

                finalText: finalText.trim(),

                interimText: interimText.trim()

            });

        }


        console.log(
            "Voice Result:",
            finalText || interimText
        );
    };


    pingmeSpeechRecognition.onend = () => {

        voiceInputActive = false;


        if (typeof callbacks.onEnd === "function") {
            callbacks.onEnd();
        }


        console.log("Voice Input Ended");
    };


    pingmeSpeechRecognition.onerror = (event) => {

        voiceInputActive = false;


        if (typeof callbacks.onError === "function") {

            callbacks.onError(
                event.error
            );

        }


        console.error(
            "Voice Input Error:",
            event.error
        );
    };


    try {

        pingmeSpeechRecognition.start();

    } catch (error) {

        voiceInputActive = false;

        console.error(
            "Voice Input Start Error:",
            error
        );

    }


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

        console.warn(
            "Voice Input Stop Error:",
            error
        );

    }


    voiceInputActive = false;
}


// Check current voice input state
function isVoiceInputActive() {

    return voiceInputActive;

}


console.log(
    "Voice Support Connected"
);
