const cancelEventService = require("../service/cancel-event");

const cancelEventController = async (req, res) => {
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ success: false, error: "Invalid event ID" });

  const { status, data } = await cancelEventService(id);

  return res.status(status).json(data);
};

module.exports = cancelEventController;
