const listTransactionsService = require("../service/list-transaction");

const listTransactionsController = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { user } = req;
  const { status, data } = await listTransactionsService(user.id, page, limit);
  return res.status(status).json(data);
};

module.exports = listTransactionsController;
