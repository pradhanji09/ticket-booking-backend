const createEventService = require("../service/create-event");

const createEventController = async (req, res) => {
  const { body, user } = req;
  const { name, description, eventDate, pricePerSeat } = body;
  if (!name || !eventDate || !pricePerSeat) {
    return res.status(400).json({
      success: false,
      message: "name, eventDate, pricePerSeat are required",
    });
  }
  const numPricePerSeat = Number(pricePerSeat);
  if (numPricePerSeat <= 0 || !Number.isInteger(numPricePerSeat)) {
    return res.status(400).json({
      success: false,
      message: "pricePerSeat must be a positive integer",
    });
  }

  const dtEventDate = new Date(eventDate);
  if (Number.isNaN(dtEventDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "eventDate must be a valid date",
    });
  }

  if (dtEventDate <= Date.now()) {
    return res.status(400).json({
      success: false,
      message: "eventDate must be a future date",
    });
  }

  const adminId = user?.id;

  const { status, data } = await createEventService({
    name,
    description,
    eventDate: dtEventDate,
    pricePerSeat: numPricePerSeat,
    createdBy: adminId,
  });
  return res.status(status).json(data);
};

module.exports = createEventController;
