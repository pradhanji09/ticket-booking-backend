const Event = require("../model/event.model");

const getEventDetailService = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return {
        status: 404,
        data: { success: false, error: "Event not found" },
      };
    }

    return {
      status: 200,
      data: { success: true, event },
    };
  } catch (error) {
    console.error("Error in getEventDetailService:", error);
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = getEventDetailService;
