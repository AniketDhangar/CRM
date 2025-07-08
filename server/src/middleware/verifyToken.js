import jwt from "jsonwebtoken";
import User from "../models/UserSchema.js";


const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found or removed." });
    }

    req.user = user; // includes _id, role, email, etc.
    next();
  } catch (error) {
    console.log("❌ JWT Verification Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default verifyToken;
