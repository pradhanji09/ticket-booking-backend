function formatBooking(booking) {
  return {
    bookingId: booking._id,
    eventId: booking.eventId,
    seatCount: booking.seatCount,
    amount: booking.amount,
    status: booking.status,
    transactionId: booking.transactionId,
    createdAt: booking.createdAt,
  };
}

module.exports = { formatBooking };
