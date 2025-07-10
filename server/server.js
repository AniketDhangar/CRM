import express from "express";
import dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";

import cors from "cors";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// import sequelize from "./src/config/db.js";
import userRouter from "./src/routes/userRoutes.js";
import connectDB from "./src/config/Database.js";
import customerRouter from "./src/routes/customerRoutes.js";
import serviceRouter from "./src/routes/serviceRoutes.js";
import orderRouter from "./src/routes/orderRoutes.js";
import router from "./src/routes/revenueRoutes.js";
import pdfRouter from "./src/routes/pdfRoutes.js";
import './src/utils/notificationScheduler.js';


const app = express();
const PORT = process.env.PORT || 3000;
connectDB()

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(helmet());

// Rate limiting: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

app.get("/api", (req, res) => {
  res.send("Hello User! Welcome to Server ...");
});

app.use('/api/user',userRouter)
app.use('/api/customer', customerRouter)
app.use('/api/service', serviceRouter)
app.use('/api/order',orderRouter)
app.use('/api/revenue',router)
app.use('/api/pdf',pdfRouter)



// sequelize
//   .authenticate()
//   .then(() => {
//     console.log("✅ Database connected...");

   
//     return sequelize.sync({ alter: true });
//   })
//   .then(() => {
//     console.log("✅ Models synced.");
//   })
//   .catch((err) => {
//     console.error("❌ Error connecting to DB:", err);
//   });

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});
