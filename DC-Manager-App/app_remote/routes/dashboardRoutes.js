const express = require("express");
const router = express.Router();
const checkZendeskAuth = require("../middleware/zendeskAuth");
const checkSessionAuth = require("../middleware/checkSessionAuth");
const { invokeCloudRunService } = require("../../config/authUtils");

router.post("/zendesk", async (req, res) => {
    try {
        const response = await invokeCloudRunService("/", "POST", req.body);

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to forward request" });
    }
});

router.post("/", checkZendeskAuth, async (req, res, next) => {
    try {
        const qs = new URLSearchParams(req.query).toString();
        const response = await invokeCloudRunService("/", "POST", req.body);
        res.cookie("my_app_params", qs, { httpOnly: true });
        res.render("index", { qs, data: response });
    } catch (error) {
        next(error); // Pass error to the error handler
    }
});

router.get("/", checkSessionAuth, async (req, res, next) => {
  try {
      const qs = new URLSearchParams(req.query).toString();
      const response = await invokeCloudRunService("/");
      res.cookie("my_app_params", qs, { httpOnly: true });
      res.render("index", { qs, data: response });
  } catch (error) {
      next(error); // Pass error to the error handler
  }
});

module.exports = router;