// PingMe AI — Camera Support

let pingmeCameraStream = null;


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

        // কিছু browser permissions API support করে না
        return true;
    }

}


// =========================================================
// START CAMERA
// =========================================================

async function startCamera(options = {}) {

    if (!isCameraSupported()) {

        console.warn("Camera is not supported.");

        return null;
    }


    const allowed =
        await requestCameraPermission();

    if (!allowed) {

        console.warn("Camera permission denied.");

        return null;
    }


    try {

        const constraints = {

            video: {

                facingMode:
                    options.facingMode || "environment"

            },

            audio: false

        };


        pingmeCameraStream =
            await navigator.mediaDevices.getUserMedia(
                constraints
            );


        console.log("Camera Started");

        return pingmeCameraStream;


    } catch (error) {

        console.error(
            "Camera Start Error:",
            error
        );


        pingmeCameraStream = null;

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
            track => track.stop()
        );


    pingmeCameraStream = null;


    console.log("Camera Stopped");

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

    stopCamera();

    return await startCamera({

        facingMode: "user"

    });

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

        case "SecurityError":
            return "Camera access is blocked.";

        default:
            return "Camera could not be started.";

    }

}


console.log("Camera Support Connected");