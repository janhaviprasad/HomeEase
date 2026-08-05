const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    getDashboard,
    getPendingBookings,
    getAvailableBookings,
    acceptBooking,
    rejectBooking,
    getAcceptedBookings,
    startService,
    completeService,
    getCompletedBookings,
    getTodayBookings,
    getProviderBookings
} = require("../controllers/providerBookingController");



router.get("/dashboard", verifyToken, getDashboard);

router.get("/bookings", verifyToken, getProviderBookings);
router.get("/bookings/pending", verifyToken, getPendingBookings);

router.get("/bookings/available", verifyToken, getAvailableBookings);



router.put("/bookings/:id/accept", verifyToken, acceptBooking);

router.put("/bookings/:id/reject", verifyToken, rejectBooking);

router.get("/bookings/accepted", verifyToken, getAcceptedBookings);

router.put("/bookings/:id/start", verifyToken, startService);

router.put("/bookings/:id/complete", verifyToken, completeService);

router.get("/bookings/completed", verifyToken, getCompletedBookings);

router.get("/bookings/today", verifyToken, getTodayBookings);

module.exports = router;