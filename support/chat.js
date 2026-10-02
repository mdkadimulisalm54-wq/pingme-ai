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

            display: block;

            width: fit-content;

            max-width: 78%;

            margin-top: 10px;
            margin-bottom: 10px;
            margin-left: auto;
            margin-right: 14px;

            padding: 13px 17px;

            box-sizing: border-box;

            border-radius:
                20px 20px 6px 20px;

            background:
                linear-gradient(
                    135deg,
                    #6c63ff,
                    #8b5cf6
                );

            color: #ffffff;

            font-size: 15px;

            line-height: 1.55;

            word-break: break-word;

            overflow-wrap: anywhere;

            box-shadow:
                0 8px 25px
                rgba(108, 99, 255, 0.22);

            animation:
                pingmeUserMessage
                0.45s
                cubic-bezier(.2,.8,.2,1)
                both;

            transform-origin:
                right bottom;

        }


        /* =====================================================
           AI MESSAGE
           ===================================================== */

        .ai-message {

            display: block;

            width: fit-content;

            max-width: 82%;

            margin-top: 10px;
            margin-bottom: 10px;
            margin-left: 14px;
            margin-right: auto;

            padding: 15px 18px;

            box-sizing: border-box;

            border-radius:
                20px 20px 20px 6px;

            background:
                rgba(255, 255, 255, 0.055);

            border:
                1px solid
                rgba(255, 255, 255, 0.09);

            color:
                rgba(255, 255, 255, 0.92);

            font-size: 15px;

            line-height: 1.65;

            word-break: break-word;

            overflow-wrap: anywhere;

            box-shadow:
                0 8px 28px
                rgba(0, 0, 0, 0.16);

            backdrop-filter:
                blur(12px);

            -webkit-backdrop-filter:
                blur(12px);

            animation:
                pingmeAIMessage
                0.5s
                cubic-bezier(.2,.8,.2,1)
                both;

            transform-origin:
                left bottom;

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
                8px 0 10px;

            font-size: 17px;

            line-height: 1.4;

            color: #ffffff;

        }


        /* =====================================================
           USER MESSAGE ANIMATION
           ===================================================== */

        @keyframes pingmeUserMessage {

            from {

                opacity: 0;

                transform:
                    translateY(14px)
                    translateX(12px)
                    scale(0.94);

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
                    translateY(14px)
                    translateX(-12px)
                    scale(0.94);

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
           
           IMPORTANT:
           এখানে display জোর করে দেওয়া হচ্ছে না।
           Existing JavaScript যেভাবে show/hide করে,
           সেটাই কাজ করবে।
           ===================================================== */

        #thinking {

            align-items: center;

            gap: 9px;

            margin:
                10px auto 10px 14px;

            padding:
                11px 15px;

            box-sizing: border-box;

            width: fit-content;

            border-radius:
                18px 18px 18px 6px;

            background:
                rgba(255,255,255,0.045);

            border:
                1px solid
                rgba(255,255,255,0.07);

            color:
                rgba(255,255,255,0.68);

            font-size: 14px;

        }


        /* =====================================================
           THINKING SPINNER
           ===================================================== */

        #thinking .spinner {

            width: 15px;

            height: 15px;

            flex-shrink: 0;

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

            display: inline-block;

            white-space: nowrap;

        }


        #thinking span::after {

            content: "";

            display: inline-block;

            width: 18px;

            text-align: left;

            animation:
                pingmeDots
                1.2s
                steps(4, end)
                infinite;

        }


        /* =====================================================
           THINKING ANIMATION
           ===================================================== */

        @keyframes pingmeSpinner {

            from {

                transform:
                    rotate(0deg);

            }

            to {

                transform:
                    rotate(360deg);

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
       DO NOT CHANGE CHAT AREA LAYOUT
       
       IMPORTANT:
       এখানে আর display:flex দেওয়া হচ্ছে না।
       ========================================================= */


    console.log(
        "PingMe AI — Chat Animation Connected"
    );

})();
