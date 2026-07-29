const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
const Wallet = require("../../wallet/model/wallet.model");
const runInTransaction = require("../../common/utils/run-transaction");

const userSignupService = async (name, email, password) => {
  try {
    const userExist = await User.findOne({ where: { email } });
    if (userExist) {
      return {
        status: 400,
        data: { success: false, error: "Email already in use" },
      };
    }

    //hash password
    const hashPassword = await bcrypt.hash(password, 10);

    const result = await runInTransaction(async (session) => {
      // Create user
      const [newUser] = await User.create(
        [{ name, email, password: hashPassword }],
        { session },
      );

      await Wallet.create([{ userId: newUser._id, balance: 0 }], { session });

      return {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      };
    });

    return {
      status: 201,
      data: {
        success: true,
        user: result,
      },
    };
  } catch (error) {
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = userSignupService;
