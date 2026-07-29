const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginService = async (email, password) => {
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return { status: 404, data: { success: false, error: "User not found" } };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        status: 401,
        data: { success: false, error: "Invalid password" },
      };
    }

    //jwt token gen
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    return {
      status: 200,
      data: { success: true, token },
    };
  } catch (error) {
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = loginService;
