const db = require("../db");
const { sendSuccess, sendError } = require("../utils/responseHandler");

// ==========================================
// GET /api/analytics/bookings
// ==========================================
const getBookingAnalytics = (req, res) => {
    const sql = `
        SELECT
            COUNT(*) AS totalBookings,
            COUNT(CASE WHEN status = 'PENDING' THEN 1 END) AS pending,
            COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) AS accepted,
            COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) AS inProgress,
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completed,
            COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) AS cancelled,
            COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN total_price ELSE 0 END), 0) AS totalRevenue
        FROM bookings
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error("❌ getBookingAnalytics ERROR:", err.sqlMessage || err.message);
            console.error("SQL:", sql);
            return sendError(res, err.sqlMessage || err.message, 500);
        }
        return sendSuccess(res, result[0]);
    });
};

// ==========================================
// GET /api/analytics/providers/:id/earnings
// ==========================================
const getProviderEarnings = (req, res) => {
    const providerId = req.params.id;

    const sql = `
        SELECT
            COUNT(*) AS completedBookings,
            COALESCE(SUM(total_price), 0) AS totalEarnings
        FROM bookings
        WHERE provider_id = ?
        AND status = 'COMPLETED'
    `;

    db.query(sql, [providerId], (err, result) => {
        if (err) {
            console.error("❌ getProviderEarnings ERROR:", err.sqlMessage || err.message);
            return sendError(res, err.sqlMessage || err.message, 500);
        }
        return sendSuccess(res, result[0]);
    });
};

// ==========================================
// GET /api/analytics/services/popular
// ==========================================
const getPopularServices = (req, res) => {
    const sql = `
        SELECT
            sc.id,
            sc.category_name,
            COUNT(b.id) AS bookingCount,
            COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' THEN b.total_price ELSE 0 END), 0) AS revenue
        FROM service_categories sc
        LEFT JOIN bookings b ON sc.id = b.service_id
        GROUP BY sc.id, sc.category_name
        ORDER BY bookingCount DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error("❌ getPopularServices ERROR:", err.sqlMessage || err.message);
            console.error("SQL:", sql);
            return sendError(res, err.sqlMessage || err.message, 500);
        }
        return sendSuccess(res, result);
    });
};

module.exports = {
    getBookingAnalytics,
    getProviderEarnings,
    getPopularServices
};