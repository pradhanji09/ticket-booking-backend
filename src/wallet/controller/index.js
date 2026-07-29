const creditController = require("./credit");
const checkBalanceController = require("./balance");
const listTransactionsController = require("./list-transactions");

module.exports = {
  credit: creditController,
  balance: checkBalanceController,
  transactions: listTransactionsController,
};
