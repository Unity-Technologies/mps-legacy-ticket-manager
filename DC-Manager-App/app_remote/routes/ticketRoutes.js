const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const uploadAttachments = require("../middleware/uploadAttachments");
const checkSessionAuth = require("../middleware/checkSessionAuth");

router.use(checkSessionAuth);

router.get("/new", ticketController.createTicket);
router.post("/new", uploadAttachments, ticketController.submitTicket);
router.get("/partials/:dataCenter", (req, res) => {
  const dataCenter = req.params.dataCenter;
  res.render(`partials/${dataCenter}-form`);
});

module.exports = router;
