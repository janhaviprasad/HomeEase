const db = require("../db");
const { sendSuccess, sendError } = require("../utils/responseHandler");


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

    db.query(
        insertSql,
        [booking_id, customer_id, provider_id, rating, comment],

        (err, result) => {

            if (err) {
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

                    // sync with auth/provider service
                    try {

                        const authResponse = await fetch(
                            `http://172.18.3.81:8081/api/providers/${provider_id}/rating`,
                            {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    rating: parseFloat(newAverage)
                                })
                            }
                        );

                        if (!authResponse.ok) {
                            console.error(
                                "Warning: Failed to sync rating with Auth Service"
                            );
                        }

                    } catch (syncError) {

                        console.error(
                            "Auth Service unreachable. Rating not synced.",
                            syncError.message
                        );
                    }

                    return sendSuccess(
                        res,
                        {
                            review_id: result.insertId,
                            average_rating: parseFloat(newAverage)
                        },
                        "Review created and rating synced successfully",
                        201
                    );
                }
            );
        }
    );
};


module.exports = {
    createReview
};