const userSignup = require("./signup");
const login = require("./login");
const adminLogin = require("./admin-login");

module.exports = {
  signup: userSignup,
  login,
  adminLogin,
};
