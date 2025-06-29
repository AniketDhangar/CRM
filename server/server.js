import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./src/config/db.js";
import userRouter from "./src/routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get("/api", (req, res) => {
  res.send("Hello User! Welcome to Server ...");
});

app.use('/api/user',userRouter)



sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected...");

   
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("✅ Models synced.");
  })
  .catch((err) => {
    console.error("❌ Error connecting to DB:", err);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});
