const userSignupService = require("../service/signup");

const userSignupController = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required",
    });
  }

  const result = await userSignupService(name, email, password);
  const { status, data } = result;

  return res.status(status).json(data);
};

module.exports = userSignupController;
