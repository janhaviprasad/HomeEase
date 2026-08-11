const sendSuccess = (
    res,
    data = null,
    message = null,
    statusCode = 200
) => {
    return res.status(statusCode).json({
        status: "SUCCESS",
        data: data,
    });
};

const sendError = (
    res,
    message,
    statusCode = 500
) => {
    return res.status(statusCode).json({
        status: "ERROR",
        error: message
    });
};

module.exports = {
    sendSuccess,
    sendError
};