const express = require("express");
const router = express.Router();

const bookingController = require("../controller");
const { authenticate } = require("../../common/middleware/auth.middleware");

router.post("/reserve", authenticate, bookingController.reserveSeats);

module.exports = router;
