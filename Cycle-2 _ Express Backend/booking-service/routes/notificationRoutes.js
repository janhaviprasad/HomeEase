// Import Express
const express = require("express");

// Create a Router object
const router = express.Router();

// Import Authentication Middleware
// This checks whether the user is logged in or not.
const verifyToken = require("../middleware/authMiddleware");

// Import Notification Controller
// These functions contain the business logic.
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require("../controllers/notificationController");


// =======================================================
// GET ALL NOTIFICATIONS
// URL : GET /api/notifications
//
// Flow
// Client
//      ↓
// verifyToken()
//      ↓
// getNotifications()
// =======================================================
router.get(
    "/",
    verifyToken,
    getNotifications
);


// =======================================================
// MARK ONE NOTIFICATION AS READ
// URL : PUT /api/notifications/5/read
//
// Example
// Notification ID = 5
// =======================================================
router.put(
    "/:id/read",
    verifyToken,
    markAsRead
);


// =======================================================
// MARK ALL NOTIFICATIONS AS READ
// URL : PUT /api/notifications/read-all
// =======================================================
router.put(
    "/read-all",
    verifyToken,
    markAllAsRead
);


// =======================================================
// DELETE NOTIFICATION
// URL : DELETE /api/notifications/5
// =======================================================
router.delete(
    "/:id",
    verifyToken,
    deleteNotification
);


// Export Router
module.exports = router;