const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

module.exports = {
  zendesk: {
    apiUrl: process.env.ZENDESK_SANDBOX_API_URL, // change back to Prod api url
    apiToken: process.env.ZENDESK_SANDBOX_API_TOKEN, // change back to Prod api token
    username: process.env.ZENDESK_USERNAME,
    appAud: process.env.ZENDESK_APP_AUD,
    appPublicKey: process.env.ZENDESK_APP_PUBLIC_KEY,
  },
  hundredtb: {
    apiUrl: process.env.HUNDREDTB_API_URL,
    apiToken: process.env.HUNDREDTB_API_KEY,
  },
  velia: {
    apiUrl: process.env.VELIA_API_URL,
    apiToken: process.env.VELIA_API_KEY,
  },
  i3d: {
    apiUrl: process.env.I3D_API_URL,
    apiToken: process.env.I3D_API_KEY,
  },
  inap: {
    apiUrl: process.env.INAP_API_URL,
    apiToken: process.env.INAP_API_KEY,
  },
  datapacket: {
    apiUrl: process.env.DATAPACKET_API_URL,
    apiToken: process.env.DATAPACKET_API_KEY,
  },
  psychz: {
    apiUrl: process.env.PSYCHZ_API_URL,
    apiToken: process.env.PSYCHZ_ACCESS_TOKEN,
    apiUsername: process.env.PSYCHZ_ACCESS_USERNAME,
  },
  performive: {
    apiUrl: process.env.PERFORMIVE_API_URL,
    apiToken: process.env.PERFORMIVE_API_KEY,
  },
};
