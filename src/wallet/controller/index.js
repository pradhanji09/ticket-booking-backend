const creditController = require("./credit");
const checkBalanceController = require("./balance");
const listTransactionsController = require("./list-transactions");
const allTransactions = require("./all-transactions");

module.exports = {
  credit: creditController,
  balance: checkBalanceController,
  transactions: listTransactionsController,
  allTransactions,
};
