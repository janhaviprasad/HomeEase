const db = require("../db");
const { sendSuccess, sendError } =
require("../utils/responseHandler");


// CREATE BOOKING
const createBooking = (req, res) => {

    console.log("Decoded User Object:", req.user);

    const { service_id, booking_date, address } = req.body;
    const customer_id = req.user.sub;

    // validation
    if (!service_id || !booking_date || !address) {
        return sendError(
            res,
            "Missing required fields",
            400
        );
    }

    const getPrice =
        "SELECT price FROM service_categories WHERE id=?";

    db.query(getPrice, [service_id], (err, results) => {

        if (err) {
            return sendError(
                res,
                err.message,
                500
            );
        }

        if (results.length === 0) {
            return sendError(
                res,
                "Service not found",
                404
            );
        }

        const total_price = results[0].price;

        const insertSql = `
            INSERT INTO bookings
            (customer_id, service_id, booking_date, address, total_price, status)
            VALUES (?, ?, ?, ?, ?, 'PENDING')
        `;

        db.query(
            insertSql,
            [customer_id, service_id, booking_date, address, total_price],

            (err, result) => {

                if (err) {
                    return sendError(
                        res,
                        err.message,
                        500
                    );
                }

                return sendSuccess(
                    res,
                    {
                        booking_id: result.insertId
                    },
                    201
                );
            }
        );
    });
};



// GET ALL BOOKINGS
const getAllBookings = (req, res) => {

    const customer_id = req.user.sub;

    const sql = `
        SELECT *
        FROM bookings
        WHERE customer_id = ?
        ORDER BY booking_date DESC
    `;

    db.query(sql, [customer_id], (err, results) => {

        if (err) {
            return sendError(
                res,
                err.message,
                500
            );
        }

        return sendSuccess(
            res,
            {
                count: results.length,
                bookings: results
            }
        );
    });
};



// UPDATE BOOKING STATUS
const updateBookingStatus = (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    let timestampColumn = null;
    let providerUpdate = "";
    const params = [status];

    if (status === "ACCEPTED") {
        timestampColumn = "accepted_at";
        providerUpdate = ", provider_id=? ";
        params.push(req.user.id);

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
            return sendError(
                res,
                err.message,
                500
            );
        }

        if (result.affectedRows === 0) {
            return sendError(
                res,
                "Booking not found",
                404
            );
        }

        return sendSuccess(
            res,
            {
                bookingStatus: status
            }
        );
    });
};

// DELETE BOOKING
const deleteBooking = (req, res) => {

    const bookingId = req.params.id;
    const customer_id = req.user.sub;

    const sql = `
        DELETE FROM bookings
        WHERE id = ? AND customer_id = ?
    `;

    db.query(
        sql,
        [bookingId, customer_id],
        (err, result) => {

            if (err) {
                return sendError(
                    res,
                    err.message,
                    500
                );
            }

            // either booking doesn't exist
            // OR user is trying to delete another user's booking
            if (result.affectedRows === 0) {
                return sendError(
                    res,
                    "Booking not found or unauthorized",
                    404
                );
            }

            return sendSuccess(
                res,
                {
                    deletedBookingId: bookingId
                },
                "Booking deleted successfully"
            );
        }
    );
};

module.exports = {
    createBooking,
    updateBookingStatus,
    getAllBookings,
    deleteBooking
};