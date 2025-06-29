import { Op } from "sequelize";
import UserSchema from "../models/UserSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const registerUser = async (req, res) => {
  try {
    const { password, email, mobile } = req.body;
    const salt = 12;
    if (!mobile || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const existingUser = await UserSchema.findOne({
      where: {
        [Op.or]: [{ email }, { mobile }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await UserSchema.create({
      ...req.body,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User added successfully",
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        mobile: newUser.mobile,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.log("❌ Error adding user:", error);
    res.status(500).json({ message: "error in adding", error });
  }
};

const login = async (req, res) => {
  try {
    const { password, email } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const user = await UserSchema.findOne({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.password) {
      return res.status(500).json({ message: "Please enter your password" });
    }
    if (user.isAdmin === false) {
      return res
        .status(403)
        .json({ message: "You are not authorized to login" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });
    console.log("token is here-----", token);
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.log("❌ Error Login:", error);
    res.status(500).json({ message: "error in Login", error });
  }
};

export { registerUser,login };
