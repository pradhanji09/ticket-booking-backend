const reserveSeatsService = require("../service/reserve");

const reserveSeatsController = async (req, res) => {
  const { user, body } = req;
  const { userId } = user;
  const { eventId, seatIds } = body;

  if (!eventId)
    return res
      .status(400)
      .json({ success: false, error: "Event ID is required" });

  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0)
    return res
      .status(400)
      .json({ success: false, error: "Seat IDs must be a non-empty array" });

  const { status, data } = await reserveSeatsService(userId, eventId, seatIds);

  res.status(status).json(data);
};

module.exports = reserveSeatsController;
