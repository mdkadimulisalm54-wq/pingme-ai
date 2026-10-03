// PingMe AI — Scanner Support

let pingmeScannerActive = false;

// Check scanner-related camera support
function isScannerSupported() {
    return !!(
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function"
    );
}

// Start scanner state
function startScanner() {
    if (!isScannerSupported()) {
        console.warn("Scanner is not supported.");
        return false;
    }

    pingmeScannerActive = true;

    console.log("Scanner Started");

    return true;
}

// Stop scanner
function stopScanner() {
    pingmeScannerActive = false;

    console.log("Scanner Stopped");
}

// Check scanner state
function isScannerActive() {
    return pingmeScannerActive;
}

// Handle scanned result
function handleScanResult(result) {
    if (!result) {
        return null;
    }

    const scannedValue =
        typeof result === "string"
            ? result
            : result.rawValue || result.text || "";

    if (!scannedValue) {
        return null;
    }

    console.log("Scan Result:", scannedValue);

    return scannedValue;
}

console.log("Scanner Support Connected");