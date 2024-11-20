const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");
const fs = require("fs");

// Decode the base64 string
const serviceAccountJson = Buffer.from(process.env.SERVICE_ACCOUNT_JSON_ENCODED, "base64").toString("utf-8");

// Parse it into an object
const SERVICE_ACCOUNT_KEY_FILE = JSON.parse(serviceAccountJson);

// Path to your service account key JSON file
// const SERVICE_ACCOUNT_KEY_FILE = "./service-account-credentials.json";

// URL of your Cloud Run service
const CLOUD_RUN_URL = "https://dc-ticket-tool-877653085348.europe-west2.run.app";

async function getIdentityToken() {
    // Create a GoogleAuth instance with the service account key file
    const auth = new GoogleAuth({
        keyFilename: SERVICE_ACCOUNT_KEY_FILE,
    });

    // Get an ID token for the target audience
    const client = await auth.getIdTokenClient(CLOUD_RUN_URL);
    const idToken = await client.getRequestHeaders();
    return idToken.Authorization.replace("Bearer ", ""); // Extract the token
}

async function invokeCloudRunService(endpointPath = "", method = "GET", data = null) {
    try {
        // Generate the identity token
        const token = await getIdentityToken();
        console.log("TOKEN:", token);

        // Full Cloud Run URL including endpoint path
        const fullUrl = `${CLOUD_RUN_URL}${endpointPath}`;

        const response = await axios({
            url: `${CLOUD_RUN_URL}${endpointPath}`,
            method,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data,
        });

        return response;
    } catch (error) {
        throw new Error(
            `Request failed with status ${error.response?.status}: ${error.message}`
        );
    }
}

module.exports = { invokeCloudRunService };
