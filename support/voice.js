
/* =========================================================
   PingMe AI — Voice Room
   Voice Chat • AI Speech • Auto Listening • Soft Sound
   ========================================================= */

(() => {
    "use strict";

    if (window.__pingmeVoiceRoomV3) return;
    window.__pingmeVoiceRoomV3 = true;

    const chatInput =
        document.getElementById("chatInput") ||
        document.getElementById("messageInput");

    const sendButton = document.getElementById("sendButton");

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const canSpeak = "speechSynthesis" in window;
    const $ = id => document.getElementById(id);

    let room = null;
    let recognition = null;
    let observer = null;

    let open = false;
    let listening = false;
    let speaking = false;
    let waiting = false;
    let lastResponse = "";
    let previousResponse = "";

    let responseTimer = null;
    let responseTimeout = null;
    let listenTimer = null;
    let audioContext = null;
    let voiceSession = 0;

    /* =====================================================
       SOFT VOICE ON / OFF SOUND
       ===================================================== */

    function playVoiceSound(closing = false) {
        try {
            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) return;

            if (!audioContext || audioContext.state === "closed") {
                audioContext = new AudioContextClass();
            }

            const ctx = audioContext;

            const play = () => {
                const now = ctx.currentTime;
                const notes = closing
                    ? [
                        { frequency: 660, start: 0, duration: 0.10 },
                        { frequency: 490, start: 0.10, duration: 0.14 }
                    ]
                    : [
                        { frequency: 490, start: 0, duration: 0.10 },
                        { frequency: 660, start: 0.10, duration: 0.14 }
                    ];

                notes.forEach(note => {
                    const oscillator = ctx.createOscillator();
                    const gain = ctx.createGain();

                    oscillator.type = "sine";
                    oscillator.frequency.setValueAtTime(
                        note.frequency,
                        now + note.start
                    );

                    gain.gain.setValueAtTime(
                        0.0001,
                        now + note.start
                    );

                    gain.gain.exponentialRampToValueAtTime(
                        0.055,
                        now + note.start + 0.025
                    );

                    gain.gain.exponentialRampToValueAtTime(
                        0.0001,
                        now + note.start + note.duration
                    );

                    oscillator.connect(gain);
                    gain.connect(ctx.destination);

                    oscillator.start(now + note.start);
                    oscillator.stop(
                        now + note.start + note.duration + 0.02
                    );
                });
            };

            if (ctx.state === "suspended") {
                ctx.resume().then(play).catch(() => {});
            } else {
                play();
            }
        } catch (_) {
            // Sound is optional; voice chat must still work.
        }
    }

    /* =====================================================
       STYLES
       ===================================================== */

    function addStyles() {
        if ($("pmVoiceRoomStyle")) return;

        const style = document.createElement("style");
        style.id = "pmVoiceRoomStyle";

        style.textContent = `
            #pingmeVoiceRoom {
                position:fixed;
                inset:0;
                z-index:999999;
                background:#fff;
                color:#111;
                font-family:Arial,system-ui,sans-serif;
                overflow:hidden;
            }

            #pingmeVoiceRoom * {
                box-sizing:border-box;
            }

            .pmvr-top {
                position:absolute;
                top:max(24px,env(safe-area-inset-top));
                left:26px;
                right:26px;
                display:flex;
                justify-content:space-between;
                align-items:center;
                z-index:5;
            }

            .pmvr-icon {
                width:60px;
                height:60px;
                border:0;
                border-radius:50%;
                background:#fff;
                display:grid;
                place-items:center;
                box-shadow:0 2px 25px #00000008;
                color:#111;
                cursor:pointer;
                -webkit-tap-highlight-color:transparent;
            }

            .pmvr-icon svg {
                width:30px;
                height:30px;
                fill:none;
                stroke:currentColor;
                stroke-width:2;
                stroke-linecap:round;
                stroke-linejoin:round;
            }

            .pmvr-orb-area {
                position:absolute;
                inset:100px 0 125px;
                display:grid;
                place-items:center;
            }

            .pmvr-orb {
                width:min(58vw,420px,42vh);
                aspect-ratio:1;
                border-radius:50%;
                position:relative;
                overflow:hidden;
                background:
                    radial-gradient(
                        ellipse at 35% 27%,
                        #82aaff 0%,
                        #4e7df0 37%,
                        #8faaf5 68%,
                        #c6d4ff 100%
                    );
                box-shadow:
                    inset 0 -8px 24px #fff4,
                    0 0 45px #7898f018;
                animation:pmvrBreath 5s ease-in-out infinite;
            }

            .pmvr-cloud {
                position:absolute;
                left:-15%;
                right:-15%;
                top:39%;
                height:35%;
                border-radius:50%;
                background:
                    radial-gradient(
                        ellipse,
                        #fff 0%,
                        #f7f9ffdc 30%,
                        #e9efff90 56%,
                        transparent 75%
                    );
                filter:blur(15px);
                animation:pmvrCloud 6s ease-in-out infinite;
            }

            .pmvr-cloud.two {
                top:56%;
                left:-10%;
                height:35%;
                opacity:.6;
                filter:blur(20px);
                animation-delay:-3s;
            }

            .pmvr-orb.listening {
                animation:pmvrListening 1.5s ease-in-out infinite;
            }

            .pmvr-orb.talking {
                animation:pmvrTalking .85s ease-in-out infinite;
            }

            .pmvr-status {
                position:absolute;
                top:-55px;
                left:20px;
                right:20px;
                text-align:center;
                color:#777;
                font-size:15px;
                min-height:22px;
                overflow-wrap:anywhere;
            }

            .pmvr-bottom {
                position:absolute;
                left:0;
                right:0;
                bottom:max(18px,env(safe-area-inset-bottom));
                display:flex;
                align-items:center;
                justify-content:center;
                gap:12px;
                padding:0 18px;
            }

            .pmvr-composer {
                height:60px;
                min-width:0;
                flex:1;
                max-width:440px;
                border-radius:40px;
                background:#fff;
                display:flex;
                align-items:center;
                gap:12px;
                padding:0 17px;
                box-shadow:0 2px 25px #0000000b;
            }

            .pmvr-plus {
                width:32px;
                height:38px;
                flex-shrink:0;
                display:grid;
                place-items:center;
                border:0;
                background:transparent;
                font-size:35px;
                font-weight:300;
                color:#111;
                cursor:pointer;
            }

            .pmvr-input {
                min-width:0;
                width:100%;
                border:0;
                outline:0;
                background:transparent;
                color:#222;
                font-size:17px;
            }

            .pmvr-input::placeholder {
                color:#888;
                opacity:1;
            }

            .pmvr-round {
                width:60px;
                height:60px;
                flex-shrink:0;
                border:0;
                border-radius:50%;
                display:grid;
                place-items:center;
                cursor:pointer;
                -webkit-tap-highlight-color:transparent;
            }

            .pmvr-mic {
                background:#f5f5f5;
                color:#111;
            }

            .pmvr-close {
                background:#050505;
                color:white;
            }

            .pmvr-round svg {
                width:27px;
                height:27px;
                fill:none;
                stroke:currentColor;
                stroke-width:2;
                stroke-linecap:round;
                stroke-linejoin:round;
            }

            @keyframes pmvrBreath {
                0%,100% { transform:scale(1); }
                50% { transform:scale(1.018); }
            }

            @keyframes pmvrListening {
                0%,100% { transform:scale(1); }
                50% { transform:scale(1.055); }
            }

            @keyframes pmvrTalking {
                0%,100% { transform:scale(.98); }
                50% { transform:scale(1.07); }
            }

            @keyframes pmvrCloud {
                0%,100% {
                    transform:translateY(-8px) scaleX(.95);
                }
                50% {
                    transform:translateY(12px) scaleX(1.12);
                }
            }

            @media(max-width:380px) {
                .pmvr-top {
                    left:18px;
                    right:18px;
                }

                .pmvr-icon,
                .pmvr-round {
                    width:54px;
                    height:54px;
                }

                .pmvr-bottom {
                    gap:8px;
                    padding:0 10px;
                }

                .pmvr-composer {
                    height:56px;
                    gap:7px;
                    padding:0 12px;
                }

                .pmvr-input {
                    font-size:15px;
                }
            }

            @media(prefers-reduced-motion:reduce) {
                .pmvr-orb,
                .pmvr-cloud {
                    animation-duration:8s;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       ICONS
       ===================================================== */

    function icon(name) {
        const paths = {
            menu:
                '<path d="M5 8h26M5 18h26M5 28h26"/>',

            settings:
                '<path d="M5 10h26M5 26h26"/>' +
                '<circle cx="13" cy="10" r="3"/>' +
                '<circle cx="24" cy="26" r="3"/>',

            mic:
                '<rect x="12" y="4" width="8" height="17" rx="4"/>' +
                '<path d="M7 16a9 9 0 0 0 18 0M16 25v5M11 30h10"/>',

            muted:
                '<rect x="12" y="4" width="8" height="17" rx="4"/>' +
                '<path d="M7 16a9 9 0 0 0 18 0M16 25v5M11 30h10M5 5l22 22"/>',

            close:
                '<path d="M7 7l18 18M25 7L7 25"/>'
        };

        return `
            <svg viewBox="0 0 32 32" aria-hidden="true">
                ${paths[name] || ""}
            </svg>
        `;
    }

    /* =====================================================
       CREATE VOICE ROOM
       ===================================================== */

    function createRoom() {
        if (room) return;

        addStyles();

        room = document.createElement("section");
        room.id = "pingmeVoiceRoom";

        room.innerHTML = `
            <div class="pmvr-top">
                <button class="pmvr-icon" id="pmvrMenu"
                    aria-label="Menu">${icon("menu")}</button>

                <button class="pmvr-icon" id="pmvrSettings"
                    aria-label="Voice settings">${icon("settings")}</button>
            </div>

            <div class="pmvr-orb-area">
                <div class="pmvr-status" id="pmvrStatus">
                    Starting voice...
                </div>

                <div class="pmvr-orb" id="pmvrOrb">
                    <div class="pmvr-cloud"></div>
                    <div class="pmvr-cloud two"></div>
                </div>
            </div>

            <div class="pmvr-bottom">
                <form class="pmvr-composer" id="pmvrForm">
                    <button type="button" class="pmvr-plus"
                        id="pmvrPlus" aria-label="More options">+</button>

                    <input class="pmvr-input" id="pmvrInput"
                        placeholder="Ask PingMe AI" autocomplete="off">
                </form>

                <button class="pmvr-round pmvr-mic" id="pmvrMic"
                    aria-label="Pause microphone">${icon("muted")}</button>

                <button class="pmvr-round pmvr-close" id="pmvrClose"
                    aria-label="Close voice room">${icon("close")}</button>
            </div>
        `;

        document.body.appendChild(room);

        $("pmvrClose").onclick = closeRoom;
        $("pmvrMic").onclick = toggleMic;

        $("pmvrForm").onsubmit = event => {
            event.preventDefault();
            sendTypedText();
        };

        $("pmvrPlus").onclick = () => {
            const button =
                document.getElementById("plusButton") ||
                document.getElementById("plusBtn");

            if (button) button.click();
            else setStatus("Attachments are available in the main chat.");
        };

        $("pmvrMenu").onclick = () => {
            closeRoom();

            const menu =
                document.getElementById("menuButton") ||
                document.getElementById("menuBtn");

            if (menu) menu.click();
        };

        $("pmvrSettings").onclick = () => {
            const settings =
                document.getElementById("settingsButton") ||
                document.getElementById("settingsBtn");

            if (settings) settings.click();
            else setStatus("Voice settings are not connected yet.");
        };
    }

    function setStatus(text) {
        const status = $("pmvrStatus");
        if (status) status.textContent = text;
    }

    function setOrb(mode) {
        const orb = $("pmvrOrb");
        if (!orb) return;

        orb.classList.remove("listening", "talking");

        if (mode) orb.classList.add(mode);
    }

    /* =====================================================
       STOP RECOGNITION
       ===================================================== */

    function stopRecognition() {
        const rec = recognition;

        recognition = null;
        listening = false;

        if (rec) {
            rec.onresult = null;
            rec.onerror = null;
            rec.onend = null;

            try {
                rec.stop();
            } catch (_) {}
        }
    }

    /* =====================================================
       LANGUAGE DETECTION
       ===================================================== */

    function detectLanguage(text) {
        const bn = (text.match(/[\u0980-\u09FF]/g) || []).length;
        const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
        const en = (text.match(/[A-Za-z]/g) || []).length;

        if (bn > en && bn > ar) return "bn-BD";
        if (ar > en) return "ar-SA";

        return "en-US";
    }

    /* =====================================================
       START LISTENING
       ===================================================== */

    function startListening() {
        if (!open || waiting || speaking || listening) return;

        clearTimeout(listenTimer);

        if (!Recognition) {
            setStatus("Voice recognition is not supported in this browser.");
            return;
        }

        const rec = new Recognition();
        recognition = rec;

        rec.lang =
            chatInput?.dataset.voiceLanguage ||
            "bn-BD";

        rec.continuous = false;
        rec.interimResults = true;

        listening = true;

        let finalText = "";

        setStatus("Listening...");
        setOrb("listening");

        const micButton = $("pmvrMic");
        if (micButton) micButton.innerHTML = icon("mic");

        rec.onresult = event => {
            if (recognition !== rec || !open) return;

            let interim = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                const result = event.results[i];
                const value = result[0].transcript.trim();

                if (result.isFinal && value) {
                    finalText += (finalText ? " " : "") + value;
                } else {
                    interim += (interim ? " " : "") + value;
                }
            }

            if (interim.trim()) {
                setStatus(interim.trim());
            }
        };

        rec.onerror = event => {
            if (recognition !== rec) return;

            listening = false;

            if (
                event.error === "not-allowed" ||
                event.error === "service-not-allowed"
            ) {
                setStatus("Enable microphone access in browser settings.");
                setOrb(null);
                return;
            }

            if (event.error === "no-speech" || event.error === "aborted") {
                return;
            }

            setStatus("Microphone issue. Tap the mic to retry.");
        };

        rec.onend = () => {
            if (recognition !== rec) return;

            recognition = null;
            listening = false;

            if (!open) return;

            if (finalText.trim()) {
                submitVoiceText(finalText.trim());
                return;
            }

            if (!waiting && !speaking) {
                setOrb(null);
                listenTimer = setTimeout(startListening, 450);
            }
        };

        try {
            rec.start();
        } catch (_) {
            recognition = null;
            listening = false;

            setStatus("Couldn't start microphone. Tap the mic to retry.");
            setOrb(null);
        }
    }

    /* =====================================================
       SEND SPEECH TO EXISTING AI
       ===================================================== */

    function submitVoiceText(text) {
        if (!open || !text || waiting) return;

        stopRecognition();

        if (!chatInput || !sendButton) {
            setStatus("Main chat input or Send button was not found.");
            return;
        }

        chatInput.value = text;
        chatInput.dataset.voiceLanguage = detectLanguage(text);

        chatInput.dispatchEvent(
            new Event("input", { bubbles: true })
        );

        previousResponse = getLastAIMessage();

        waiting = true;
        setStatus("Thinking...");
        setOrb(null);

        clearTimeout(responseTimeout);

        responseTimeout = setTimeout(() => {
            if (!waiting || !open) return;

            waiting = false;
            setStatus("No response detected. Listening again...");
            startListening();
        }, 60000);

        // Reuse PingMe's existing AI send handler.
        sendButton.click();
    }

    function sendTypedText() {
        const field = $("pmvrInput");
        const text = field?.value.trim();

        if (!text || !chatInput || !sendButton || waiting) return;

        field.value = "";
        submitVoiceText(text);
    }

    /* =====================================================
       FIND LATEST AI RESPONSE
       ===================================================== */

    function getLastAIMessage() {
        const area = document.getElementById("chatArea");
        if (!area) return "";

        const messages = area.querySelectorAll(
            ".message-row.ai .message, .ai-message"
        );

        if (!messages.length) return "";

        const last = messages[messages.length - 1].cloneNode(true);

        last.querySelectorAll(
            "button, .message-actions, .pingme-loader, " +
            "#pingmeAiLoaderRow, #pingmeFallbackLoader"
        ).forEach(element => element.remove());

        return (last.innerText || last.textContent || "")
            .replace(/\s+/g, " ")
            .trim();
    }

    /* =====================================================
       SPEAK AI RESPONSE
       ===================================================== */

    function speak(text) {
        if (!open || !canSpeak || !text) return;

        if (text === previousResponse || text === lastResponse) {
            waiting = false;
            startListening();
            return;
        }

        lastResponse = text;

        stopRecognition();

        try {
            speechSynthesis.cancel();
        } catch (_) {}

        const language = detectLanguage(text);
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = language;
        utterance.rate = 0.96;
        utterance.pitch = 1;
        utterance.volume = 1;

        const chooseVoice = () => {
            const voices = speechSynthesis.getVoices();

            const baseLanguage = language.split("-")[0].toLowerCase();

            const preferred =
                voices.find(voice =>
                    voice.lang?.toLowerCase() === language.toLowerCase()
                ) ||
                voices.find(voice =>
                    voice.lang?.toLowerCase().startsWith(baseLanguage)
                );

            if (preferred) utterance.voice = preferred;
        };

        chooseVoice();

        utterance.onstart = () => {
            if (!open) return;

            speaking = true;
            setOrb("talking");
            setStatus("Speaking...");
        };

        utterance.onend = () => {
            speaking = false;

            if (!open) return;

            setStatus("Listening...");
            setOrb(null);

            listenTimer = setTimeout(startListening, 450);
        };

        utterance.onerror = () => {
            speaking = false;

            if (!open) return;

            setStatus("Listening...");
            setOrb(null);

            listenTimer = setTimeout(startListening, 450);
        };

        try {
            speechSynthesis.speak(utterance);
        } catch (_) {
            speaking = false;
            setStatus("Speech output failed. Listening again...");
            startListening();
        }
    }

    /* =====================================================
       WATCH FOR AI REPLIES
       ===================================================== */

    function watchReplies() {
        const area = document.getElementById("chatArea");

        if (!area || observer) return;

        observer = new MutationObserver(() => {
            if (!open || !waiting) return;

            clearTimeout(responseTimer);

            responseTimer = setTimeout(() => {
                if (!open || !waiting) return;

                // Wait while the AI is still generating.
                if (
                    $("pingmeAiLoaderRow") ||
                    $("pingmeFallbackLoader")
                ) {
                    return;
                }

                const text = getLastAIMessage();

                if (!text || text === previousResponse) return;

                clearTimeout(responseTimeout);
                waiting = false;

                speak(text);
            }, 900);
        });

        observer.observe(area, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    /* =====================================================
       MIC PAUSE / RESUME
       ===================================================== */

    function toggleMic() {
        if (!open) return;

        if (listening) {
            stopRecognition();
            clearTimeout(listenTimer);

            const micButton = $("pmvrMic");
            if (micButton) micButton.innerHTML = icon("muted");

            setStatus("Microphone paused");
            setOrb(null);
        } else {
            startListening();
        }
    }

    /* =====================================================
       OPEN VOICE ROOM
       ===================================================== */

    function openRoom() {
        if (open) return;

        if (!Recognition) {
            alert("AI Voice needs a browser that supports speech recognition.");
            return;
        }

        if (!canSpeak) {
            alert("This browser does not support speech output.");
            return;
        }

        createRoom();

        open = true;
        waiting = false;
        speaking = false;
        lastResponse = "";
        previousResponse = "";
        voiceSession++;

        playVoiceSound(false);

        watchReplies();
        startListening();
    }

    /* =====================================================
       CLOSE VOICE ROOM
       ===================================================== */

    function closeRoom() {
        if (!open && !room) return;

        playVoiceSound(true);

        open = false;
        waiting = false;
        speaking = false;
        voiceSession++;

        clearTimeout(responseTimer);
        clearTimeout(responseTimeout);
        clearTimeout(listenTimer);

        stopRecognition();

        if (canSpeak) {
            try {
                speechSynthesis.cancel();
            } catch (_) {}
        }

        if (room) {
            room.remove();
            room = null;
        }
    }

    /* =====================================================
       PUBLIC FUNCTIONS
       ===================================================== */

    window.startAIVoice = openRoom;
    window.closeAIVoice = closeRoom;

    // Voice-to-text helper for existing buttons.
    window.startVoice = () => {
        if (!Recognition) {
            alert("Voice input is not supported in this browser.");
            return;
        }

        const input =
            document.getElementById("chatInput") ||
            document.getElementById("messageInput");

        if (!input) return;

        const rec = new Recognition();

        rec.lang = input.dataset.voiceLanguage || "bn-BD";
        rec.continuous = false;
        rec.interimResults = false;

        rec.onresult = event => {
            const text = event.results[0][0].transcript.trim();
            if (!text) return;

            input.value = text;
            input.dataset.voiceLanguage = detectLanguage(text);

            input.dispatchEvent(
                new Event("input", { bubbles: true })
            );
        };

        rec.onerror = error => {
            console.warn("PingMe voice input:", error.error);
        };

        try {
            rec.start();
        } catch (error) {
            console.warn("PingMe voice input couldn't start:", error);
        }
    };

    /* =====================================================
       EMPTY SEND OPENS VOICE ROOM
       ===================================================== */

    if (sendButton) {
        sendButton.addEventListener("click", event => {
            const input =
                document.getElementById("chatInput") ||
                document.getElementById("messageInput");

            const hasText = !!input?.value.trim();
            const hasFiles =
                window.PingMeAttachments?.hasFiles?.() || false;

            if (hasText || hasFiles) return;

            event.preventDefault();
            event.stopImmediatePropagation();

            openRoom();
        }, true);
    }

    window.addEventListener("beforeunload", closeRoom);

    console.log("PingMe AI Voice Room ready.");
})();
