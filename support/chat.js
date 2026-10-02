// PingMe AI — Chat Support
// Message Bubble + Smooth Animation

(() => {
    "use strict";


    /* =========================================================
       CHAT MESSAGE STYLES
       ========================================================= */

    const style = document.createElement("style");

    style.textContent = `

        /* =====================================================
           USER MESSAGE
           ===================================================== */

        .user-message {

            align-self: flex-end;

            max-width: min(78%, 720px);

            margin: 10px 14px 10px auto;

            padding: 13px 17px;

            border-radius: 20px 20px 6px 20px;

            background:
                linear-gradient(
                    135deg,
                    #6c63ff,
                    #8b5cf6
                );

            color: #ffffff;

            font-size: 15px;

            line-height: 1.55;

            word-wrap: break-word;

            overflow-wrap: anywhere;

            box-shadow:
                0 8px 25px rgba(108, 99, 255, 0.22);

            animation:
                pingmeUserMessage
                0.42s
                cubic-bezier(.2,.8,.2,1)
                both;

            transform-origin: right bottom;

        }


        /* =====================================================
           AI MESSAGE
           ===================================================== */

        .ai-message {

            align-self: flex-start;

            max-width: min(82%, 760px);

            margin: 10px auto 10px 14px;

            padding: 15px 18px;

            border-radius: 20px 20px 20px 6px;

            background:
                rgba(255,255,255,0.055);

            border:
                1px solid rgba(255,255,255,0.09);

            color: rgba(255,255,255,0.92);

            font-size: 15px;

            line-height: 1.65;

            word-wrap: break-word;

            overflow-wrap: anywhere;

            box-shadow:
                0 8px 28px rgba(0,0,0,0.16);

            backdrop-filter: blur(12px);

            -webkit-backdrop-filter: blur(12px);

            animation:
                pingmeAIMessage
                0.48s
                cubic-bezier(.2,.8,.2,1)
                both;

            transform-origin: left bottom;

        }


        /* =====================================================
           AI TEXT
           ===================================================== */

        .ai-message strong {

            font-weight: 700;

            color: #ffffff;

        }


        .ai-message h3 {

            margin:
                8px 0
                10px;

            font-size: 17px;

            line-height: 1.35;

            color: #ffffff;

        }


        /* =====================================================
           USER MESSAGE ANIMATION
           ===================================================== */

        @keyframes pingmeUserMessage {

            from {

                opacity: 0;

                transform:
                    translateY(12px)
                    translateX(10px)
                    scale(0.96);

            }

            to {

                opacity: 1;

                transform:
                    translateY(0)
                    translateX(0)
                    scale(1);

            }

        }


        /* =====================================================
           AI MESSAGE ANIMATION
           ===================================================== */

        @keyframes pingmeAIMessage {

            from {

                opacity: 0;

                transform:
                    translateY(12px)
                    translateX(-10px)
                    scale(0.96);

            }

            to {

                opacity: 1;

                transform:
                    translateY(0)
                    translateX(0)
                    scale(1);

            }

        }


        /* =====================================================
           THINKING INDICATOR
           ===================================================== */

        #thinking {

            display: inline-flex;

            align-items: center;

            gap: 9px;

            margin:
                10px auto 10px 14px;

            padding:
                11px 15px;

            border-radius:
                18px 18px 18px 6px;

            background:
                rgba(255,255,255,0.045);

            border:
                1px solid rgba(255,255,255,0.07);

            color:
                rgba(255,255,255,0.68);

            font-size: 14px;

            animation:
                pingmeThinkingIn
                0.35s
                ease
                both;

        }


        /* =====================================================
           THINKING SPINNER
           ===================================================== */

        #thinking .spinner {

            width: 15px;

            height: 15px;

            border-radius: 50%;

            border:
                2px solid
                rgba(255,255,255,0.15);

            border-top-color:
                rgba(255,255,255,0.85);

            animation:
                pingmeSpinner
                0.8s
                linear
                infinite;

        }


        /* =====================================================
           THINKING TEXT
           ===================================================== */

        #thinking span {

            position: relative;

        }


        #thinking span::after {

            content: "";

            display: inline-block;

            width: 18px;

            text-align: left;

            animation:
                pingmeDots
                1.2s
                steps(4,end)
                infinite;

        }


        @keyframes pingmeThinkingIn {

            from {

                opacity: 0;

                transform:
                    translateY(8px);

            }

            to {

                opacity: 1;

                transform:
                    translateY(0);

            }

        }


        @keyframes pingmeSpinner {

            to {

                transform: rotate(360deg);

            }

        }


        @keyframes pingmeDots {

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


        /* =====================================================
           MOBILE
           ===================================================== */

        @media (max-width: 600px) {

            .user-message {

                max-width: 84%;

                margin-right: 10px;

                padding:
                    12px 15px;

                font-size: 14px;

            }


            .ai-message {

                max-width: 88%;

                margin-left: 10px;

                padding:
                    13px 15px;

                font-size: 14px;

            }


            #thinking {

                margin-left: 10px;

            }

        }

    `;


    document.head.appendChild(style);


    /* =========================================================
       MAKE CHAT AREA FLEX-FRIENDLY
       ========================================================= */

    const chatArea =
        document.getElementById("chatArea");


    if (chatArea) {

        chatArea.style.display =
            "flex";

        chatArea.style.flexDirection =
            "column";

    }


    console.log(
        "PingMe AI — Chat Animation Connected"
    );

})();
