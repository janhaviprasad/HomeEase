const express = require("express");
const cors =require("cors");
require("dotenv").config();
const db=require("./db");

const app = express();
const serviceRoutes=require("./routes/serviceRoutes");
const bookingRoutes=require("./routes/bookingRoutes");
const reviewRoutes= require("./routes/reviewRoutes")
const providerBookingRoutes = require("./routes/providerBookingRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const notificationRoutes = require("./routes/notificationRoutes");
app.use(cors());
app.use(express.json());
app.use("/api/notifications", notificationRoutes);
app.use("/api/provider", providerBookingRoutes);
app.use("/api/analytics", analyticsRoutes);





app.get("/",(req, res)=>{
    res.send("HomeEasse Booking service is running")
});

const PORT = process.env.PORT||8082;

app.get("/api/test-db",(req,res)=>{
    db.query("SELECT 1 + 1 as result",(err,data)=>{
        if(err){
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        res.json({
            success: true,
            message: "database connected succesfully",
            result: data[0].result
        });
       
    })
})
app.use("/api/services",serviceRoutes);
app.use("/api/bookings",bookingRoutes);
app.use("/api/reviews",reviewRoutes);

app.listen(PORT,()=>{
console.log(`Booking Service running on port ${PORT}`);
});