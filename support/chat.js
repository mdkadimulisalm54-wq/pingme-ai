// PingMe AI — Chat Support
// Message Animations + Thinking Animation

(() => {
    "use strict";

    /* =========================================================
       STYLE
       ========================================================= */

    const style = document.createElement("style");

    style.textContent = `

        /* -----------------------------------------------------
           USER MESSAGE
           ----------------------------------------------------- */

        .user-message {
            animation: pingmeUserMessageIn 0.45s cubic-bezier(.2,.8,.2,1);
            transform-origin: bottom right;
        }


        @keyframes pingmeUserMessageIn {

            0% {
                opacity: 0;
                transform: translateY(12px) scale(0.92);
            }

            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }

        }


        /* -----------------------------------------------------
           AI MESSAGE
           ----------------------------------------------------- */

        .ai-message {
            animation: pingmeAIMessageIn 0.55s cubic-bezier(.2,.8,.2,1);
            transform-origin: bottom left;
        }


        @keyframes pingmeAIMessageIn {

            0% {
                opacity: 0;
                transform: translateY(14px) scale(0.97);
            }

            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }

        }


        /* -----------------------------------------------------
           AI ERROR
           ----------------------------------------------------- */

        .ai-error {
            animation: pingmeAIErrorIn 0.45s ease;
        }


        @keyframes pingmeAIErrorIn {

            0% {
                opacity: 0;
                transform: translateY(10px);
            }

            100% {
                opacity: 1;
                transform: translateY(0);
            }

        }


        /* -----------------------------------------------------
           THINKING
           ----------------------------------------------------- */

        .thinking.show {
            animation: pingmeThinkingIn 0.25s ease;
        }


        @keyframes pingmeThinkingIn {

            0% {
                opacity: 0;
                transform: translateY(5px);
            }

            100% {
                opacity: 1;
                transform: translateY(0);
            }

        }


        /* -----------------------------------------------------
           THINKING DOTS
           ----------------------------------------------------- */

        .thinking span {
            display: inline-flex;
            align-items: center;
        }

        .thinking span::after {
            content: "";
            width: 18px;
            display: inline-block;
            text-align: left;
            overflow: hidden;
            animation: pingmeThinkingDots 1.3s steps(4, end) infinite;
        }


        @keyframes pingmeThinkingDots {

            0% {
                content: "";
            }

            25% {
                content: ".";
            }

            50% {
                content: "..";
            }

            75% {
                content: "...";
            }

            100% {
                content: "";
            }

        }


        /* -----------------------------------------------------
           REDUCE MOTION
           ----------------------------------------------------- */

        @media (prefers-reduced-motion: reduce) {

            .user-message,
            .ai-message,
            .ai-error,
            .thinking.show {
                animation: none;
            }

            .thinking span::after {
                animation: none;
                content: "...";
            }

        }

    `;

    document.head.appendChild(style);


    /* =========================================================
       CONNECTED
       ========================================================= */

    console.log(
        "Chat Support Connected"
    );

})();
