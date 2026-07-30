const listEventsService = require("../service/list-events");

const listEventsController = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  if (status && !["ACTIVE", "CANCELLED", "ENDED"].includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status" });
  }

  const { status: statusCode, data } = await listEventsService(
    page,
    limit,
    status,
  );
  return res.status(statusCode).json(data);
};

module.exports = listEventsController;
