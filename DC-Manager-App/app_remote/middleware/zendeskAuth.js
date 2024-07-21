const zendeskService = require("../services/zendeskService");

const checkZendeskAuth = async (req, res, next) => {
    console.log(req.body);
    const authEmail = req.body.zendeskUserEmail;
    const userId = req.body.assigneeId;
    let error_msg = "";

    const qs = new URLSearchParams(req.query).toString();
    res.cookie("my_app_params", qs, { httpOnly: true });
  
    if (!authEmail || !userId) {
        error_msg = "Authentication details missing";
        return res.render("create-support-ticket", { qs, error_msg });
    }
  
    try {
      await zendeskService.verifyAuth(authEmail, userId).then(() => {
        next();
      }).catch((err) => {
        error_msg = `Unauthorized: Invalid Zendesk credentials, ${err}`;
        return res.render("create-support-ticket", { qs, error_msg });
      });
    } catch (error) {
      console.error("Error verifying Zendesk auth:", error);
      error_msg = `Internal Server Error (Zendesk Verification): ${error}`;
      res.render("create-support-ticket", { qs, error_msg });
    }
  };
  
module.exports = checkZendeskAuth;