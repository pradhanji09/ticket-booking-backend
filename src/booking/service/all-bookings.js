const Booking = require("../model/booking.model");

const getAllBookingsService = async (
  page,
  limit,
  userId,
  eventId,
  filterSatus,
) => {
  try {
    const skip = (page - 1) * limit;

    const query = {};
    if (userId) query.userId = userId;
    if (eventId) query.eventId = eventId;
    if (filterSatus) query.status = filterSatus;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("userId", "name email")
        .populate("eventId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);

    const formatted = bookings.map((b) => ({
      id: b._id,
      user: b.userId
        ? { id: b.userId._id, name: b.userId.name, email: b.userId.email }
        : null,
      event: b.eventId ? { id: b.eventId._id, name: b.eventId.name } : null,
      seatCount: b.seatCount,
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
    console.error("Error in getAllBookingsService:", error);
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = getAllBookingsService;
