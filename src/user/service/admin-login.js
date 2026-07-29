const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminLoginService = async (email, password) => {
  try {
    const admin = await User.findOne({ where: { email } });

    if (!admin) {
      return {
        status: 404,
        data: { success: false, error: "User not found" },
      };
    }

    if (admin.role !== "ADMIN") {
      return {
        status: 403,
        data: { success: false, error: "Not authorized" },
      };
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return {
        status: 401,
        data: { success: false, error: "Invalid password" },
      };
    }
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

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

module.exports = adminLoginService;
