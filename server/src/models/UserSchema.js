import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      // unique: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
    },
    address: {
      type: String,
    },
    password: {
      type: String,
      maxlength: 100,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    studioName: {
      type: String,
      required: true,
    },
    studioLocation: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

export default User;
