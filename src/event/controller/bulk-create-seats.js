const bulkCreateSeatsService = require("../service/bulk-create-seats");

const bulkCreateSeatsController = async (req, res) => {
  const { body, params } = req;

  const { count, prefix } = body;
  if (!count || !params.id) {
    return res.status(400).json({
      success: false,
      message: "count and eventId are required",
    });
  }

  if (typeof count !== "number" || count <= 0) {
    return res.status(400).json({
      success: false,
      message: "count must be a positive number",
    });
  }

  const { status, data } = await bulkCreateSeatsService(
    params.id,
    count,
    prefix,
  );

  return res.status(status).json(data);
};

module.exports = bulkCreateSeatsController;
