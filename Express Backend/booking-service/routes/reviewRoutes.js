const express = require("express")
const router=express.Router();
const verifyTOken=require("../middleware/authMiddleware")
const {createReview}=require("../controllers/reviewController")

router.post("/",verifyTOken,createReview);

module.exports=router;