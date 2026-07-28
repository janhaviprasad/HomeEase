const express = require("express");
const router = express.Router();

// Middleware
const verifyToken = require("../middleware/authMiddleware");

// Controller
const {
    getBookingAnalytics,
    getProviderEarnings,
    getPopularServices
} = require("../controllers/analyticsController");

// ================================
// Booking Analytics
// GET /api/analytics/bookings
// ================================
router.get(
    "/bookings",
    verifyToken,
    getBookingAnalytics
);

// ====================================
// Provider Earnings
// GET /api/analytics/providers/:id/earnings
// ====================================
router.get(
    "/providers/:id/earnings",
    verifyToken,
    getProviderEarnings
);

// ====================================
// Popular Services
// GET /api/analytics/services/popular
// ====================================
router.get(
    "/services/popular",
    verifyToken,
    getPopularServices
);

module.exports = router;