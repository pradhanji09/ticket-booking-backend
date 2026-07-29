const loginService = require("../service/user-login");

const userLoginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "email and password are required" });
  }

  const result = await loginService(email, password);
  const { status, data } = result;

  res.status(status).json(data);
};

module.exports = userLoginController;
