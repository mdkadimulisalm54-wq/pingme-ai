/* =========================================================
   PingMe AI — Voice to Text
   Mic → Speech Recognition → Chat Input
   ========================================================= */

(() => {
    "use strict";

    const mic = document.getElementById("micButton");
    const input = document.getElementById("chatInput");

    if (!mic || !input) return;

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!Recognition) {
        console.warn("Speech Recognition is not supported.");
        return;
    }

    const recognition = new Recognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    let listening = false;

    /* =====================================================
       STYLE
       ===================================================== */

    const style = document.createElement("style");

    style.textContent = `
        #micButton .voice-bars {
            display: none;
            align-items: center;
            justify-content: center;
            gap: 2px;
            width: 21px;
            height: 21px;
        }

        #micButton .voice-bars span {
            display: block;
            width: 2.5px;
            height: 8px;
            border-radius: 4px;
            background: currentColor;
            animation: pingmeVoiceBar .75s ease-in-out infinite;
        }

        #micButton .voice-bars span:nth-child(1) {
            animation-delay: 0s;
        }

        #micButton .voice-bars span:nth-child(2) {
            animation-delay: .12s;
        }

        #micButton .voice-bars span:nth-child(3) {
            animation-delay: .24s;
        }

        #micButton .voice-bars span:nth-child(4) {
            animation-delay: .36s;
        }

        #micButton .voice-bars span:nth-child(5) {
            display: none;
        }

        #micButton.voice-listening .voice-bars {
            display: flex;
        }

        #micButton.voice-listening > svg {
            display: none;
        }

        @keyframes pingmeVoiceBar {
            0%, 100% {
                height: 6px;
            }

            50% {
                height: 17px;
            }
        }
    `;

    document.head.appendChild(style);

    const bars = mic.querySelector(".voice-bars");
    const icon = mic.querySelector("svg");

    /* =====================================================
       START
       ===================================================== */

    function startVoice() {
        if (listening) return;

        listening = true;

        mic.classList.add("voice-listening");

        try {
            recognition.start();
        } catch (error) {
            console.warn("Voice start:", error);
        }
    }

    /* =====================================================
       STOP
       ===================================================== */

    function stopVoice() {
        if (!listening) return;

        listening = false;

        mic.classList.remove("voice-listening");

        try {
            recognition.stop();
        } catch (error) {
            console.warn("Voice stop:", error);
        }
    }

    /* =====================================================
       MIC BUTTON
       ===================================================== */

    mic.addEventListener("click", () => {
        if (listening) {
            stopVoice();
        } else {
            startVoice();
        }
    });

    /* =====================================================
       SPEECH RESULT
       ===================================================== */

    recognition.onresult = event => {
        let text = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
        }

        if (text.trim()) {
            input.value = text.trim();

            input.dispatchEvent(
                new Event("input", { bubbles: true })
            );
        }
    };

    /* =====================================================
       AUTO RESTART WHILE ACTIVE
       ===================================================== */

    recognition.onend = () => {
        if (!listening) return;

        try {
            recognition.start();
        } catch (error) {
            console.warn("Voice restart:", error);
        }
    };

    /* =====================================================
       ERROR
       ===================================================== */

    recognition.onerror = event => {
        console.warn("Voice error:", event.error);

        if (
            event.error === "not-allowed" ||
            event.error === "service-not-allowed"
        ) {
            stopVoice();
        }
    };

})();