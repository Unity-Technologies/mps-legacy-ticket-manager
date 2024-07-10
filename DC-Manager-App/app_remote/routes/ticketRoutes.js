const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/new", ticketController.createTicket);
router.post("/new", upload.array('attachments', 2), ticketController.submitTicket);
router.get("/partials/:dataCenter", (req, res) => {
  const dataCenter = req.params.dataCenter;
  res.render(`partials/${dataCenter}-form`);
});

module.exports = router;
