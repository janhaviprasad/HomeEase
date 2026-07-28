const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

// Import your new function alongside the others
const { createBooking, updateBookingStatus, getAllBookings,deleteBooking } = require("../controllers/bookingController");

// Add the GET route
router.get("/", verifyToken, getAllBookings); 

router.post("/", verifyToken, createBooking);
router.patch("/:id/status", verifyToken, updateBookingStatus); 
router.delete("/:id", verifyToken, deleteBooking);

module.exports = router;