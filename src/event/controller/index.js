const createEvent = require("./create-event");
const updateEvent = require("./update-event");
const cancelEvent = require("./delete-event");
const bulkCreateSeats = require("./bulk-create-seats");
const listEvents = require("./list-events");
const getEventDetail = require("./get-event");
const getSeatDetail = require("./get-seat-detail");

module.exports = {
  createEvent,
  updateEvent,
  cancelEvent,
  bulkCreateSeats,
  listEvents,
  getEventDetail,
  getSeatDetail,
};
