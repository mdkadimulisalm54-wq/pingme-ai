// PingMe AI — Settings Support

const pingmeSettings = {

    general: {
        language: "en",
        autoSave: true,
        confirmDelete: true
    },

    model: "gemini-3.8-flash",

    appearance: {
        theme: "light"
    },

    chat: {
        enterToSend: true,
        animations: true,
        autoScroll: true
    },

    voice: {
        input: true,
        response: false,
        language: "en",
        speed: 1
    },

    notifications: {
        enabled: true,
        sound: true,
        vibration: true
    },

    memory: {
        enabled: true
    },

    privacy: {
        saveChatHistory: true
    },

    tools: {
        camera: true,
        files: true,
        images: true,
        scanner: true
    }
};


// Get a setting
function getSetting(path) {

    return path.split(".").reduce((object, key) => {
        return object?.[key];
    }, pingmeSettings);

}


// Change a setting
function setSetting(path, value) {

    const keys = path.split(".");
    const lastKey = keys.pop();

    let target = pingmeSettings;

    for (const key of keys) {

        if (!target[key]) {
            target[key] = {};
        }

        target = target[key];

    }

    target[lastKey] = value;

    console.log("Setting Changed:", path, value);

}


// Reset all settings
function resetSettings() {

    pingmeSettings.general.language = "en";
    pingmeSettings.general.autoSave = true;
    pingmeSettings.general.confirmDelete = true;

    pingmeSettings.model = "gemini-3.8-flash";

    pingmeSettings.appearance.theme = "light";

    pingmeSettings.chat.enterToSend = true;
    pingmeSettings.chat.animations = true;
    pingmeSettings.chat.autoScroll = true;

    pingmeSettings.voice.input = true;
    pingmeSettings.voice.response = false;
    pingmeSettings.voice.language = "en";
    pingmeSettings.voice.speed = 1;

    pingmeSettings.notifications.enabled = true;
    pingmeSettings.notifications.sound = true;
    pingmeSettings.notifications.vibration = true;

    pingmeSettings.memory.enabled = true;

    pingmeSettings.privacy.saveChatHistory = true;

    pingmeSettings.tools.camera = true;
    pingmeSettings.tools.files = true;
    pingmeSettings.tools.images = true;
    pingmeSettings.tools.scanner = true;

    console.log("Settings Reset");

}


console.log("Settings Support Connected");
function isAutoSaveEnabled() {
    return getSetting("general.autoSave");
}