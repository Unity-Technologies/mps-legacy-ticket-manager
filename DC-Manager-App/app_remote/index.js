const express = require("express");
const cookieParser = require("cookie-parser");
const ticketRoutes = require('./routes/ticketRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorHandler');
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use("/static", express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 3000;

app.use('/sidebar', dashboardRoutes);

app.use('/tickets', ticketRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
