const Event = require("../model/event.model");
const Seat = require("../model/seat.model");

const getEventSeatsService = async (eventId, filterStatus) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return {
        status: 404,
        data: { success: false, error: "Event not found" },
      };
    }

    // Correction for expired RESERVED seats
    await Seat.updateMany(
      {
        eventId,
        status: "RESERVED",
        expiresAt: { $lte: new Date() },
      },
      {
        $set: {
          status: "AVAILABLE",
          reservedBy: null,
          reservedAt: null,
          expiresAt: null,
        },
      },
    );

    // Filter seats based on status
    const query = { eventId };
    if (filterStatus) {
      query.status = filterStatus;
    }

    const seats = await Seat.find(query).select("seatNumber status").lean();

    seats.sort((a, b) => {
      const numA = parseInt(a.seatNumber.replace(/\D/g, ""), 10);
      const numB = parseInt(b.seatNumber.replace(/\D/g, ""), 10);
      return numA - numB;
    });

    return {
      status: 200,
      data: { success: true, event: event.name, seats },
    };
  } catch (error) {
    console.error("Error in getSeatMapService:", error);
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = getEventSeatsService;
