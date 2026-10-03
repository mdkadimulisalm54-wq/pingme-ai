// PingMe AI — Storage Support

// Save data
function saveStorage(key, value) {
    if (!key) {
        return false;
    }

    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;
    } catch (error) {
        console.error(
            "Storage Save Error:",
            error
        );

        return false;
    }
}

// Get data
function getStorage(key, defaultValue = null) {
    if (!key) {
        return defaultValue;
    }

    try {
        const value = localStorage.getItem(key);

        if (value === null) {
            return defaultValue;
        }

        return JSON.parse(value);
    } catch (error) {
        console.error(
            "Storage Read Error:",
            error
        );

        return defaultValue;
    }
}

// Remove data
function removeStorage(key) {
    if (!key) {
        return false;
    }

    try {
        localStorage.removeItem(key);

        return true;
    } catch (error) {
        console.error(
            "Storage Remove Error:",
            error
        );

        return false;
    }
}

// Check whether a key exists
function hasStorage(key) {
    if (!key) {
        return false;
    }

    try {
        return localStorage.getItem(key) !== null;
    } catch (error) {
        console.error(
            "Storage Check Error:",
            error
        );

        return false;
    }
}

// Clear all PingMe storage
function clearPingMeStorage() {
    try {
        localStorage.clear();

        console.log("PingMe Storage Cleared");

        return true;
    } catch (error) {
        console.error(
            "Storage Clear Error:",
            error
        );

        return false;
    }
}

console.log("Storage Support Connected");