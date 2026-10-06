// PingMe AI — Auth Support
// =========================================================
// Firebase Authentication + Google Login Support
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

    apiKey:"AIzaSyB4dAUhxEao415YdVg4l4WYJ21hQ9V-tyk",


    authDomain:
        "pingme-ai-bd38d.firebaseapp.com",

    projectId:
        "pingme-ai-bd38d",

    storageBucket:
        "pingme-ai-bd38d.firebasestorage.app",

    messagingSenderId:
        "389510337713",

    appId:
        "1:389510337713:web:0af55eeb00b996c620fe90",

    measurementId:
        "G-7W2NQPXF2B"
};


// =========================================================
// FIREBASE MODULES
// =========================================================

let pingmeFirebaseModules = null;


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


        pingmeFirebaseModules = {
            app: firebaseAppModule,
            auth: firebaseAuthModule
        };


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


        pingmeAuthReady = false;

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

            throw new Error(
                "Firebase Authentication is not initialized."
            );

        }


        if (!pingmeGoogleProvider) {

            throw new Error(
                "Google Authentication provider is not initialized."
            );

        }


        let signInWithPopup;


        if (
            pingmeFirebaseModules &&
            pingmeFirebaseModules.auth
        ) {

            signInWithPopup =
                pingmeFirebaseModules
                    .auth
                    .signInWithPopup;

        }


        if (
            typeof signInWithPopup !==
            "function"
        ) {

            const firebaseAuthModule =
                await import(
                    "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"
                );


            signInWithPopup =
                firebaseAuthModule
                    .signInWithPopup;

        }


        const result =
            await signInWithPopup(
                pingmeFirebaseAuth,
                pingmeGoogleProvider
            );


        const user =
            result.user;


        setAuthUser(
            user
        );


        if (user) {

            try {

                const token =
                    await user.getIdToken(
                        true
                    );


                setAuthToken(
                    token
                );

            } catch (tokenError) {

                console.warn(
                    "Could not get Firebase ID token:",
                    tokenError
                );

            }

        }


        console.log(
            "Google Sign-In Successful:",
            user?.email || ""
        );


        return user;


    } catch (error) {

        console.error(
            "Google Sign-In Error:",
            error
        );


        throw error;

    }

}


// =========================================================
// SIGN OUT
// =========================================================

async function signOutPingMe() {

    try {

        if (!pingmeFirebaseAuth) {

            clearAuthSession();

            return true;

        }


        let firebaseSignOut;


        if (
            pingmeFirebaseModules &&
            pingmeFirebaseModules.auth
        ) {

            firebaseSignOut =
                pingmeFirebaseModules
                    .auth
                    .signOut;

        }


        if (
            typeof firebaseSignOut !==
            "function"
        ) {

            const firebaseAuthModule =
                await import(
                    "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"
                );


            firebaseSignOut =
                firebaseAuthModule.signOut;

        }


        await firebaseSignOut(
            pingmeFirebaseAuth
        );


        clearAuthSession();


        console.log(
            "PingMe AI — Signed Out"
        );


        return true;


    } catch (error) {

        console.error(
            "PingMe AI — Sign Out Error:",
            error
        );


        throw error;

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
// GET AUTHENTICATION STATE
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
// EXPOSE AUTH API
// =========================================================

window.PingMeAuth = {

    setUser:
        setAuthUser,

    getUser:
        getAuthUser,

    setToken:
        setAuthToken,

    getToken:
        getAuthToken,

    isAuthenticated:
        isAuthenticated,

    isReady:
        isAuthReady,

    getUserName:
        getAuthUserName,

    getUserEmail:
        getAuthUserEmail,

    getUserPhoto:
        getAuthUserPhoto,

    signInWithGoogle:
        signInWithGoogle,

    signOut:
        signOutPingMe,

    clearSession:
        clearAuthSession,

    getState:
        getAuthState

};


// =========================================================
// GLOBAL FUNCTIONS FOR OTHER SUPPORT FILES
// =========================================================

window.setAuthUser =
    setAuthUser;

window.getAuthUser =
    getAuthUser;

window.setAuthToken =
    setAuthToken;

window.getAuthToken =
    getAuthToken;

window.isAuthenticated =
    isAuthenticated;

window.isAuthReady =
    isAuthReady;

window.getAuthUserName =
    getAuthUserName;

window.getAuthUserEmail =
    getAuthUserEmail;

window.getAuthUserPhoto =
    getAuthUserPhoto;

window.signInWithGoogle =
    signInWithGoogle;

window.signOutPingMe =
    signOutPingMe;

window.clearAuthSession =
    clearAuthSession;

window.getAuthState =
    getAuthState;


// =========================================================
// START AUTH SYSTEM
// =========================================================

initializePingMeAuth();


console.log(
    "PingMe AI — Auth Support Connected"
);
