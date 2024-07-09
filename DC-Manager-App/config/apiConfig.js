const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

module.exports = {
  zendesk: {
    apiUrl: process.env.ZENDESK_API_URL,
    apiToken: process.env.ZENDESK_API_TOKEN,
    username: process.env.ZENDESK_USERNAME,
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
