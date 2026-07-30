const express = require("express");
const router = express.Router();
const eventController = require("../controller");
const {
  authenticate,
  requireAdmin,
} = require("../../common/middleware/auth.middleware");

router.post("/", authenticate, requireAdmin, eventController.createEvent);

router.put("/:id", authenticate, requireAdmin, eventController.updateEvent);

router.delete("/:id", authenticate, requireAdmin, eventController.cancelEvent);

router.get("/", eventController.listEvents);

router.get("/:id", eventController.getEventDetail);

router.get("/:id/seats", eventController.getSeatDetail);

router.post(
  "/:id/seats/bulk",
  authenticate,
  requireAdmin,
  eventController.bulkCreateSeats,
);

module.exports = router;
