const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

const {
    createBooking,
    updateBookingStatus,
    getAllBookings,
    deleteBooking,
    getBookingById
} = require("../controllers/bookingController");

// GET /api/bookings — ALL authenticated users (role filtering happens inside controller)
router.get("/", verifyToken, getAllBookings);

// POST /api/bookings — any authenticated user can create a booking
router.post("/", verifyToken, createBooking);

// PATCH /api/bookings/:id/status — any authenticated user (controller checks ownership)
router.patch("/:id/status", verifyToken, updateBookingStatus);

// DELETE /api/bookings/:id — any authenticated user (controller checks ownership)
router.delete("/:id", verifyToken, deleteBooking);

module.exports = router;