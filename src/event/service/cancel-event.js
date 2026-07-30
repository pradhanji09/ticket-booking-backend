const Event = require("../model/event.model");
const Seat = require("../model/seat.model");
const Booking = require("../../booking/model/booking.model");
const Wallet = require("../../wallet/model/wallet.model");
const Transaction = require("../../wallet/model/transaction.model");
const runInTransaction = require("../../common/utils/run-transaction");

const cancelEventService = async (eventId) => {
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
        data: { success: false, error: "Event is already cancelled or ended" },
      };
    }

    // Confirmed booking
    const confirmedBookings = await Booking.find({
      eventId,
      status: "CONFIRMED",
    });

    let refundedCount = 0;
    let failedCount = 0;

    for (const booking of confirmedBookings) {
      try {
        await runInTransaction(async (session) => {
          const wallet = await Wallet.findOneAndUpdate(
            { userId: booking.userId },
            { $inc: { balance: booking.amount } },
            { new: true, session },
          );

          const [refundTxn] = await Transaction.create(
            [
              {
                userId: booking.userId,
                type: "CREDIT",
                amount: booking.amount,
                reason: "REFUND",
                referenceId: booking._id,
                balanceAfter: wallet.balance,
              },
            ],
            { session },
          );

          await Seat.updateMany(
            { _id: { $in: booking.seatIds } },
            {
              $set: { status: "AVAILABLE" },
              $unset: {
                bookedBy: "",
                reservedBy: "",
                reservedAt: "",
                expiresAt: "",
                reservationGroupId: "",
              },
            },
            { session },
          );

          booking.status = "CANCELLED";
          booking.refundTransactionId = refundTxn._id;
          await booking.save({ session });
        });

        refundedCount++;
      } catch (refundErr) {
        console.error(`Refund failed for booking ${booking._id}:`, refundErr);
        failedCount++;
      }
    }

    // Release RESERVED seats
    await Seat.updateMany(
      { eventId, status: "RESERVED" },
      {
        $set: { status: "AVAILABLE" },
        $unset: {
          reservedBy: "",
          reservedAt: "",
          expiresAt: "",
          reservationGroupId: "",
        },
      },
    );

    // Mark the event cancelled
    event.status = "CANCELLED";
    await event.save();

    return {
      status: 200,
      data: {
        success: true,
        message: "Event cancelled successfully",
        refundedBookings: refundedCount,
        failedRefunds: failedCount,
      },
    };
  } catch (error) {
    console.error("Error in cancelEventService:", error);
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = cancelEventService;
