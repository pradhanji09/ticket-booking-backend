const userSignupController = require("./signup");
const userLoginController = require("./user-login");
const adminLoginController = require("./admin-login");

module.exports = {
  signup: userSignupController,
  login: userLoginController,
  adminLogin: adminLoginController,
};
