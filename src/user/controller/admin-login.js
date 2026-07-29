const adminLoginService = require("../service/admin-login");

const adminLoginController = async (req, res) => {
  const { email, password } = req.body;

  const result = await adminLoginService(email, password);

  const { status, data } = result;

  res.status(status).json(data);
};

module.exports = adminLoginController;
