const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      enum: ["TOPUP", "BOOKING", "REFUND"],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    idempotencyKey: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

transactionSchema.index(
  { idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $ne: null } } },
);

module.exports = mongoose.model("Transaction", transactionSchema);
