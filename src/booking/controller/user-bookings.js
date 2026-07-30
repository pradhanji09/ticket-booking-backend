const getUserBookingsService = require("../service/user-bookings");

const getUserBookingsController = async (req, res) => {
  const { user, query } = req;

  const { id: userId } = user;
  const { page = 1, limit = 10, status: filterStatus } = query;
  if (filterStatus && !["CONFIRMED", "CANCELLED"].includes(filterStatus)) {
    return res.status(400).json({ status: false, message: "Invalid status" });
  }

  const { data, status } = await getUserBookingsService(
    userId,
    page,
    limit,
    filterStatus,
  );

  return res.status(status).json(data);
};

module.exports = getUserBookingsController;
