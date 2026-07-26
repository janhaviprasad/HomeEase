const db = require("../db");
const { sendSuccess, sendError } = require("../utils/responseHandler");


// GET ALL SERVICES
const getAllServices = (req, res) => {

    const sql = "SELECT * FROM service_categories";

    db.query(sql, (err, result) => {

        if (err) {
            return sendError(
                res,
                err.message,
                500
            );
        }

        return sendSuccess(
            res,
            result,
            "Services fetched successfully"
        );

    });
};


// ADD SERVICE
const addService = (req, res) => {

    const { category_name, description, price, image_url } = req.body;

    if (!category_name || !price) {
        return sendError(
            res,
            "category name and price is required",
            400
        );
    }

    const sql = `
        INSERT INTO service_categories
        (category_name, description, price, image_url)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [category_name, description || null, price, image_url || null],

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
                    service_id: result.insertId
                },
                "Service added successfully",
                201
            );

        }
    );
};


// UPDATE SERVICE
const updateService = (req, res) => {

    const { id } = req.params;
    const { category_name, description, price, image_url } = req.body;

    if (!category_name || !price) {
        return sendError(
            res,
            "category name and price is required",
            400
        );
    }

    const sql = `
        UPDATE service_categories
        SET category_name = ?, description = ?, price = ?, image_url = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [category_name, description || null, price, image_url || null, id],

        (err, result) => {

            if (err) {
                return sendError(
                    res,
                    err.message,
                    500
                );
            }

            if (result.affectedRows == 0) {
                return sendError(
                    res,
                    "Service category not found",
                    404
                );
            }

            return sendSuccess(
                res,
                result,
                "Service category updated successfully"
            );

        }
    );
};


module.exports = {
    getAllServices,
    addService,
    updateService
};