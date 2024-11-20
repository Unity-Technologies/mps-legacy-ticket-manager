const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const uploadAttachments = require("../middleware/uploadAttachments");
const checkSessionAuth = require("../middleware/checkSessionAuth");
const { invokeCloudRunService } = require("../../config/authUtils");

router.use(checkSessionAuth);

router.get("/new", ticketController.createTicket);
router.post("/new", uploadAttachments, ticketController.submitTicket);
router.get("/partials/:dataCenter", async (req, res, next) => {
  try {
    const response = await invokeCloudRunService("/partials/:dataCenter");
    const dataCenter = req.params.dataCenter;
    res.render(`partials/${dataCenter}-form`, { data: response });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
