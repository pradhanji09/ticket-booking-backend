const express = require("express");
const router = express.Router();

const bookingController = require("../controller");
const { authenticate } = require("../../common/middleware/auth.middleware");
const requireIdempotencyKey = require("../../common/middleware/idempotency.middleware");

router.post("/reserve", authenticate, bookingController.reserveSeats);

router.post(
  "/confirm",
  authenticate,
  requireIdempotencyKey,
  bookingController.confirmBooking,
);

module.exports = router;
