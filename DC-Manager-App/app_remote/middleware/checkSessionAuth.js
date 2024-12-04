const { sessionStore, HOUR_IN_MILLISECONDS, WORKWEEK_IN_MILLISECONDS } = require("./sessionStore"); // Import shared session store

const checkSessionAuth = (req, res, next) => {
    const sessionId = req.cookies.session_id;

    console.log("SESSION ID:", sessionId)
    if (!sessionId || !isValidSession(sessionId)) {
        const error = new Error(`Unauthorized: Invalid session ${sessionId}`);
        error.status = 401; // Set the status code for the error
        return next(error);
    }

    refreshSessionIfNeeded(sessionId, res);
    next();
};

// Function to validate session data in-memory
const isValidSession = (sessionId) => {
    const session = sessionStore[sessionId];
    console.log("CHECKING SESSION", session)
    if (!session) return false;

    // Check if the session has expired
    if (Date.now() > session.expiry) {
        console.log("DELETING SESSION")
        delete sessionStore[sessionId]; // Remove expired session
        return false;
    }
    console.log("SESSION IS VALID", session)
    return true;
};

// Function to refresh session if nearing expiration
const refreshSessionIfNeeded = (sessionId, res) => {
    const session = sessionStore[sessionId];

    // Define a threshold (e.g., 10 minutes before expiry)
    const refreshThreshold = 1 * HOUR_IN_MILLISECONDS; // 10 minutes in milliseconds

    if (session.expiry - Date.now() <= refreshThreshold) {
        // Extend session expiry by 1 hour (or your desired time)
        session.expiry = Date.now() + WORKWEEK_IN_MILLISECONDS; // 1 hour
        res.cookie("session_id", sessionId, {
            httpOnly: true,
            secure: true,
            maxAge: WORKWEEK_IN_MILLISECONDS, // 1 hour session
            path: "/",
            sameSite: "none"
        });

    }
};

module.exports = checkSessionAuth;
