const Booking = require("../model/booking.model");
const Seat = require("../../event/model/seat.model");
const Wallet = require("../../wallet/model/wallet.model");
const Transaction = require("../../wallet/model/transaction.model");
const runInTransaction = require("../../common/utils/run-transaction");

const cancelBookingService = async (bookingId, userId) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return {
        status: 404,
        data: { success: false, error: "Booking not found" },
      };
    }

    if (booking.status !== "CONFIRMED") {
      return {
        status: 409,
        data: { success: false, error: `Booking is already ${booking.status}` },
      };
    }

    const result = await runInTransaction(async (session) => {
      const wallet = await Wallet.findOneAndUpdate(
        { userId: booking.userId },
        { $inc: { balance: booking.amount } },
        { returnDocument: "after", session },
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
      booking.cancelledBy = userId;
      await booking.save({ session });

      return { refundTxn, booking };
    });

    return {
      status: 200,
      data: {
        success: true,
        data: {
          bookingId: result.booking._id,
          status: result.booking.status,
          refundAmount: booking.amount,
          refundTransactionId: result.refundTxn._id,
        },
      },
    };
  } catch (error) {
    console.error("Error in cancelBookingService:", error);
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = cancelBookingService;
