// PingMe AI — Theme Support

const PINGME_THEME_KEY = "pingme_theme";

let activeTheme = "light";

// Get saved theme
function getSavedTheme() {
    try {
        return localStorage.getItem(PINGME_THEME_KEY) || "light";
    } catch (error) {
        console.error("Failed to load theme:", error);
        return "light";
    }
}

// Set theme
function setTheme(theme) {
    const allowedThemes = [
        "light",
        "dark",
        "system"
    ];

    if (!allowedThemes.includes(theme)) {
        console.warn("Unknown theme:", theme);
        return;
    }

    activeTheme = theme;

    try {
        localStorage.setItem(
            PINGME_THEME_KEY,
            theme
        );
    } catch (error) {
        console.error("Failed to save theme:", error);
    }

    console.log("Theme Changed:", theme);
}

// Get current theme
function getTheme() {
    return activeTheme;
}

// Load saved theme
function loadTheme() {
    activeTheme = getSavedTheme();

    console.log("Theme Loaded:", activeTheme);

    return activeTheme;
}

// Get system theme
function getSystemTheme() {
    if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        return "dark";
    }

    return "light";
}

// Get effective theme
function getEffectiveTheme() {
    if (activeTheme === "system") {
        return getSystemTheme();
    }

    return activeTheme;
}

// Reset theme
function resetTheme() {
    activeTheme = "light";

    try {
        localStorage.removeItem(PINGME_THEME_KEY);
    } catch (error) {
        console.error("Failed to reset theme:", error);
    }

    console.log("Theme Reset");
}

loadTheme();

console.log("Theme Support Connected");