const adminLoginService = require("../service/admin-login");

const adminLoginController = async (req, res) => {
  const { email, password } = req.body;

  const result = await adminLoginService(email, password);

  const { status, json } = result;

  res.status(status).json(json);
};

module.exports = adminLoginController;
