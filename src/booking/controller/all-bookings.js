const getAllBookingsService = require("../service/all-bookings");

const getAllBookingsController = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    userId,
    eventId,
    status: filterSatus,
  } = req.query;

  if (filterSatus && !["CONFIRMED", "CANCELLED"].includes(filterSatus)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid status filter",
    });
  }

  const { status, data } = await getAllBookingsService(
    page,
    limit,
    userId,
    eventId,
    filterSatus,
  );

  res.status(status).json(data);
};

module.exports = getAllBookingsController;
