const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const qs = new URLSearchParams(req.query).toString();
  res.cookie("my_app_params", qs, { httpOnly: true });
  res.render("index", { qs });
});

module.exports = router;