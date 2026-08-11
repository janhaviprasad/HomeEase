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



const getServiceById = (serviceId) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                id,
                category_name,
                description,
                price,
                image_url
            FROM service_categories
            WHERE id = ?
        `;

        db.query(sql, [serviceId], (err, result) => {

            if (err) {
                return reject(err);
            }

            if (result.length === 0) {
                return resolve(null);
            }

            resolve(result[0]);

        });

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


// search service 
const searchService = (req, res) => {

    const keyword = req.query.keyword;

    const sql = `
        SELECT *
        FROM service_categories
        WHERE category_name LIKE ?
    `;

    db.query(sql, [`%${keyword}%`], (err, result) => {

        if (err) {
            return sendError(res, err.message, 500);
        }

        return sendSuccess(res, result);

    });

};

const deleteService = (req, res) => {

    const serviceId = req.params.id;

    const checkSql = `
        SELECT *
        FROM service_categories
        WHERE id = ?
    `;

    db.query(checkSql, [serviceId], (err, result) => {

        if (err) {
            return sendError(res, err.message, 500);
        }

        if (result.length === 0) {
            return sendError(
                res,
                "Service not found",
                404
            );
        }

        const sql = `
            UPDATE service_categories
            SET is_active = FALSE
            WHERE id = ?
        `;

        db.query(sql, [serviceId], (err) => {

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
                    serviceId
                },
                200
            );

        });

    });

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

    const updateSql = `
        UPDATE service_categories
        SET category_name = ?, description = ?, price = ?, image_url = ?
        WHERE id = ?
    `;

    db.query(
        updateSql,
        [category_name, description || null, price, image_url || null, id],

        (err, result) => {

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
                    "Service category not found",
                    404
                );
            }

            // Fetch updated service
            const selectSql = `
                SELECT *
                FROM service_categories
                WHERE id = ?
            `;

            db.query(selectSql, [id], (err, serviceResult) => {

                if (err) {
                    return sendError(
                        res,
                        err.message,
                        500
                    );
                }

                return sendSuccess(
                    res,
                    serviceResult[0],
                    "Service category updated successfully"
                );

            });

        }
    );
};

module.exports = {
    getAllServices,
    addService,
    updateService,
    searchService,
    deleteService,
    getServiceById
};