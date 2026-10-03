// PingMe AI — Files Support

// Check whether file selection is supported
function isFileSupported() {
    return typeof File !== "undefined" &&
           typeof FileReader !== "undefined";
}

// Read a text file
function readTextFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided."));
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = () => {
            reject(new Error("Failed to read file."));
        };

        reader.readAsText(file);
    });
}

// Convert a file to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided."));
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = () => {
            reject(new Error("Failed to convert file."));
        };

        reader.readAsDataURL(file);
    });
}

// Get basic file information
function getFileInfo(file) {
    if (!file) {
        return null;
    }

    return {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
    };
}

// Check file size
function isFileSizeAllowed(file, maxSizeMB = 10) {
    if (!file) {
        return false;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;

    return file.size <= maxBytes;
}

// Get file extension
function getFileExtension(fileName) {
    if (!fileName || typeof fileName !== "string") {
        return "";
    }

    const parts = fileName.split(".");

    if (parts.length < 2) {
        return "";
    }

    return parts.pop().toLowerCase();
}

console.log("Files Support Connected");