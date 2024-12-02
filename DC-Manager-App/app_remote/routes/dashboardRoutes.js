const express = require("express");
const router = express.Router();
const checkZendeskAuth = require("../middleware/zendeskAuth");
const checkSessionAuth = require("../middleware/checkSessionAuth");

router.post("/", checkZendeskAuth, async (req, res, next) => {
    try {
        const qs = new URLSearchParams(req.query).toString();
        res.cookie("my_app_params", qs, { httpOnly: true });
        res.render("index", { qs });
    } catch (error) {
        next(error); // Pass error to the error handler
    }
});

router.get("/", checkSessionAuth, async (req, res, next) => {
  try {
      const qs = new URLSearchParams(req.query).toString();
      res.cookie("my_app_params", qs, { httpOnly: true });
      res.render("index", { qs });
  } catch (error) {
      next(error); // Pass error to the error handler
  }
});

module.exports = router;