const Booking = require("../model/booking.model");
const Seat = require("../../event/model/seat.model");

const getUserBookingsService = async (userId, page, limit, filterStatus) => {
  try {
    const skip = (page - 1) * limit;

    const query = { userId };
    if (filterStatus) query.status = filterStatus;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("eventId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);

    // fetch seat numbers for display
    const allSeatIds = bookings.flatMap((b) => b.seatIds);
    const seats = await Seat.find({ _id: { $in: allSeatIds } })
      .select("seatNumber")
      .lean();
    const seatMap = new Map(seats.map((s) => [s._id.toString(), s.seatNumber]));

    const formatted = bookings.map((b) => ({
      id: b._id,
      eventId: b.eventId?._id,
      eventName: b.eventId?.name,
      seatCount: b.seatCount,
      seats: b.seatIds.map((id) => seatMap.get(id.toString())),
      amount: b.amount,
      status: b.status,
      createdAt: b.createdAt,
    }));

    return {
      status: 200,
      data: {
        success: true,
        data: {
          bookings: formatted,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
    };
  } catch (error) {
    console.error("Error in getMyBookingsService:", error);
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = getUserBookingsService;
