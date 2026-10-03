// PingMe AI — Notifications Support

let notificationsEnabled = true;
let notificationSoundEnabled = true;
let notificationVibrationEnabled = true;

// Load notification settings
function loadNotificationSettings() {
    if (typeof getSetting !== "function") {
        return;
    }

    notificationsEnabled =
        getSetting("notifications.enabled") !== false;

    notificationSoundEnabled =
        getSetting("notifications.sound") !== false;

    notificationVibrationEnabled =
        getSetting("notifications.vibration") !== false;
}

// Check notification permission support
function isNotificationSupported() {
    return "Notification" in window;
}

// Get browser notification permission
function getNotificationPermission() {
    if (!isNotificationSupported()) {
        return "unsupported";
    }

    return Notification.permission;
}

// Request notification permission
async function requestNotificationPermission() {
    if (!isNotificationSupported()) {
        return "unsupported";
    }

    try {
        return await Notification.requestPermission();
    } catch (error) {
        console.error(
            "Notification Permission Error:",
            error
        );

        return "denied";
    }
}

// Show a browser notification
function showPingMeNotification(title, options = {}) {
    if (!notificationsEnabled) {
        return null;
    }

    if (!isNotificationSupported()) {
        return null;
    }

    if (Notification.permission !== "granted") {
        return null;
    }

    try {
        return new Notification(title, options);
    } catch (error) {
        console.error(
            "Notification Error:",
            error
        );

        return null;
    }
}

// Get notification settings
function getNotificationSettings() {
    return {
        enabled: notificationsEnabled,
        sound: notificationSoundEnabled,
        vibration: notificationVibrationEnabled
    };
}

// Reset notification state
function resetNotificationState() {
    notificationsEnabled = true;
    notificationSoundEnabled = true;
    notificationVibrationEnabled = true;
}

loadNotificationSettings();

console.log("Notifications Support Connected");