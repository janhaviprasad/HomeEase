const db = require("../db");


const { sendSuccess, sendError } = require("../utils/responseHandler");

const {
    createNotification
} = require("../services/notificationService");


const {
    getUserById,
    getProviderByUserId
} = require("../services/authService");



// Dashboard
const getDashboard = (req, res) => {

    const providerId = req.user.sub;

    const sql = `
        SELECT
            COUNT(CASE WHEN status = 'PENDING' THEN 1 END) AS pending,
            COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) AS accepted,
            COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) AS inProgress,
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completed
        FROM bookings
        WHERE provider_id = ?
    `;

    db.query(sql, [providerId], (err, result) => {

        if (err) {
            return sendError(res, err.message, 500);
        }

        return sendSuccess(res, result[0]);

    });

};

// Pending Bookings
const getPendingBookings = (req, res) => {

    const sql = `
        SELECT
            b.id,
            b.customer_id,
            b.service_id,
            b.booking_date,
            b.address,
            b.total_price,
            b.status,
            sc.category_name
        FROM bookings b
        INNER JOIN service_categories sc
            ON b.service_id = sc.id
        WHERE b.status = 'PENDING'
            AND b.provider_id = ?
        ORDER BY b.booking_date ASC
    `;

    db.query(sql, [req.user.sub], (err, result) => {

        if (err) {
            return sendError(res, err.message, 500);
        }

        return sendSuccess(res, result);

    });

};

const getAvailableBookings = async (req, res) => {

    try {

     

        console.log("JWT User:", req.user);
        console.log("Provider ID:", req.user.sub);
console.log("Authorization:", req.headers.authorization);


          const response = await getProviderByUserId(
    req.user.sub,
    req.headers.authorization
);


        if (!response.data.data.isApproved) {
            return sendError(
                res,
                "Provider account is not approved",
                403
            );
        }

    } catch (error) {

    console.log("========= ERROR =========");
    console.log(error.message);

    if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
    }

    return sendError(
        res,
        "Unable to verify provider",
        500
    );
}
    const sql = `
        SELECT
            b.id,
            b.customer_id,
            b.provider_id,
            b.service_id,
            sc.category_name AS service_name,
            sc.category_name,
            b.booking_date,
            b.status,
            b.address,
            b.total_price,
            b.created_at,
            b.updated_at
        FROM bookings b
        INNER JOIN service_categories sc
            ON b.service_id=sc.id
        WHERE
            b.status='PENDING'
            AND b.provider_id = ?
        ORDER BY b.booking_date ASC
    `;

    db.query(sql, [req.user.sub], (err, result) => {

        if (err) {
            return sendError(res, err.message, 500);
        }

        return sendSuccess(res, {
            count: result.length,
            bookings: result
        });

    });

};

// Accept Booking
const acceptBooking = (req, res) => {

    const bookingId = req.params.id;
    const providerId = req.user.sub;

    // Check booking exists
    const checkSql = `
        SELECT *
        FROM bookings
        WHERE id = ?
    `;

    db.query(checkSql, [bookingId], (err, result) => {

        if (err) {
            return sendError(res, err.message, 500);
        }

        if (result.length === 0) {
            return sendError(res, "Booking not found", 404);
        }

        const booking = result[0];

        // Auto-assign means every booking already has an owner, so a provider
        // may only accept one that was assigned to them.
        if (String(booking.provider_id) !== String(providerId)) {
            return sendError(res, "You don't own this booking.", 403);
        }

        if (booking.status !== "PENDING") {
            return sendError(
                res,
                "Only pending bookings can be accepted",
                400
            );
        }

        const updateSql = `
            UPDATE bookings
            SET
                provider_id = ?,
                status = 'ACCEPTED',
                accepted_at = NOW()
            WHERE id = ?
        `;

        db.query(updateSql, [providerId, bookingId], (err) => {

            if (err) {
                return sendError(res, err.message, 500);
            }


           createNotification(
    booking.customer_id,
    "BOOKING_ACCEPTED",
    "Booking Accepted",
    "Your booking has been accepted by the provider.",
    bookingId
);
            return sendSuccess(res, {
                message: "Booking accepted successfully"
            });

        });

    });


    

};

// Reject Booking
// Reject Booking
const rejectBooking = (req, res) => {

    const bookingId = req.params.id;

    const checkSql = `
        SELECT *
        FROM bookings
        WHERE id = ?
    `;

    db.query(checkSql, [bookingId], (err, result) => {

        if (err) {
            return sendError(res, err.message, 500);
        }

        if (result.length === 0) {
            return sendError(res, "Booking not found", 404);
        }

        const booking = result[0];

        if (String(booking.provider_id) !== String(req.user.sub)) {
            return sendError(res, "You don't own this booking.", 403);
        }

        if (booking.status !== "PENDING") {
            return sendError(
                res,
                "Only pending bookings can be rejected",
                400
            );
        }

        const updateSql = `
            UPDATE bookings
            SET status = 'CANCELLED'
            WHERE id = ?
        `;

        db.query(updateSql, [bookingId], (err) => {

            if (err) {
                return sendError(res, err.message, 500);
            }

            createNotification(
                booking.customer_id,
                "BOOKING_CANCELLED",
                "Booking Cancelled",
                "Your booking has been cancelled by the provider.",
                bookingId
            );

            return sendSuccess(res, {
                message: "Booking rejected successfully"
            });

        });

    });

};


// Accepted Bookings
const getAcceptedBookings = (req, res) => {

    const providerId = req.user.sub;

    const sql = `
        SELECT
            b.id,
            b.customer_id,
            b.service_id,
            b.booking_date,
            b.address,
            b.total_price,
            b.status,
            sc.category_name
        FROM bookings b
        INNER JOIN service_categories sc
            ON b.service_id = sc.id
        WHERE
            b.provider_id = ?
            AND b.status = 'ACCEPTED'
        ORDER BY b.booking_date ASC
    `;

    db.query(sql, [providerId], (err, result) => {

        if (err) {
            return sendError(res, err.message, 500);
        }

        return sendSuccess(res, result);

    });

};

// Start Service
const startService = (req, res) => {

    const bookingId = req.params.id;
    const providerId = req.user.sub;

    const checkSql = `
        SELECT *
        FROM bookings
        WHERE id = ?
    `;

    db.query(checkSql, [bookingId], (err, result) => {

        if (err) {
            return sendError(res, err.message, 500);
        }

        if (result.length === 0) {
            return sendError(res, "Booking not found", 404);
        }

        const booking = result[0];

        if (String(booking.provider_id) !== String(providerId)) {
            return sendError(res, "You don't own this booking.", 403);
        }

        if (booking.status !== "ACCEPTED") {
            return sendError(
                res,
                "Only accepted bookings can be started",
                400
            );
        }

        const updateSql = `
            UPDATE bookings
            SET status = 'IN_PROGRESS'
            WHERE id = ?
        `;

        db.query(updateSql, [bookingId], (err) => {

            if (err) {
                return sendError(res, err.message, 500);
            }

            createNotification(
                booking.customer_id,
                "BOOKING_IN_PROGRESS",
                "Service Started",
                "Your service has been started by the provider.",
                bookingId
            );

            return sendSuccess(res, {
                message: "Service started successfully"
            });

        });

    });

};

// Complete Service
const completeService = (req, res) => {

    const bookingId = req.params.id;
    const providerId = req.user.sub;

    const checkSql = `
        SELECT *
        FROM bookings
        WHERE id = ?
    `;

    db.query(checkSql, [bookingId], (err, result) => {

        if (err) {
            return sendError(res, err.message, 500);
        }

        if (result.length === 0) {
            return sendError(res, "Booking not found", 404);
        }

        const booking = result[0];

        if (String(booking.provider_id) !== String(providerId)) {
            return sendError(res, "You don't own this booking.", 403);
        }

        if (booking.status !== "IN_PROGRESS") {
            return sendError(
                res,
                "Only in-progress bookings can be completed",
                400
            );
        }

        const updateSql = `
            UPDATE bookings
            SET
                status = 'COMPLETED',
                completed_at = NOW()
            WHERE id = ?
        `;

        db.query(updateSql, [bookingId], (err) => {

            if (err) {
                return sendError(res, err.message, 500);
            }

            createNotification(
                booking.customer_id,
                "BOOKING_COMPLETED",
                "Service Completed",
                "Your service has been completed successfully.",
                bookingId
            );

            return sendSuccess(res, {
                message: "Service completed successfully"
            });

        });

    });

};


// Get All Provider Bookings
const getProviderBookings = (req, res) => {

    const providerId = req.user.sub;

    const sql = `
        SELECT
            b.*,
            sc.category_name,
            sc.description,
            sc.price,
            sc.image_url
        FROM bookings b
        INNER JOIN service_categories sc
            ON b.service_id = sc.id
        WHERE b.provider_id = ?
        ORDER BY b.booking_date DESC
    `;

   
db.query(sql, [providerId], async (err, result) => {

    if (err) {
        return sendError(
            res,
            err.message,
            500
        );
    }

    try {

        const bookings = await Promise.all(

            result.map(async (booking) => {

                const customerResponse = await getUserById(
                    booking.customer_id,
                    req.headers.authorization
                );

                return {
                    ...booking,
                    customer: customerResponse.data
                };

            })

        );

        return sendSuccess(
            res,
            {
                count: bookings.length,
                bookings
            }
        );

    } catch (error) {

        return sendError(
            res,
            "Unable to fetch customer details",
            500
        );

    }

});




};

// Completed Bookings
// Completed Bookings
const getCompletedBookings = (req, res) => {

    const providerId = req.user.sub;

    const sql = `
        SELECT
            b.id,
            b.customer_id,
            b.service_id,
            b.booking_date,
            b.address,
            b.total_price,
            b.status,
            b.completed_at,
            sc.category_name
        FROM bookings b
        INNER JOIN service_categories sc
            ON b.service_id = sc.id
        WHERE
            b.provider_id = ?
            AND b.status = 'COMPLETED'
        ORDER BY b.completed_at DESC
    `;

    db.query(sql, [providerId], (err, result) => {

        if (err) {
            return sendError(res, err.message, 500);
        }

        return sendSuccess(res, result);

    });

};

// Today's Bookings
// Today's Bookings
const getTodayBookings = (req, res) => {

    const providerId = req.user.sub;

    const sql = `
        SELECT
            b.id,
            b.customer_id,
            b.service_id,
            b.booking_date,
            b.address,
            b.total_price,
            b.status,
            sc.category_name
        FROM bookings b
        INNER JOIN service_categories sc
            ON b.service_id = sc.id
        WHERE
            b.provider_id = ?
            AND DATE(b.booking_date) = CURDATE()
        ORDER BY b.booking_date ASC
    `;

    db.query(sql, [providerId], (err, result) => {

        if (err) {
            return sendError(res, err.message, 500);
        }

        return sendSuccess(res, result);

    });

};
module.exports = {
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
};