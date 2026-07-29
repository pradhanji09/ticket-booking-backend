const updateEventService = require("../service/update-event");

const updateEventController = async (req, res) => {
  const { body, user } = req;
  const { id } = req.params;
  const adminId = user?.id;
  const { name, eventDate, description, pricePerSeat } = body;

  if (
    pricePerSeat &&
    (Number(pricePerSeat) <= 0 || !Number.isInteger(Number(pricePerSeat)))
  ) {
    return res.status(400).json({
      success: false,
      message: "pricePerSeat must be a positive integer",
    });
  }

  if (eventDate && Number.isNaN(new Date(eventDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: "eventDate must be a valid date",
    });
  }

  if (eventDate && new Date(eventDate).getTime() <= Date.now()) {
    return res.status(400).json({
      success: false,
      message: "eventDate must be a future date",
    });
  }

  const { status, data } = await updateEventService({
    eventId: id,
    name,
    eventDate,
    description,
    pricePerSeat,
    adminId,
  });
  return res.status(status).json(data);
};

module.exports = updateEventController;
