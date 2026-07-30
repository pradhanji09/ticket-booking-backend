const Transaction = require("../model/transaction.model");

const getAllTransactionsService = async (page, limit, userId, type, reason) => {
  try {
    const query = {};
    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (reason) query.reason = reason;

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    const formatted = transactions.map((t) => ({
      id: t._id,
      user: t.userId
        ? { id: t.userId._id, name: t.userId.name, email: t.userId.email }
        : null,
      type: t.type,
      amount: t.amount,
      reason: t.reason,
      balanceAfter: t.balanceAfter,
      referenceId: t.referenceId,
      createdAt: t.createdAt,
    }));

    return {
      status: 200,
      data: {
        success: true,
        data: {
          transactions: formatted,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
    };
  } catch (error) {
    console.error("Error in getAllTransactionsService:", error);
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = getAllTransactionsService;
