const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const uploadAttachments = require("../middleware/uploadAttachments");
const checkZendeskAuth = require("../middleware/zendeskAuth");

router.get("/new", ticketController.createTicket);
router.post("/new", uploadAttachments, checkZendeskAuth, ticketController.submitTicket);
router.get("/partials/:dataCenter", (req, res) => {
  const dataCenter = req.params.dataCenter;
  res.render(`partials/${dataCenter}-form`);
});

module.exports = router;
