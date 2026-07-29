const Wallet = require("../model/wallet.model");
const checkBalanceService = async (userId) => {
  try {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return {
        status: 404,
        data: {
          success: false,
          message: "Wallet not found",
        },
      };
    }
    return {
      status: 200,
      data: {
        success: true,
        balance: wallet.balance,
      },
    };
  } catch (error) {
    console.error("Error in checkBalanceService:", error);
    return {
      status: 500,
      data: {
        success: false,
        message: "Internal server error",
      },
    };
  }
};

module.exports = checkBalanceService;
