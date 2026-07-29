const express = require("express");
const router = express.Router();
const walletController = require("../controller/index");
const { authenticate } = require("../../common/middleware/auth.middleware");
const requireIdempotencyKey = require("../../common/middleware/idempotency.middleware");

router.post(
  "/credit",
  authenticate,
  requireIdempotencyKey,
  walletController.credit,
);

router.get("/balance", authenticate, walletController.balance);

router.get("/transactions", authenticate, walletController.transactions);

module.exports = router;
