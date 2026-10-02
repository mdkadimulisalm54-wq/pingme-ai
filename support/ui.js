// PingMe AI — UI Support
// Smooth Entry Animation

(() => {
    "use strict";

    // Prevent creating the animation more than once
    if (document.getElementById("pingme-entry-screen")) return;

    const style = document.createElement("style");

    style.textContent = `
        #pingme-entry-screen {
            position: fixed;
            inset: 0;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
                radial-gradient(circle at center, #202040 0%, #0b0b16 45%, #050509 100%);
            overflow: hidden;
            opacity: 1;
            transition: opacity 0.8s ease;
        }

        #pingme-entry-screen.hide {
            opacity: 0;
            pointer-events: none;
        }

        .pingme-entry-content {
            text-align: center;
            transform: translateY(20px) scale(0.96);
            opacity: 0;
            animation: pingmeEntryContent 1.2s ease forwards;
        }

        .pingme-entry-logo {
            width: 82px;
            height: 82px;
            margin: 0 auto 22px;
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: linear-gradient(135deg, #6c63ff, #9b5cff);
            box-shadow:
                0 0 35px rgba(120, 100, 255, 0.45),
                0 0 80px rgba(120, 100, 255, 0.18);
            animation: pingmeLogo 2s ease-in-out infinite;
        }

        .pingme-entry-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }

        .pingme-entry-title {
            margin: 0;
            color: white;
            font-size: 34px;
            font-weight: 700;
            letter-spacing: -1px;
        }

        .pingme-entry-subtitle {
            margin-top: 10px;
            color: rgba(255,255,255,0.65);
            font-size: 15px;
        }

        .pingme-entry-loader {
            width: 110px;
            height: 3px;
            margin: 26px auto 0;
            overflow: hidden;
            border-radius: 20px;
            background: rgba(255,255,255,0.12);
        }

        .pingme-entry-loader span {
            display: block;
            width: 45%;
            height: 100%;
            border-radius: inherit;
            background: white;
            animation: pingmeLoader 1.2s ease-in-out infinite;
        }

        @keyframes pingmeEntryContent {
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        @keyframes pingmeLogo {
            0%, 100% {
                transform: scale(1);
            }

            50% {
                transform: scale(1.06);
            }
        }

        @keyframes pingmeLoader {
            0% {
                transform: translateX(-120%);
            }

            100% {
                transform: translateX(250%);
            }
        }
    `;

    document.head.appendChild(style);

    const screen = document.createElement("div");
    screen.id = "pingme-entry-screen";

    screen.innerHTML = `
        <div class="pingme-entry-content">
            <div class="pingme-entry-logo">
                <img src="icon-192.png" alt="PingMe AI">
            </div>
            <h1 class="pingme-entry-title">PingMe AI</h1>
            <div class="pingme-entry-subtitle">
                Welcome back
            </div>
            <div class="pingme-entry-loader">
                <span></span>
            </div>
        </div>
    `;

    document.body.appendChild(screen);

    // Automatically enter the app
    setTimeout(() => {
        screen.classList.add("hide");

        setTimeout(() => {
            screen.remove();
            style.remove();
        }, 850);

    }, 2300);

})();
