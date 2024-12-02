const jwt = require("jsonwebtoken");
const config = require("../../config/apiConfig");
const { sessionStore, WORKWEEK_IN_MILLISECONDS } = require("./sessionStore");
const crypto = require("crypto"); // Moved to the top for better readability

const checkZendeskAuth = async (req, res, next) => {
    const token = req.body.token;
    const qs = new URLSearchParams(req.query).toString();
    res.cookie("my_app_params", qs, { httpOnly: true });

    console.log("Received token:", token);
    console.log("Zendesk app public key:", config.zendesk.appPublicKey);
    console.log("Zendesk app audience:", config.zendesk.appAud);

    let error_msg = "";
    if (!token) {
        // error_msg = "Missing token. Access denied.";
        // return res.render("index", { qs, error_msg });
        const error = new Error("Unauthorized: Invalid token, token is missing");
        error.status = 401; // Set the status code for the error
        return next(error);
    }

    const key = config.zendesk.appPublicKey.replace(/\\n/g, '\n');
    const audience = config.zendesk.appAud;

    try {
        const payload = jwt.verify(token, key, {
            algorithms: ["RS256"],
            audience: audience
        });

        error_msg = payload;
        req.zendeskPayload = payload; // Attach payload to the request object for later use

        // Create a session identifier and set a secure, HttpOnly cookie
        const sessionID = generateSessionID();
        res.cookie("session_id", sessionID, {
            httpOnly: true,
            secure: true,
            maxAge: WORKWEEK_IN_MILLISECONDS, // 1 hour session
            path: "/",
            sameSite: "none"
        });

        storeSession(sessionID, payload);
        next();
    } catch (err) {
        console.error("Invalid token:", err);
        // error_msg = "Unauthorized: Invalid Zendesk token.";
        // return res.render("index", { qs, error_msg });
        const error = new Error(`Unauthorized: Invalid token, could not verify token, ${err}\nZendesk app public key: ${key}`);
        error.status = 401; // Set the status code for the error
        return next(error);
    }
};

// Utility function to generate a session ID
const generateSessionID = () => {
    return crypto.randomBytes(16).toString("hex");
};

// Function to store session data in the shared store
const storeSession = (sessionID, payload) => {
    sessionStore[sessionID] = {
        data: payload,
        expiry: Date.now() + WORKWEEK_IN_MILLISECONDS // 1 hour expiry
    };
};

module.exports = checkZendeskAuth;
