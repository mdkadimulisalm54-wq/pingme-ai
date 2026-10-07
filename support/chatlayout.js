console.log("CHAT LAYOUT LOADED");
/* PingMe AI — Chat Layout */

(function () {

    const input = document.getElementById("chatInput");
    const chatArea = document.getElementById("chatArea");

    if (!input) return;

    const minHeight = 38;
    const maxHeight = 120;

    function resizeInput() {

        input.style.height = "auto";

        const height = Math.max(
            minHeight,
            Math.min(input.scrollHeight, maxHeight)
        );

        input.style.height = height + "px";

        input.style.overflowY =
            input.scrollHeight > maxHeight
                ? "auto"
                : "hidden";
    }

    input.style.resize = "none";
    input.style.minHeight = minHeight + "px";
    input.style.maxHeight = maxHeight + "px";
    input.style.overflowY = "hidden";

    input.style.background =
        "linear-gradient(135deg, #ffffff, #f4f8ff)";

    input.addEventListener("input", resizeInput);
    input.addEventListener("focus", resizeInput);

    input.addEventListener("keydown", function () {
        setTimeout(resizeInput, 0);
    });

    const observer = new MutationObserver(function () {

        if (chatArea) {
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        resizeInput();

    });

    if (chatArea) {
        observer.observe(chatArea, {
            childList: true
        });
    }

    resizeInput();

})();
