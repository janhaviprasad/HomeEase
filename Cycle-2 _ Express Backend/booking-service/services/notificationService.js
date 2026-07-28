const db = require("../db");

const createNotification = (
    userId,
    type,
    title,
    message,
    bookingId
) => {

    const sql = `
        INSERT INTO notifications
        (
            user_id,
            type,
            title,
            message,
            booking_id
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        userId,
        type,
        title,
        message,
        bookingId
    ], (err) => {

        if (err) {
            console.error("Notification Error:", err);
        }

    });

};

module.exports = {
    createNotification
};