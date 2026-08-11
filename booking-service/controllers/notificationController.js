const db = require("../db");
const { sendSuccess, sendError } = require("../utils/responseHandler");

// Get all notifications of logged in user
const getNotifications = (req, res) => {

    const userId = req.user.sub; // Logged in user id

    const sql = `
        SELECT *
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, result) => {

        if (err) {
            return sendError(res, err.message);
        }

        return sendSuccess(res, result);

    });

};


// Mark one notification as read
const markAsRead = (req, res) => {

    const userId = req.user.sub;
    const notificationId = req.params.id;

    const sql = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [notificationId, userId], (err, result) => {

        if (err) {
            return sendError(res, err.message);
        }

        if (result.affectedRows === 0) {
            return sendError(res, "Notification not found");
        }

        return sendSuccess(res, "Notification marked as read");

    });

};


// Mark all notifications as read
const markAllAsRead = (req, res) => {

    const userId = req.user.sub;

    const sql = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = ?
    `;

    db.query(sql, [userId], (err, result) => {

        if (err) {
            return sendError(res, err.message);
        }

        return sendSuccess(res, "All notifications marked as read");

    });

};


// Delete notification
const deleteNotification = (req, res) => {

    const userId = req.user.sub;
    const notificationId = req.params.id;

    const sql = `
        DELETE FROM notifications
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [notificationId, userId], (err, result) => {

        if (err) {
            return sendError(res, err.message);
        }

        if (result.affectedRows === 0) {
            return sendError(res, "Notification not found");
        }

        return sendSuccess(res, "Notification deleted");

    });

};


module.exports = {

    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification

};