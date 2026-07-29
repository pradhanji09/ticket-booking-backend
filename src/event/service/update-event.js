const Event = require("../model/event.model");

const updateEventService = async ({
  eventId,
  name,
  eventDate,
  description,
  pricePerSeat,
  adminId,
}) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return {
        status: 404,
        data: { success: false, error: "Event not found" },
      };
    }

    if (event.status === "CANCELLED" || event.status === "ENDED") {
      return {
        status: 409,
        data: {
          success: false,
          error: "Cannot update a cancelled or ended event",
        },
      };
    }

    if (name !== undefined) event.name = name;
    if (description !== undefined) event.description = description;
    if (eventDate !== undefined) event.eventDate = eventDate;
    if (pricePerSeat !== undefined) event.pricePerSeat = pricePerSeat;

    await event.save();

    return {
      status: 200,
      data: {
        success: true,
        event: {
          id: event._id,
          name: event.name,
          eventDate: event.eventDate,
          description: event.description,
          pricePerSeat: event.pricePerSeat,
          totalSeats: event.totalSeats,
          status: event.status,
        },
      },
    };
  } catch (error) {
    console.error("Error in updateEventService:", error);
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = updateEventService;
