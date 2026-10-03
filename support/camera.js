// PingMe AI — Camera Support

let pingmeCameraStream = null;

// Check camera support
function isCameraSupported() {
    return !!(
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function"
    );
}

// Start camera
async function startCamera(options = {}) {
    if (!isCameraSupported()) {
        console.warn("Camera is not supported.");
        return null;
    }

    try {
        const constraints = {
            video: {
                facingMode: options.facingMode || "environment"
            },
            audio: false
        };

        pingmeCameraStream =
            await navigator.mediaDevices.getUserMedia(constraints);

        console.log("Camera Started");

        return pingmeCameraStream;
    } catch (error) {
        console.error("Camera Start Error:", error);

        pingmeCameraStream = null;

        return null;
    }
}

// Stop camera
function stopCamera() {
    if (!pingmeCameraStream) {
        return;
    }

    pingmeCameraStream.getTracks().forEach(track => {
        track.stop();
    });

    pingmeCameraStream = null;

    console.log("Camera Stopped");
}

// Get current camera stream
function getCameraStream() {
    return pingmeCameraStream;
}

// Check whether camera is currently active
function isCameraActive() {
    return !!pingmeCameraStream;
}

console.log("Camera Support Connected");