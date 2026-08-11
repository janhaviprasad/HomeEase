const db = require("../db");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const { createNotification } = require("../services/notificationService");

const {
    getUserById,
    getProviderByUserId,
    listProvidersByCategory
} = require("../services/authService");

const {
    getServiceById
} = require("./serviceController");

// MySQL DATETIME rejects ISO-8601 with a timezone suffix, so a body carrying
// "2026-08-15T10:00:00.000Z" used to 500. Mobile already sends local wall-clock
// "YYYY-MM-DD HH:mm:ss" (formatBookingDateForApi), which passes through
// untouched; anything else parseable is converted to that same local wall-clock
// form so both clients agree on what the stored value means.
const toMysqlDateTime = (value) => {
    if (typeof value !== "string" || /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
        return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    const pad = (n) => String(n).padStart(2, "0");

    return (
        `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ` +
        `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`
    );
};

const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            return err ? reject(err) : resolve(result);
        });
    });
};

// reviews.booking_id is UNIQUE, so presence is all the caller needs. A lookup
// failure must not fail the booking response, so it degrades to false.
const hasReview = async (bookingId) => {
    try {
        const rows = await runQuery("SELECT 1 FROM reviews WHERE booking_id = ? LIMIT 1", [bookingId]);
        return rows.length > 0;
    } catch (e) {
        console.error("[hasReview] lookup failed for booking", bookingId, e.message);
        return false;
    }
};

// Used by createBooking only. getAllBookings and getBookingById carry their own
// copies of this logic; folding those into this helper is a separate change.
const enrichBooking = async (booking, authHeader) => {

    let customer = null;
    try {
        const customerResponse = await getUserById(booking.customer_id, authHeader);
        customer = customerResponse?.data || null;
    } catch (e) {
        customer = { id: booking.customer_id, name: "Unknown Customer" };
    }

    let provider = null;
    if (booking.provider_id) {
        try {
            const providerResponse = await getProviderByUserId(booking.provider_id, authHeader);
            provider = providerResponse?.data?.data || null;
        } catch (e) {
            try {
                const userResp = await getUserById(booking.provider_id, authHeader);
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

    // The flat *_name fields are what the admin dashboard reads; the nested
    // objects stay because mobile depends on them.
    return {
        ...booking,
        customer,
        provider,
        service,
        customer_name: customer?.name || null,
        provider_name: provider?.name || null,
        has_review: await hasReview(booking.id)
    };
};

// ==========================================
// CREATE BOOKING
// ==========================================
const createBooking = async (req, res) => {

    const { service_id, booking_date, address } = req.body;
    const customer_id = req.user.sub;

    if (req.body.provider_id !== undefined) {
        console.warn("[createBooking] legacy provider_id in body ignored — auto-assign in effect");
    }

    if (!service_id || !booking_date || !address) {
        return sendError(res, "Missing required fields", 400);
    }

    try {

        // service_id IS the category id — bookings.service_id points at
        // service_categories.id, the same id space providers.category_id uses.
        // This lookup is here for the price and the 404, not to resolve a category.
        // total_price is always derived here; a body-supplied price is ignored.
        const services = await runQuery(
            "SELECT id, price FROM service_categories WHERE id = ?",
            [service_id]
        );

        if (services.length === 0) {
            return sendError(res, "Service not found", 404);
        }

        const total_price = services[0].price;

        let candidates = [];
        try {
            const providerResponse = await listProvidersByCategory(
                service_id,
                req.headers.authorization
            );
            // Resp<List<ProviderResponse>>: axios .data unwraps HTTP, .data unwraps
            // the envelope. Note /api/users/{id} is NOT enveloped — the asymmetry
            // is real, see enrichBooking.
            candidates = providerResponse?.data?.data || [];
        } catch (authError) {
            console.error(
                "[createBooking] Auth Service provider lookup failed:",
                authError.message
            );
            return sendError(
                res,
                "Unable to assign a provider right now. Please try again.",
                503
            );
        }

        // The list is already approved-only. A provider must never be
        // auto-assigned to a booking they placed themselves — this replaces the
        // old explicit provider_id === customer_id guard.
        const approved = candidates.filter(
            (provider) => String(provider.userId) !== String(customer_id)
        );

        // availability is null for providers who never toggled it, so only an
        // explicit false removes someone from the pool.
        const available = approved.filter(
            (provider) => provider.availability !== false
        );

        // If availability emptied a non-empty pool, fall back to all approved.
        const pool = available.length > 0 ? available : approved;

        if (pool.length === 0) {
            return sendError(
                res,
                "No providers available for this service right now. Please try again shortly.",
                400
            );
        }

        const picked = pool[Math.floor(Math.random() * pool.length)];

        // provider_id references users.id, not providers.id.
        const insertResult = await runQuery(
            `INSERT INTO bookings
             (customer_id, provider_id, service_id, booking_date, address, total_price, status)
             VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
            [customer_id, picked.userId, service_id, toMysqlDateTime(booking_date), address, total_price]
        );

        const bookingId = insertResult.insertId;

        // Both are fire-and-forget: a notification failure must not fail the
        // booking. BOOKING_ASSIGNED is not in the notifications.type enum, so the
        // provider-facing one reuses BOOKING_CREATED with its own title.
        createNotification(
            customer_id,
            "BOOKING_CREATED",
            "Booking Created",
            "Your booking has been created successfully.",
            bookingId
        );

        createNotification(
            picked.userId,
            "BOOKING_CREATED",
            "New Job Assigned",
            "A new booking has been assigned to you. Open it to accept or reject.",
            bookingId
        );

        const rows = await runQuery("SELECT * FROM bookings WHERE id = ?", [bookingId]);

        return sendSuccess(
            res,
            await enrichBooking(rows[0], req.headers.authorization),
            null,
            201
        );

    } catch (error) {
        console.error("Unexpected error in createBooking:", error.message);
        return sendError(res, error.message, 500);
    }
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

                    return {
                        ...booking,
                        customer,
                        provider,
                        service,
                        customer_name: customer?.name || null,
                        provider_name: provider?.name || null,
                        has_review: await hasReview(booking.id)
                    };
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

            return sendSuccess(res, {
                ...booking,
                customer,
                provider,
                service,
                customer_name: customer?.name || null,
                provider_name: provider?.name || null,
                has_review: await hasReview(booking.id)
            });

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