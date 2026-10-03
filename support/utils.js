// PingMe AI — Utilities Support

// Generate a unique ID
function generatePingMeId(prefix = "id") {
    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).slice(2, 8)
    );
}

// Check whether a value is empty
function isEmpty(value) {
    if (value === null || value === undefined) {
        return true;
    }

    if (typeof value === "string") {
        return value.trim() === "";
    }

    if (Array.isArray(value)) {
        return value.length === 0;
    }

    return false;
}

// Safely convert a value to string
function safeString(value, fallback = "") {
    if (value === null || value === undefined) {
        return fallback;
    }

    return String(value);
}

// Limit text length
function truncateText(text, maxLength = 100) {
    const value = safeString(text);

    if (value.length <= maxLength) {
        return value;
    }

    return value.slice(0, Math.max(0, maxLength - 3)) + "...";
}

// Wait for a specific amount of time
function delay(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

// Check whether the device is online
function isOnline() {
    return navigator.onLine;
}

// Get current timestamp
function getTimestamp() {
    return Date.now();
}

// Safely parse JSON
function parseJSON(value, fallback = null) {
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

console.log("Utilities Support Connected");