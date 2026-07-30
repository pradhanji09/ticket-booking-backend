const Event = require("../model/event.model");

const createEventService = async (
  name,
  description,
  eventDate,
  seatPrice,
  createdBy,
) => {
  try {
    const event = await Event.create({
      name,
      description,
      eventDate,
      pricePerSeat: seatPrice,
      createdBy,
    });

    return {
      status: 201,
      data: { success: true, event },
    };
  } catch (error) {
    console.error("Error in createEventService:", error);
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = createEventService;
