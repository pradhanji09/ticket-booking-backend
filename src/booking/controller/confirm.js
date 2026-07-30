const confirmBookingService = require("../service/confirm");

const confirmBookingController = async (req, res) => {
  const {
    body: { reservationGroupId },
    user: { id: userId },
    idempotencyKey,
  } = req;

  if (!reservationGroupId) {
    return res.status(400).json({
      message: "Reservation group ID is required",
    });
  }

  const { data, status } = await confirmBookingService(
    userId,
    reservationGroupId,
    idempotencyKey,
  );

  res.status(status).json(data);
};

module.exports = confirmBookingController;
