const creditService = require("../service/credit");

const creditController = async (req, res) => {
  try {
    const {
      body,
      user: { id },
      idempotencyKey,
    } = req;

    const { amount } = body;
    if (!amount) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const numberAmount = Number(amount);
    if (isNaN(numberAmount) || numberAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const { status, data } = await creditService({
      userId: id,
      amount: numberAmount,
      idempotencyKey,
    });

    return res.status(status).json(data);
  } catch (error) {
    if (error.code === 11000 || error.message?.includes("E11000")) {
      console.warn(
        `Idempotency race condition triggered for key: ${idempotencyKey}`,
      );

      const existing = await Transaction.findOne({ idempotencyKey });
      return {
        status: 200,
        success: true,
        data: {
          transactionId: existing?._id,
          type: existing?.type,
          amount: existing?.amount,
          currentBalance: existing?.balanceAfter,
          createdAt: existing?.createdAt,
        },
      };
    }
    console.error("Error in creditController:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = creditController;
