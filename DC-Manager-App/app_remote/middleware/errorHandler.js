/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500; // Default to 500 if no status is provided
  const message = err.message || "Internal Server Error";
  const description = err.description || "";

  console.error(err.stack);

  const qs = new URLSearchParams(req.query).toString();
  res.cookie("my_app_params", qs, { httpOnly: true });

  // Render the modular error page
  res.status(status).render("errors/error", {
    qs,
    status,
    error_msg: message,
    description
  });
};

module.exports = errorHandler;