const getEventSeatsService = require("../service/get-seat-map");

const getEventSeatsController = async (req, res) => {
  const { id } = req.params;
  const { status: filterStatus } = req.query;

  if (!id)
    return res.status(400).json({ success: false, error: "ID is required" });

  if (
    filterStatus &&
    !["AVAILABLE", "RESERVED", "BOOKED"].includes(filterStatus)
  ) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid filter status" });
  }

  const { status, data } = await getEventSeatsService(eventId, filterStatus);

  return res.status(status).json(data);
};

module.exports = getEventSeatsController;
