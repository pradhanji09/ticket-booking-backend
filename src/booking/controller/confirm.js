const confirmBookingService = require("../service/confirm");

const confirmBookingController = async (req, res) => {
  const {
    body: { reservationGroupId },
    user: { id },
    idempotencyKey,
  } = req;

  if (!reservationGroupId) {
    return res.status(400).json({
      message: "Reservation group ID is required",
    });
  }

  const result = await confirmBookingService(
    id,
    reservationGroupId,
    idempotencyKey,
  );

  res.status(200).json({ message: "Booking confirmed successfully", result });
};

module.exports = confirmBookingController;
