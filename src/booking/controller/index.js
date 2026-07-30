const reserveSeats = require("./reserve");
const confirmBooking = require("./confirm");
const cancelBooking = require("./cancel");
const getUserBookings = require("./user-bookings");
const getAllBookings = require("./all-bookings");

module.exports = {
  reserveSeats,
  confirmBooking,
  cancelBooking,
  getUserBookings,
  getAllBookings,
};
