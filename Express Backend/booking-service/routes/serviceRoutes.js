const express = require("express");
const {getAllServices,addService, updateService}= require("../controllers/serviceController")

const router= express.Router();
router.get("/",getAllServices);

router.post("/",addService);
router.put("/:id",updateService);

module.exports=router;