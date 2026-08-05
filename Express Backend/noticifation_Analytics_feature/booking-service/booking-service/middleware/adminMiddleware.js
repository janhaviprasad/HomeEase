const isAdmin = (req, res, next) => {

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            status: "ERROR",
            error: "Access denied. Admin only."
        });
    }

    next();
};

module.exports = isAdmin;