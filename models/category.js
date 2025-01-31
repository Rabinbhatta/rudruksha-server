import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Name is required",
    minlength: [2, "Too short"],
    maxlength: [32, "Too long"],
  },
});
