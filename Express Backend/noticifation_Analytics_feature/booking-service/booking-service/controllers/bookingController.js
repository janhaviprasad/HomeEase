const db = require("../db");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const {
    getUserById,
    getProviderByUserId
} = require("../services/authService");

const {
    getServiceById
} = require("./serviceController");

// ==========================================
// CREATE BOOKING
// ==========================================
const createBooking = (req, res) => {
    console.log("Decoded User Object:", req.user);
    const { service_id, provider_id, booking_date, address } = req.body;
    const customer_id = req.user.sub;

    // validation
    if (!service_id || !provider_id || !booking_date || !address) {
        return sendError(res, "Missing required fields", 400);
    }

    // Prevent customer from booking themselves
    if (String(provider_id) === String(customer_id)) {
        return sendError(res, "You cannot book yourself as a provider", 400);
    }

    const getPrice = "SELECT price FROM service_categories WHERE id=?";

    db.query(getPrice, [service_id], (err, results) => {
        if (err) {
            return sendError(res, err.message, 500);
        }

        if (results.length === 0) {
            return sendError(res, "Service not found", 404);
        }

        const total_price = results[0].price;
        const insertSql = `
            INSERT INTO bookings
            (customer_id, provider_id, service_id, booking_date, address, total_price, status)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
        `;

        db.query(insertSql, [customer_id, provider_id, service_id, booking_date, address, total_price], (err, result) => {
            if (err) {
                return sendError(res, err.message, 500);
            }

            const bookingId = result.insertId;

            const notificationSql = `
                INSERT INTO notifications (user_id, type, title, message, booking_id)
                VALUES (?, ?, ?, ?, ?)
            `;
            db.query(notificationSql, [
                customer_id,
                "BOOKING_CREATED",
                "Booking Created",
                "Your booking has been created successfully.",
                bookingId
            ], (notificationError) => {
                if (notificationError) {
                    console.log("Notification Error:", notificationError.message);
                }
                return sendSuccess(res, { booking_id: bookingId }, 201);
            });
        });
    });
};

// ==========================================
// GET ALL BOOKINGS (role-aware)
// ==========================================
const getAllBookings = async (req, res) => {
    const { status, page = 0, size = 20 } = req.query;
    const userRole = req.user.role;
    const userId = req.user.sub;

    const limit = parseInt(size);
    const offset = parseInt(page) * limit;

    let sql = `SELECT * FROM bookings`;
    const params = [];

    if (userRole === "CUSTOMER") {
        sql += ` WHERE customer_id = ?`;
        params.push(userId);
    } else if (userRole === "PROVIDER") {
        sql += ` WHERE provider_id = ?`;
        params.push(userId);
    }

    if (status) {
        sql += params.length > 0 ? ` AND status = ?` : ` WHERE status = ?`;
        params.push(status);
    }

    sql += ` ORDER BY booking_date DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.query(sql, params, async (err, results) => {
        if (err) {
            console.error("❌ getAllBookings SQL ERROR:", err.sqlMessage || err.message);
            return sendError(res, err.message, 500);
        }

        try {
            const bookings = await Promise.all(
                results.map(async (booking) => {
                    let customer = null;
                    let provider = null;
                    let service = null;

                    // Fetch customer
                    try {
                        const customerResponse = await getUserById(
                            booking.customer_id,
                            req.headers.authorization
                        );
                        customer = customerResponse?.data || null;
                    } catch (e) {
                        customer = { id: booking.customer_id, name: "Unknown Customer" };
                    }

                    // Fetch provider — use /api/providers/user/{userId} for rich data
                    // Fallback to /api/users/{id} if provider endpoint 404s (invalid provider_id)
                    if (booking.provider_id) {
                        try {
                            const providerResponse = await getProviderByUserId(
                                booking.provider_id,
                                req.headers.authorization
                            );
                            provider = providerResponse?.data?.data || null;
                        } catch (e) {
                            console.log(`Provider endpoint 404 for userId ${booking.provider_id}, falling back to user lookup`);
                            try {
                                const userResp = await getUserById(
                                    booking.provider_id,
                                    req.headers.authorization
                                );
                                provider = userResp?.data || { id: booking.provider_id, name: "Unknown Provider" };
                            } catch (e2) {
                                provider = { id: booking.provider_id, name: "Unknown Provider" };
                            }
                        }
                    }

                    // Fetch service
                    try {
                        service = await getServiceById(booking.service_id);
                    } catch (e) {
                        service = { id: booking.service_id, category_name: "Unknown Service" };
                    }

                    return { ...booking, customer, provider, service };
                })
            );

            return sendSuccess(res, {
                page: Number(page),
                size: limit,
                count: bookings.length,
                bookings
            });

        } catch (error) {
            console.error("Unexpected error in getAllBookings:", error.message);
            return sendError(res, "Unable to fetch booking details", 500);
        }
    });
};

// ==========================================
// GET SINGLE BOOKING BY ID
// ==========================================
const getBookingById = async (req, res) => {
    const { id } = req.params;

    db.query(`SELECT * FROM bookings WHERE id = ?`, [id], async (err, results) => {
        if (err) {
            console.error("❌ getBookingById SQL ERROR:", err.sqlMessage || err.message);
            return sendError(res, err.message, 500);
        }

        if (results.length === 0) {
            return sendError(res, "Booking not found", 404);
        }

        const booking = results[0];

        try {
            let customer = null;
            try {
                const customerResponse = await getUserById(
                    booking.customer_id,
                    req.headers.authorization
                );
                customer = customerResponse?.data || null;
            } catch (e) {
                customer = { id: booking.customer_id, name: "Unknown Customer" };
            }

            let provider = null;
            if (booking.provider_id) {
                try {
                    const providerResponse = await getProviderByUserId(
                        booking.provider_id,
                        req.headers.authorization
                    );
                    provider = providerResponse?.data?.data || null;
                } catch (e) {
                    console.log(`Provider endpoint 404 for userId ${booking.provider_id}, falling back to user lookup`);
                    try {
                        const userResp = await getUserById(
                            booking.provider_id,
                            req.headers.authorization
                        );
                        provider = userResp?.data || { id: booking.provider_id, name: "Unknown Provider" };
                    } catch (e2) {
                        provider = { id: booking.provider_id, name: "Unknown Provider" };
                    }
                }
            }

            let service = null;
            try {
                service = await getServiceById(booking.service_id);
            } catch (e) {
                service = { id: booking.service_id, category_name: "Unknown Service" };
            }

            return sendSuccess(res, { ...booking, customer, provider, service });

        } catch (error) {
            console.error("Unexpected error in getBookingById:", error.message);
            return sendError(res, "Unable to fetch booking details", 500);
        }
    });
};

// ==========================================
// UPDATE BOOKING STATUS
// ==========================================
const updateBookingStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    let timestampColumn = null;
    let providerUpdate = "";
    const params = [status];

    if (status === "ACCEPTED") {
        timestampColumn = "accepted_at";
        providerUpdate = ", provider_id=? ";
        // FIX: req.user.sub (from JWT), NOT req.user.id (undefined)
        params.push(req.user.sub);

    } else if (status === "COMPLETED") {
        timestampColumn = "completed_at";

    } else if (status === "CANCELLED") {
        timestampColumn = "cancelled_at";
    }

    let sql = `UPDATE bookings SET status=?`;

    if (timestampColumn) {
        sql += `, ${timestampColumn}= CURRENT_TIMESTAMP`;
    }

    sql += providerUpdate + ` WHERE id=?`;
    params.push(id);

    db.query(sql, params, (err, result) => {
        if (err) {
            return sendError(res, err.message, 500);
        }

        if (result.affectedRows === 0) {
            return sendError(res, "Booking not found", 404);
        }

        return sendSuccess(res, { bookingStatus: status });
    });
};

// ==========================================
// DELETE BOOKING
// ==========================================
const deleteBooking = (req, res) => {
    const bookingId = req.params.id;
    const customer_id = req.user.sub;

    const sql = `DELETE FROM bookings WHERE id = ? AND customer_id = ?`;

    db.query(sql, [bookingId, customer_id], (err, result) => {
        if (err) {
            return sendError(res, err.message, 500);
        }

        if (result.affectedRows === 0) {
            return sendError(res, "Booking not found or unauthorized", 404);
        }

        return sendSuccess(res, { deletedBookingId: bookingId }, "Booking deleted successfully");
    });
};

module.exports = {
    createBooking,
    updateBookingStatus,
    getAllBookings,
    deleteBooking,
    getBookingById
};