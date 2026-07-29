const userSignupService = require("../service/user-signup");

const userSignupController = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "Name, email and password are required",
    });
  }

  const result = await userSignupService(name, email, password);

  const { status, json } = result;

  return res.status(status).json(json);
};

module.exports = userSignupController;
