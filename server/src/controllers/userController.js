import UserSchema from "../models/UserSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sendEmail from "../utils/emailSender.js";

dotenv.config();

const registerUser = async (req, res) => {
  try {
    const saltRounds = 12;
    const { password, email, mobile, name } = req.body;

    if (!mobile || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const existingUser = await UserSchema.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new UserSchema({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    await newUser.save();

    // ✅ Send Registration Email
    // await sendEmail(
    //   fromEmail,
    //   emailPassword,
    //   email,
    //   "Welcome to the App",
    //   `Hi ${name}, your registration was successful.`
    // );
    await sendEmail(
      email,
      "🎉 Welcome to CRM Portal",
      `Hi ${name}, your registration was successful.`
    );

    res.status(201).json({
      message: "User added successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.log("❌ Error adding user:", error);
    res.status(500).json({ message: "Error in adding user", error });
  }
};

const login = async (req, res) => {
  try {
    const { password, email } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const user = await UserSchema.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const payload = {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    // ✅ Send Login Email
    // await sendEmail(
    //   fromEmail,
    //   emailPassword,
    //   email,
    //   "Login Alert",
    //   `Hi ${user.name}, you just logged in successfully.`
    // );

    await sendEmail(
      email,
      "🔐 Login Notification",
      `Hi ${user.name}, you just logged in successfully.`
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.log("❌ Error in Login:", error);
    res.status(500).json({ message: "Error in login", error });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ use 'id' instead of '_id'

    const user = await UserSchema.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile retrieved successfully",
      user,
    });
  } catch (error) {
    console.log("❌ Error retrieving user profile:", error);
    res.status(500).json({ message: "Error retrieving user profile", error });
  }
};

const allUsers = async (req, res) => {
  try {
    const users = await UserSchema.find();
    res.status(200).json({
      message: "all users are fetched",
      users: users,
    });
  } catch (error) {
    console.log("❌ Error fetching all user:", error);
    res.status(500).json({ message: "Error in fetching all user", error });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { email, _id } = req.body;

    if (!_id && !email) {
      return res.status(400).json({ message: "Email or ID required" });
    }

    // Find user by email or ID
    const findUser = await UserSchema.findOne({ $or: [{ email }, { _id }] });
    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user by _id
    const deletedUser = await UserSchema.findByIdAndDelete(findUser._id);

    // Send deletion email to user
    await sendEmail(
      findUser.email,
      "🔐 Account Deletion",
      `Hi ${findUser.name}, your account has been deleted successfully.`
    );

    res.status(200).json({ message: "User is deleted!", deletedUser });
  } catch (error) {
    console.log("❌ Error deleting user:", error);
    res.status(500).json({ message: "Error in deleting user", error });
  }
};

export { registerUser, login, getUserProfile, deleteUser,allUsers };
