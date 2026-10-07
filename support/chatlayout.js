/* PingMe AI — Chat Layout */

(function () {

    const input = document.getElementById("chatInput");
    const chatArea = document.getElementById("chatArea");

    if (!input) return;

    const MIN_HEIGHT = 38;
    const MAX_HEIGHT = 120;

    function resizeInput() {

        input.style.height = "0px";

        const newHeight = Math.max(
            MIN_HEIGHT,
            Math.min(input.scrollHeight, MAX_HEIGHT)
        );

        input.style.height = newHeight + "px";

        input.style.overflowY =
            input.scrollHeight > MAX_HEIGHT
                ? "auto"
                : "hidden";
    }

    function resetInput() {

        input.value = "";
        input.style.height = MIN_HEIGHT + "px";
        input.style.overflowY = "hidden";

    }

    input.style.resize = "none";
    input.style.minHeight = MIN_HEIGHT + "px";
    input.style.maxHeight = MAX_HEIGHT + "px";
    input.style.height = MIN_HEIGHT + "px";
    input.style.overflowY = "hidden";

    input.style.background =
        "linear-gradient(135deg, #ffffff, #f4f8ff)";

    input.addEventListener("input", resizeInput);

    input.addEventListener("focus", resizeInput);

    input.addEventListener("keydown", function () {
        setTimeout(resizeInput, 0);
    });

    if (chatArea) {

        const observer = new MutationObserver(function () {

            chatArea.scrollTop = chatArea.scrollHeight;

            if (input.value.trim() === "") {
                resetInput();
            } else {
                resizeInput();
            }

        });

        observer.observe(chatArea, {
            childList: true,
            subtree: true
        });
    }

    window.resizePingMeInput = resizeInput;
    window.resetPingMeInput = resetInput;

    resizeInput();

})();