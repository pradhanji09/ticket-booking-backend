const allTransactionsService = require("../service/all-transactions");

const allTransactionsController = async (req, res) => {
  const { page = 1, limit = 20, userId, type, reason } = req.query;

  if (type && !["CREDIT", "DEBIT"].includes(type.toUpperCase()))
    return res.status(400).json({ success: false, message: "Invalid type" });

  if (reason && !["TOPUP", "BOOKING", "REFUND"].includes(reason.toUpperCase()))
    return res.status(400).json({ success: false, message: "Invalid reason" });

  const { status, data } = await allTransactionsService(
    page,
    limit,
    userId,
    type,
    reason,
  );

  res.status(status).json(data);
};

module.exports = allTransactionsController;
