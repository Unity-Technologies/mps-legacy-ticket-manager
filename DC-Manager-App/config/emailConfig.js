const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

module.exports = {
  zenlayer: { email: process.env.ZENLAYER_EMAIL },
  hivelocity: { email: process.env.HIVELOCITY_EMAIL },
  rapidswitch: { email: process.env.RAPIDSWITCH_EMAIL },
  serversdotcom: { email: process.env.SERVERSDOTCOM_EMAIL },
  gcore: { email: process.env.GCORE_EMAIL },
  maxihost: { email: process.env.MAXIHOST_EMAIL },
  vultr: { email: process.env.VULTR_EMAIL },
  leaseweb: { email: process.env.LEASEWEB_EMAIL },
  enzu: { email: process.env.ENZU_EMAIL },
  multiplayerSuppliers: { email: process.env.MULTIPLAYER_SUPPLIERS_EMAIL}
};
