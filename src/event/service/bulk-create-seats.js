const runInTransaction = require("../../common/utils/run-transaction");
const Event = require("../model/event.model");
const Seat = require("../model/seat.model");

const bulkCreateSeatsService = async (eventId, count, prefix = "S") => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return {
        status: 404,
        data: { success: false, error: "Event not found" },
      };
    }

    if (event.status !== "ACTIVE") {
      return {
        status: 409,
        data: {
          success: false,
          error: `Cannot add seats to an event with status ${event.status}`,
        },
      };
    }

    const startNum = event.totalSeats + 1;
    const seatsToInsert = [];
    for (let i = 0; i < count; i++) {
      seatsToInsert.push({
        eventId,
        seatNumber: `${prefix}${startNum + i}`,
        status: "AVAILABLE",
      });
    }

    //  Atomic Transaction
    const insertedSeats = await runInTransaction(async (session) => {
      const created = await Seat.insertMany(seatsToInsert, { session });

      await Event.updateOne(
        { _id: eventId },
        { $inc: { totalSeats: count } },
        { session },
      );
      return created;
    });

    return {
      status: 201,
      data: {
        success: true,
        data: {
          created: insertedSeats.length,
          seats: insertedSeats.map((s) => ({
            id: s._id,
            seatNumber: s.seatNumber,
            status: s.status,
          })),
        },
      },
    };
  } catch (error) {
    console.error("Error in bulkCreateSeatsService:", error);
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = bulkCreateSeatsService;
