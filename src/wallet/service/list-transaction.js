const Transaction = require("../model/transaction.model");

const listTransactionsService = async (userId, page, limit) => {
  try {
    const skip = (page - 1) * limit;
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ userId });

    if (!transactions) {
      return {
        status: 404,
        data: {
          success: false,
          message: "Transactions not found",
        },
      };
    }

    return {
      status: 200,
      data: {
        success: true,
        transactions: transactions,
        pagination: {
          page,
          limit,
          total: total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error in listTransactionsService:", error);
    return {
      status: 500,
      data: {
        success: false,
        message: "Internal server error",
      },
    };
  }
};

module.exports = listTransactionsService;
