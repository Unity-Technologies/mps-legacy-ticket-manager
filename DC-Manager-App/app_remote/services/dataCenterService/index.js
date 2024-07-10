const datapacketService = require("./datapacketService");
const hundredtbService = require("./hundredtbService");
const i3dService = require("./i3dService");
const inapService = require("./inapService");
const performiveService = require("./performiveService");
const psychzService = require("./psychzService");
const veliaService = require("./veliaService");

module.exports = {
  hundredtb: hundredtbService,
  velia: veliaService,
  psychz: psychzService,
  datapacket: datapacketService,
  i3d: i3dService,
  inap: inapService,
  performive: performiveService,
};
