import UserSchema from "../models/UserSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sendEmail from "../utils/emailSender.js";
import auditLogger from '../utils/auditLogger.js';

dotenv.config();


const registerUser = async (req, res) => {
  try {
    const saltRounds = 12;
    const {
      password,
      email,
      mobile,
      name,
      address,
      isAdmin,
      studioName,
      studioLocation,
    } = req.body;

    if (!mobile || !email || !password || !name || !studioName || !studioLocation) {
      return res.status(400).json({ message: "Please fill all required fields" });
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
      address,
      password: hashedPassword,
      isAdmin,
      studioName,
      studioLocation,
    });

    await newUser.save();

    await auditLogger({
      userId: newUser._id,
      action: 'User Registered',
      entityType: 'User',
      entityId: newUser._id,
      details: `User registered: ${name} (${email})`,
    });

    // ✅ Send Welcome Email (fail-safe)
    try {
      await sendEmail(
        email,
        "🎉 Welcome to CRM Portal",
        `Hi ${name}, your registration was successful.`
      );
    } catch (err) {
      console.log("❗ Email not sent:", err.message);
    }

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

    await auditLogger({
      userId: user._id,
      action: 'User Login',
      entityType: 'User',
      entityId: user._id,
      details: `User logged in: ${user.email}`,
    });
    
    try {
      await sendEmail(
        email,
        "🔐 Login Notification",
        `Hi ${user.name}, you just logged in successfully.`
      );
    } catch (err) {
      console.log("❗ Email not sent:", err.message);
    }

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
    const userId = req.user.id;

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
    const users = await UserSchema.find().select("-password");
    res.status(200).json({
      message: "All users are fetched",
      users,
    });
  } catch (error) {
    console.log("❌ Error fetching all users:", error);
    res.status(500).json({ message: "Error fetching all users", error });
  }
};


const deleteUser = async (req, res) => {
  try {
    const { email, _id } = req.body;

    if (!_id && !email) {
      return res.status(400).json({ message: "Email or ID required" });
    }

    const findUser = await UserSchema.findOne({ $or: [{ email }, { _id }] });
    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const deletedUser = await UserSchema.findByIdAndDelete(findUser._id);

    await auditLogger({
      userId: findUser._id,
      action: 'User Deleted',
      entityType: 'User',
      entityId: findUser._id,
      details: `User deleted: ${findUser.email}`,
    });
    
    try {
      await sendEmail(
        findUser.email,
        "🔐 Account Deletion",
        `Hi ${findUser.name}, your account has been deleted successfully.`
      );
    } catch (err) {
      console.log("❗ Email not sent:", err.message);
    }

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    console.log("❌ Error deleting user:", error);
    res.status(500).json({ message: "Error in deleting user", error });
  }
};


const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      mobile,
      address,
      studioName,
      studioLocation,
      password
    } = req.body;

    const user = await UserSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (address) user.address = address;
    if (studioName) user.studioName = studioName;
    if (studioLocation) user.studioLocation = studioLocation;

    if (password) {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
        studioName: user.studioName,
        studioLocation: user.studioLocation,
      },
    });
  } catch (error) {
    console.log("❌ Error updating user:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating user profile",
      error: error.message,
    });
  }
};
export { registerUser, login, getUserProfile, deleteUser, allUsers,updateUser };
