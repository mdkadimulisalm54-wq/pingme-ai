// PingMe AI — Complete Camera Support


let pingmeCameraStream = null;
let pingmeCameraFacingMode = "environment";


// =========================================================
// CAMERA SUPPORT CHECK
// =========================================================

function isCameraSupported() {

    return !!(
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function"
    );

}


// =========================================================
// CAMERA PERMISSION
// =========================================================

async function requestCameraPermission() {

    if (!isCameraSupported()) {

        console.warn("Camera is not supported.");

        return false;
    }

    try {

        const permission =
            await navigator.permissions.query({
                name: "camera"
            });

        return permission.state !== "denied";

    } catch (error) {

        // সব browser Permissions API support করে না
        return true;
    }

}


// =========================================================
// CAMERA ERROR MESSAGE
// =========================================================

function getCameraErrorMessage(error) {

    if (!error) {

        return "Camera could not be started.";

    }

    switch (error.name) {

        case "NotAllowedError":
            return "Camera permission was denied.";

        case "NotFoundError":
            return "No camera was found.";

        case "NotReadableError":
            return "Camera is already being used.";

        case "OverconstrainedError":
            return "The selected camera is not available.";

        case "SecurityError":
            return "Camera access is blocked.";

        case "AbortError":
            return "Camera startup was interrupted.";

        default:
            return "Camera could not be started.";

    }

}


// =========================================================
// CAMERA UI
// =========================================================

let cameraOverlay = null;
let cameraVideo = null;


// Create camera UI
function createCameraUI() {

    if (cameraOverlay) {

        return;
    }


    const style =
        document.createElement("style");


    style.id =
        "pingme-camera-style";


    style.textContent = `

        #pingme-camera-overlay {

            position: fixed;
            inset: 0;
            z-index: 99999;

            display: none;

            align-items: center;
            justify-content: center;

            background: rgba(0,0,0,0.92);

            padding: 20px;

        }


        #pingme-camera-panel {

            width: 100%;
            max-width: 480px;

            display: flex;
            flex-direction: column;

            gap: 14px;

        }


        #pingme-camera-video {

            width: 100%;

            aspect-ratio: 3 / 4;

            object-fit: cover;

            background: #111;

            border-radius: 20px;

            display: block;

        }


        #pingme-camera-controls {

            display: flex;

            align-items: center;

            justify-content: center;

            gap: 12px;

        }


        .pingme-camera-control {

            min-width: 52px;
            height: 48px;

            padding: 0 18px;

            border: none;
            border-radius: 24px;

            background: #fff;

            color: #111;

            font-size: 15px;

            font-weight: 600;

            cursor: pointer;

        }


        .pingme-camera-control.close {

            background: #d93025;

            color: #fff;

        }


        .pingme-camera-error {

            display: none;

            padding: 12px 14px;

            border-radius: 12px;

            background: rgba(255,255,255,0.1);

            color: #fff;

            text-align: center;

            font-size: 14px;

        }

    `;


    document.head.appendChild(style);


    cameraOverlay =
        document.createElement("div");


    cameraOverlay.id =
        "pingme-camera-overlay";


    cameraOverlay.innerHTML = `

        <div id="pingme-camera-panel">

            <video
                id="pingme-camera-video"
                autoplay
                playsinline>
            </video>


            <div
                id="pingme-camera-error"
                class="pingme-camera-error">
            </div>


            <div id="pingme-camera-controls">

                <button
                    type="button"
                    id="pingme-camera-switch"
                    class="pingme-camera-control">

                    Switch

                </button>


                <button
                    type="button"
                    id="pingme-camera-close"
                    class="pingme-camera-control close">

                    Close

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(cameraOverlay);


    cameraVideo =
        document.getElementById(
            "pingme-camera-video"
        );


    const switchButton =
        document.getElementById(
            "pingme-camera-switch"
        );


    const closeButton =
        document.getElementById(
            "pingme-camera-close"
        );


    switchButton.addEventListener(
        "click",
        async function () {

            await switchCamera();

        }
    );


    closeButton.addEventListener(
        "click",
        function () {

            closeCameraUI();

        }
    );


    cameraOverlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                cameraOverlay
            ) {

                closeCameraUI();

            }

        }
    );

}


// =========================================================
// SHOW CAMERA UI
// =========================================================

function showCameraUI() {

    createCameraUI();


    cameraOverlay.style.display =
        "flex";

}


// =========================================================
// HIDE CAMERA UI
// =========================================================

function hideCameraUI() {

    if (!cameraOverlay) {

        return;
    }


    cameraOverlay.style.display =
        "none";

}


// =========================================================
// CAMERA ERROR DISPLAY
// =========================================================

function showCameraError(message) {

    createCameraUI();


    const errorBox =
        document.getElementById(
            "pingme-camera-error"
        );


    if (!errorBox) {

        return;
    }


    errorBox.textContent =
        message;


    errorBox.style.display =
        "block";

}


// =========================================================
// HIDE CAMERA ERROR
// =========================================================

function hideCameraError() {

    const errorBox =
        document.getElementById(
            "pingme-camera-error"
        );


    if (!errorBox) {

        return;
    }


    errorBox.textContent = "";

    errorBox.style.display =
        "none";

}


// =========================================================
// START CAMERA
// =========================================================

async function startCamera(options = {}) {

    if (!isCameraSupported()) {

        showCameraError(
            "Camera is not supported in this browser."
        );

        return null;
    }


    const allowed =
        await requestCameraPermission();


    if (!allowed) {

        showCameraError(
            "Camera permission was denied."
        );

        return null;
    }


    stopCamera();


    const facingMode =
        options.facingMode ||
        pingmeCameraFacingMode;


    try {

        const constraints = {

            video: {

                facingMode:
                    facingMode

            },

            audio: false

        };


        pingmeCameraStream =
            await navigator.mediaDevices.getUserMedia(
                constraints
            );


        pingmeCameraFacingMode =
            facingMode;


        createCameraUI();

        showCameraUI();

        hideCameraError();


        cameraVideo.srcObject =
            pingmeCameraStream;


        try {

            await cameraVideo.play();

        } catch (error) {

            console.warn(
                "Camera video autoplay warning:",
                error
            );

        }


        console.log(
            "Camera Started"
        );


        return pingmeCameraStream;


    } catch (error) {

        console.error(
            "Camera Start Error:",
            error
        );


        pingmeCameraStream =
            null;


        showCameraError(
            getCameraErrorMessage(error)
        );


        return null;

    }

}


// =========================================================
// STOP CAMERA
// =========================================================

function stopCamera() {

    if (!pingmeCameraStream) {

        return;
    }


    pingmeCameraStream
        .getTracks()
        .forEach(
            track => {

                track.stop();

            }
        );


    pingmeCameraStream =
        null;


    if (cameraVideo) {

        cameraVideo.srcObject =
            null;

    }


    console.log(
        "Camera Stopped"
    );

}


// =========================================================
// CLOSE CAMERA
// =========================================================

function closeCameraUI() {

    stopCamera();

    hideCameraUI();

}


// =========================================================
// GET CAMERA STREAM
// =========================================================

function getCameraStream() {

    return pingmeCameraStream;

}


// =========================================================
// CAMERA ACTIVE CHECK
// =========================================================

function isCameraActive() {

    return !!pingmeCameraStream;

}


// =========================================================
// SWITCH CAMERA
// =========================================================

async function switchCamera() {

    if (!isCameraSupported()) {

        return null;
    }


    const newFacingMode =
        pingmeCameraFacingMode ===
        "environment"
            ? "user"
            : "environment";


    return await startCamera({

        facingMode:
            newFacingMode

    });

}


// =========================================================
// CAMERA BUTTON CONNECTION
// =========================================================

function connectCameraButton() {

    const cameraButton =
        document.getElementById(
            "cameraButton"
        );


    if (!cameraButton) {

        console.warn(
            "PingMe Camera: cameraButton not found."
        );

        return;
    }


    cameraButton.addEventListener(
        "click",
        async function () {

            if (isCameraActive()) {

                closeCameraUI();

                return;
            }


            await startCamera();

        }
    );


    console.log(
        "PingMe Camera Button Connected"
    );

}


// =========================================================
// PAGE CLEANUP
// =========================================================

window.addEventListener(
    "beforeunload",
    function () {

        stopCamera();

    }
);


// =========================================================
// INITIALIZE CAMERA SUPPORT
// =========================================================

function initializeCameraSupport() {

    createCameraUI();

    connectCameraButton();

    console.log(
        "Camera Support Connected"
    );

}


// =========================================================
// START CAMERA SUPPORT
// =========================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCameraSupport
    );

} else {

    initializeCameraSupport();

}