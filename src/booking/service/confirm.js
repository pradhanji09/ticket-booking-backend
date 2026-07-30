const Booking = require("../model/booking.model");
const Seat = require("../../event/model/seat.model");
const Event = require("../../event/model/event.model");
const Wallet = require("../../wallet/model/wallet.model");

const { formatBooking } = require("../helper/booking.helper");
const Transaction = require("../../wallet/model/transaction.model");
const runInTransaction = require("../../common/utils/run-transaction");

const confirmBookingService = async (
  userId,
  reservationGroupId,
  idempotencyKey,
) => {
  try {
    const existingBooking = await Booking.findOne({ idempotencyKey });
    if (existingBooking) {
      return {
        status: 200,
        data: {
          success: true,
          data: formatBooking(existingBooking),
        },
      };
    }

    // Reservation group ID specific, user ID reserved.
    const seats = await Seat.find({ reservationGroupId, reservedBy: userId });
    if (seats.length === 0) {
      return {
        status: 404,
        data: { success: false, error: "Reservation not found" },
      };
    }

    // Timeout Expiry
    const now = new Date();
    const hasExpired = seats.some((s) => !s.expiresAt || s.expiresAt < now);
    if (hasExpired) {
      return {
        status: 410,
        data: { success: false, error: "Reservation has expired" },
      };
    }

    // Is Event Active
    const event = await Event.findById(seats[0].eventId);
    if (!event || event.status !== "ACTIVE") {
      return {
        status: 409,
        data: { success: false, error: "Event is not active" },
      };
    }

    const amount = seats.length * event.pricePerSeat;
    const seatIds = seats.map((s) => s._id);

    let booking;

    try {
      booking = await runInTransaction(async (session) => {
        // Wallet Balance check & Debit
        const wallet = await Wallet.findOneAndUpdate(
          { userId, balance: { $gte: amount } },
          { $inc: { balance: -amount } },
          { returnDocument: "after", session },
        );

        if (!wallet) throw new Error("INSUFFICIENT_BALANCE");

        // Record Transaction
        const [transaction] = await Transaction.create(
          [
            {
              userId,
              type: "DEBIT",
              amount,
              reason: "BOOKING",
              balanceAfter: wallet.balance,
              idempotencyKey,
            },
          ],
          { session },
        );

        // Seat Update RESERVED -> BOOKED
        const updateResult = await Seat.updateMany(
          {
            _id: { $in: seatIds },
            reservationGroupId,
            reservedBy: userId,
            status: "RESERVED",
            expiresAt: { $gte: new Date() },
          },
          {
            $set: { status: "BOOKED", bookedBy: userId },
            $unset: { reservedAt: "", expiresAt: "", reservedBy: "" },
          },
          { session },
        );

        // Check all modified or less
        if (updateResult.modifiedCount !== seats.length)
          throw new Error("SEATS_NO_LONGER_AVAILABLE");

        // Create Booking
        const [newBooking] = await Booking.create(
          [
            {
              userId: userId,
              eventId: event._id,
              seatIds,
              seatCount: seats.length,
              amount,
              transactionId: transaction._id,
              reservationGroupId,
              idempotencyKey,
            },
          ],
          { session },
        );

        return newBooking;
      });
    } catch (error) {
      if (error.message === "INSUFFICIENT_BALANCE") {
        return {
          status: 402,
          data: { success: false, error: "Insufficient wallet balance" },
        };
      }
      if (error.message === "SEATS_NO_LONGER_AVAILABLE") {
        return {
          status: 409,
          data: {
            success: false,
            error: "One or more seats are no longer available",
          },
        };
      }
      if (error.code === 11000) {
        // race condition idempotency key
        const raced = await Booking.findOne({ idempotencyKey });
        if (raced) {
          return {
            status: 200,
            data: { success: true, data: formatBooking(raced) },
          };
        }
      }

      throw error;
    }

    return {
      status: 200,
      data: {
        success: true,
        data: formatBooking(booking),
      },
    };
  } catch (error) {
    console.error("Error in confirmBookingService:", error);
    return {
      status: 500,
      data: { success: false, error: "Internal server error" },
    };
  }
};

module.exports = confirmBookingService;
