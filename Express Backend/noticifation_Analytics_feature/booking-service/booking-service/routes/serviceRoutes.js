const express = require("express");
const router = express.Router();

const {
    addService,
    getAllServices,
    updateService,
    searchService,
    deleteService
} = require("../controllers/serviceController");

const verifyToken = require("../middleware/authMiddleware");

router.post("/", verifyToken, addService);

router.get("/", getAllServices);

router.get("/search", searchService);

router.put("/:id", verifyToken, updateService);

router.delete("/:id", verifyToken, deleteService);

module.exports = router;