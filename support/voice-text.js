/* =========================================================
   PingMe AI — Voice to Text
   ========================================================= */

(() => {
    "use strict";

    const mic = document.getElementById("micButton");
    const input = document.getElementById("chatInput");

    if (!mic || !input) return;

    const Speech =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!Speech) return;

    const recognition = new Speech();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    let listening = false;
    let finalText = "";
    let ignoreOldMic = false;

    /* =====================================================
       STYLE
       ===================================================== */

    const style = document.createElement("style");

    style.textContent = `
        #micButton .voice-bars {
            display:none;
            align-items:center;
            justify-content:center;
            gap:2px;
            width:21px;
            height:21px;
        }

        #micButton .voice-bars span {
            display:block;
            width:2.5px;
            height:7px;
            border-radius:4px;
            background:currentColor;
            animation:pingmeVoiceBar .7s ease-in-out infinite;
        }

        #micButton .voice-bars span:nth-child(1) {
            animation-delay:0s;
        }

        #micButton .voice-bars span:nth-child(2) {
            animation-delay:.12s;
        }

        #micButton .voice-bars span:nth-child(3) {
            animation-delay:.24s;
        }

        #micButton .voice-bars span:nth-child(4) {
            animation-delay:.36s;
        }

        #micButton .voice-bars span:nth-child(5) {
            display:none;
        }

        #micButton.voice-listening .voice-bars {
            display:flex;
        }

        #micButton.voice-listening > svg {
            display:none;
        }

        @keyframes pingmeVoiceBar {
            0%,100% { height:6px; }
            50% { height:17px; }
        }
    `;

    document.head.appendChild(style);

    /* =====================================================
       START
       ===================================================== */

    function startVoice() {
        if (listening) return;

        listening = true;
        finalText = input.value.trim();

        mic.classList.add("voice-listening");

        try {
            recognition.start();
        } catch (e) {}
    }

    /* =====================================================
       STOP
       ===================================================== */

    function stopVoice() {
        listening = false;

        mic.classList.remove("voice-listening");

        try {
            recognition.stop();
        } catch (e) {}
    }

    /* =====================================================
       MIC
       ===================================================== */

    mic.addEventListener("click", event => {
        if (ignoreOldMic) return;

        event.preventDefault();

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
        let interim = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {
            const text =
                event.results[i][0].transcript.trim();

            if (event.results[i].isFinal) {
                if (text) {
                    finalText +=
                        (finalText ? " " : "") + text;
                }
            } else {
                interim += text;
            }
        }

        input.value =
            (finalText + " " + interim).trim();

        input.dispatchEvent(
            new Event("input", {
                bubbles: true
            })
        );
    };

    /* =====================================================
       RESTART WHILE LISTENING
       ===================================================== */

    recognition.onend = () => {
        if (!listening) return;

        setTimeout(() => {
            if (!listening) return;

            try {
                recognition.start();
            } catch (e) {}
        }, 100);
    };

    /* =====================================================
       ERROR
       ===================================================== */

    recognition.onerror = event => {
        if (
            event.error === "not-allowed" ||
            event.error === "service-not-allowed"
        ) {
            stopVoice();
        }
    };

})();
