require('dotenv').config();

const express = require("express");
const cookieParser = require("cookie-parser");
const ticketRoutes = require('./routes/ticketRoutes');
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.get("/sidebar", (req, res) => {
  const qs = new URLSearchParams(req.query).toString();
  res.cookie("my_app_params", qs, { httpOnly: true });
  res.render("index", { qs });
});

app.use('/tickets', ticketRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
