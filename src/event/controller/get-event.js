const getEventDetailService = require("../service/get-event");

const getEventDetailController = async (req, res) => {
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ success: false, error: "ID is required" });

  const { status, data } = await getEventDetailService(id);

  return res.status(status).json(data);
};

module.exports = getEventDetailController;
