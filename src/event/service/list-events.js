const Event = require("../model/event.model");

const listEventsService = async (page, limit, status) => {
  try {
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .sort({ eventDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(filter);

    return {
      status: 200,
      data: {
        success: true,
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error in listEventsService:", error);
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = listEventsService;
