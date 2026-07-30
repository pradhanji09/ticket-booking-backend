const cancelBookingService = require("../service/cancel");

const cancelBookingController = async (req, res) => {
  const { id: bookingId } = req.params;
  const { id: userId } = req.user;

  if (!bookingId) {
    return res.status(400).json({
      message: "Booking ID is required",
    });
  }

  const { data, status } = await cancelBookingService(bookingId, userId);

  res.status(status).json(data);
};

module.exports = cancelBookingController;
