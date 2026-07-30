const express = require("express");
const router = express.Router();

const bookingController = require("../controller");
const {
  authenticate,
  requireAdmin,
} = require("../../common/middleware/auth.middleware");
const requireIdempotencyKey = require("../../common/middleware/idempotency.middleware");

router.post("/reserve", authenticate, bookingController.reserveSeats);

router.post(
  "/:id/cancel",
  authenticate,
  requireAdmin,
  bookingController.cancelBooking,
);

router.get("/my", authenticate, bookingController.getUserBookings);

router.get(
  "/admin",
  authenticate,
  requireAdmin,
  bookingController.getAllBookings,
);

router.post(
  "/confirm",
  authenticate,
  requireIdempotencyKey,
  bookingController.confirmBooking,
);

module.exports = router;
