// PingMe AI — Auth Support
// =========================================================
// Firebase Google Authentication Support
// =========================================================

let pingmeAuthUser = null;
let pingmeAuthToken = null;

let pingmeFirebaseApp = null;
let pingmeFirebaseAuth = null;
let pingmeGoogleProvider = null;

let pingmeAuthReady = false;


// =========================================================
// FIREBASE CONFIG
// =========================================================

const pingmeFirebaseConfig = {

    apiKey:
        "AIzaSyB4dAUhxEao415YdVg4l4WYJ21hQ9V-tyk",

    authDomain:
        "pingme-ai-8d8cc.firebaseapp.com",

    projectId:
        "pingme-ai-8d8cc",

    storageBucket:
        "pingme-ai-8d8cc.firebasestorage.app",

    messagingSenderId:
        "547217020747",

    appId:
        "1:547217020747:web:62b7d3843672703d8abace",

    measurementId:
        "G-3WRC64CRDR"
};


// =========================================================
// INITIALIZE FIREBASE AUTH
// =========================================================

async function initializePingMeAuth() {

    try {

        const firebaseAppModule =
            await import(
                "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"
            );


        const firebaseAuthModule =
            await import(
                "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"
            );


        const {
            initializeApp,
            getApps
        } = firebaseAppModule;


        const {
            getAuth,
            GoogleAuthProvider,
            onAuthStateChanged
        } = firebaseAuthModule;


        if (getApps().length > 0) {

            pingmeFirebaseApp =
                getApps()[0];

        } else {

            pingmeFirebaseApp =
                initializeApp(
                    pingmeFirebaseConfig
                );

        }


        pingmeFirebaseAuth =
            getAuth(
                pingmeFirebaseApp
            );


        pingmeGoogleProvider =
            new GoogleAuthProvider();


        pingmeGoogleProvider.setCustomParameters({

            prompt:
                "select_account"

        });


        onAuthStateChanged(
            pingmeFirebaseAuth,
            function (user) {

                setAuthUser(user);


                if (user) {

                    console.log(
                        "PingMe AI — User Signed In:",
                        user.displayName ||
                        user.email ||
                        "Google User"
                    );

                } else {

                    console.log(
                        "PingMe AI — No User Signed In"
                    );

                }

            }
        );


        pingmeAuthReady = true;


        console.log(
            "Firebase Auth Connected"
        );


    } catch (error) {

        console.error(
            "Firebase Auth Initialization Error:",
            error
        );

    }

}


// =========================================================
// SET AUTHENTICATED USER
// =========================================================

function setAuthUser(user) {

    pingmeAuthUser =
        user || null;

}


// =========================================================
// GET AUTHENTICATED USER
// =========================================================

function getAuthUser() {

    return pingmeAuthUser;

}


// =========================================================
// SET AUTHENTICATION TOKEN
// =========================================================

function setAuthToken(token) {

    pingmeAuthToken =
        token || null;

}


// =========================================================
// GET AUTHENTICATION TOKEN
// =========================================================

function getAuthToken() {

    return pingmeAuthToken;

}


// =========================================================
// CHECK AUTHENTICATION
// =========================================================

function isAuthenticated() {

    return !!pingmeAuthUser;

}


// =========================================================
// CHECK AUTH READY
// =========================================================

function isAuthReady() {

    return pingmeAuthReady;

}


// =========================================================
// GET USER NAME
// =========================================================

function getAuthUserName() {

    if (!pingmeAuthUser) {
        return "";
    }


    return (
        pingmeAuthUser.displayName ||
        "PingMe User"
    );

}


// =========================================================
// GET USER EMAIL
// =========================================================

function getAuthUserEmail() {

    if (!pingmeAuthUser) {
        return "";
    }


    return (
        pingmeAuthUser.email ||
        ""
    );

}


// =========================================================
// GET USER PHOTO
// =========================================================

function getAuthUserPhoto() {

    if (!pingmeAuthUser) {
        return "";
    }


    return (
        pingmeAuthUser.photoURL ||
        ""
    );

}


// =========================================================
// GOOGLE SIGN IN
// =========================================================

async function signInWithGoogle() {

    try {

        if (!pingmeFirebaseAuth) {

            console.warn(
                "Firebase Auth is not ready yet."
            );

            return null;

        }


        const {
            signInWithPopup
        } =
            await import(
                "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"
            );


        const result =
            await signInWithPopup(
                pingmeFirebaseAuth,
                pingmeGoogleProvider
            );


        const user =
            result.user;


        setAuthUser(user);


        if (user) {

            try {

                const token =
                    await user.getIdToken();

                setAuthToken(token);

            } catch (tokenError) {

                console.warn(
                    "Firebase ID token unavailable:",
                    tokenError
                );

            }

        }


        console.log(
            "Google Sign-In Successful"
        );


        return user;


    } catch (error) {

        console.error(
            "Google Sign-In Error:",
            error
        );


        return null;

    }

}


// =========================================================
// SIGN OUT
// =========================================================

async function signOutPingMe() {

    try {

        if (!pingmeFirebaseAuth) {

            clearAuthSession();

            return;

        }


        const {
            signOut
        } =
            await import(
                "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"
            );


        await signOut(
            pingmeFirebaseAuth
        );


        clearAuthSession();


        console.log(
            "PingMe AI — Signed Out"
        );


    } catch (error) {

        console.error(
            "PingMe AI — Sign Out Error:",
            error
        );

    }

}


// =========================================================
// CLEAR AUTH SESSION
// =========================================================

function clearAuthSession() {

    pingmeAuthUser = null;
    pingmeAuthToken = null;

    console.log(
        "Auth Session Cleared"
    );

}


// =========================================================
// GET AUTH STATE
// =========================================================

function getAuthState() {

    return {

        authenticated:
            isAuthenticated(),

        ready:
            isAuthReady(),

        user:
            pingmeAuthUser,

        token:
            pingmeAuthToken,

        name:
            getAuthUserName(),

        email:
            getAuthUserEmail(),

        photo:
            getAuthUserPhoto()

    };

}


// =========================================================
// START AUTH SYSTEM
// =========================================================

initializePingMeAuth();


console.log(
    "Auth Support Connected"
);