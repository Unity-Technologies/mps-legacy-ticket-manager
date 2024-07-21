const errorHandler = (err, req, res) => {
    console.error(err.stack);
    const qs = new URLSearchParams(req.query).toString();
    res.cookie("my_app_params", qs, { httpOnly: true });
    res.status(500).render("internal-error-500", { qs });
  };
  
  module.exports = errorHandler;