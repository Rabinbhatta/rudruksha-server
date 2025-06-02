import mongoose, { SchemaType } from "mongoose";

const UserSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    min: 8,
    max: 40,
    required: true,
  },
  password: {
    type: String,
    min: 8,
    max: 40,
    required: true,
  },
  wishlist: {
    type: [SchemaType.ObjectId],
    ref: "Product", // Reference to the Product model
  },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
});

const User = mongoose.model("User", UserSchema);

export default User;
