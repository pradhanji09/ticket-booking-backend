const crypto = require("crypto");
const Event = require("../../event/model/event.model");
const Seat = require("../../event/model/seat.model");
const runInTransaction = require("../../common/utils/run-transaction");

const RESERVATION_DURATION_MS = 5 * 60 * 1000;

const reserveSeatsService = async (userId, eventId, seatIds) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return {
        status: 404,
        data: { success: false, error: "Event not found" },
      };
    }

    // lazy end-of-event correction
    if (event.status === "ACTIVE" && event.eventDate < new Date()) {
      event.status = "ENDED";
      await event.save();
    }

    if (event.status !== "ACTIVE") {
      return {
        status: 409,
        data: {
          success: false,
          error: `Event is ${event.status}, cannot reserve seats`,
        },
      };
    }

    const reservationGroupId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + RESERVATION_DURATION_MS);

    const reservedSeats = await runInTransaction(async (session) => {
      const results = [];

      for (const seatId of seatIds) {
        // find seat and check if it is available and not expired if expired then update it
        const seat = await Seat.findOneAndUpdate(
          {
            _id: seatId,
            eventId,
            $or: [
              { status: "AVAILABLE" },
              { status: "RESERVED", expiresAt: { $lt: new Date() } },
            ],
          },
          {
            $set: {
              status: "RESERVED",
              reservedBy: userId,
              reservedAt: new Date(),
              expiresAt,
              reservationGroupId,
            },
          },
          { returnDocument: "after", session },
        );

        if (!seat) {
          throw new Error(`SEAT_UNAVAILABLE:${seatId}`);
        }

        results.push(seat);
      }

      return results;
    });

    return {
      status: 200,
      data: {
        success: true,
        data: {
          reservationGroupId,
          eventId,
          seats: reservedSeats.map((s) => ({
            id: s._id,
            seatNumber: s.seatNumber,
            status: s.status,
          })),
          expiresAt,
          amount: reservedSeats.length * event.pricePerSeat,
        },
      },
    };
  } catch (error) {
    if (
      typeof error.message === "string" &&
      error.message.startsWith("SEAT_UNAVAILABLE:")
    ) {
      const seatId = error.message.split(":")[1];
      return {
        status: 409,
        data: {
          success: false,
          error: `Seat ${seatId} is no longer available`,
        },
      };
    }
    console.error("Error in reserveSeatsService:", error);
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = reserveSeatsService;
