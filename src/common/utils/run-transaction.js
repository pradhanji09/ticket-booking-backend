const mongoose = require("mongoose");

const runInTransaction = async (operationsFn) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await operationsFn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

module.exports = runInTransaction;
