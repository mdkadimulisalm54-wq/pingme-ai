// PingMe AI — Auth Support

let pingmeAuthUser = null;
let pingmeAuthToken = null;

// Set authenticated user
function setAuthUser(user) {
    pingmeAuthUser = user || null;
}

// Get authenticated user
function getAuthUser() {
    return pingmeAuthUser;
}

// Set authentication token
function setAuthToken(token) {
    pingmeAuthToken = token || null;
}

// Get authentication token
function getAuthToken() {
    return pingmeAuthToken;
}

// Check whether a user is authenticated
function isAuthenticated() {
    return !!pingmeAuthUser;
}

// Clear authentication session
function clearAuthSession() {
    pingmeAuthUser = null;
    pingmeAuthToken = null;

    console.log("Auth Session Cleared");
}

// Get authentication state
function getAuthState() {
    return {
        authenticated: isAuthenticated(),
        user: pingmeAuthUser,
        token: pingmeAuthToken
    };
}

console.log("Auth Support Connected");