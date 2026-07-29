const runInTransaction = require("../../common/utils/run-transaction");
const Transaction = require("../model/transaction.model");
const Wallet = require("../model/wallet.model");

const creditService = async ({ userId, amount, idempotencyKey }) => {
  try {
    const existing = await Transaction.findOne({ idempotencyKey });
    if (existing) {
      return {
        status: 200,
        data: {
          success: true,
          transaction: {
            transactionId: existing._id,
            type: existing.type,
            amount: existing.amount,
            currentBalance: existing.balanceAfter,
            createdAt: existing.createdAt,
          },
        },
      };
    }

    const result = await runInTransaction(async (session) => {
      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { balance: amount } },
        { new: true, session },
      );

      const [transaction] = await Transaction.create(
        [
          {
            userId,
            type: "CREDIT",
            amount,
            reason: "WALLET_TOPUP",
            balanceAfter: wallet.balance,
            idempotencyKey,
          },
        ],
        { session },
      );

      return {
        transactionId: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        currentBalance: transaction.balanceAfter,
        createdAt: transaction.createdAt,
      };
    });

    return {
      status: 201,
      data: {
        success: true,
        transaction: result,
      },
    };
  } catch (error) {
    console.error("Error in creditService:", error);
    return {
      success: false,
      status: 500,
      message: "Internal server error",
    };
  }
};

module.exports = creditService;
