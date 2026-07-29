const checkBalanceService = require("../service/check-balance");

const checkBalanceController = async (req, res) => {
  const { user } = req;
  const { status, data } = await checkBalanceService(user.id);

  return res.status(status).json(data);
};

module.exports = checkBalanceController;
