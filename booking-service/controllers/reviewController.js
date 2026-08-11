const db = require("../db");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const { updateProviderRating } = require("../services/authService");

// Fire-and-forget. Never throws, never rejects: the caller has already answered
// the client by the time this runs.
const syncProviderRating = async (providerId, newAverage) => {
    try {
        await updateProviderRating(providerId, parseFloat(newAverage));
    } catch (syncError) {
        console.warn(
            `[reviews] rating sync skipped for provider ${providerId}:`,
            syncError.message
        );
    }
};


const DUPLICATE_REVIEW_MESSAGE = "You've already reviewed this booking.";

const createReview = (req, res) => {

    const { booking_id, provider_id, rating, comment } = req.body;

    // check this carefully with your JWT payload
    // if token stores sub then use req.user.sub
    const customer_id = req.user.sub;

    // validation
    if (!booking_id || !provider_id || !rating) {
        return sendError(
            res,
            "Missing required fields",
            400
        );
    }

    const insertSql = `
        INSERT INTO reviews
        (booking_id, customer_id, provider_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
    `;

    const existingSql = `
        SELECT id
        FROM reviews
        WHERE booking_id = ?
        LIMIT 1
    `;

    db.query(existingSql, [booking_id], (existingErr, existing) => {

        if (existingErr) {
            return sendError(res, existingErr.message, 500);
        }

        if (existing.length > 0) {
            return sendError(res, DUPLICATE_REVIEW_MESSAGE, 409);
        }

        db.query(
        insertSql,
        [booking_id, customer_id, provider_id, rating, comment],

        (err, result) => {

            if (err) {
                // The check above can lose a race; the UNIQUE constraint on
                // reviews.booking_id is the real guard, so translate it rather
                // than leaking "Duplicate entry ... for key" to the client.
                if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) {
                    return sendError(res, DUPLICATE_REVIEW_MESSAGE, 409);
                }

                return sendError(
                    res,
                    err.message,
                    500
                );
            }

            const avgSql = `
                SELECT AVG(rating) as averageRating
                FROM reviews
                WHERE provider_id = ?
            `;

            db.query(
                avgSql,
                [provider_id],

                async (err, avgResult) => {

                    if (err) {
                        return sendError(
                            res,
                            err.message,
                            500
                        );
                    }

                    const newAverage =
                    parseFloat(avgResult[0].averageRating).toFixed(1);

                    // The review is already committed and this service is the
                    // source of truth for it. Answer the client first, then push
                    // the new average to the Auth Service without blocking on it:
                    // a stale rating over there is a far smaller problem than a
                    // review submission that appears to fail.
                    sendSuccess(
                        res,
                        {
                            review_id: result.insertId,
                            average_rating: parseFloat(newAverage)
                        },
                        "Review created successfully",
                        201
                    );

                    return syncProviderRating(provider_id, newAverage);
                }
            );
        }
        );
    });
};


module.exports = {
    createReview
};