import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['order', 'consultation', 'contact'],
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    refPath: 'relatedModel',
  },
  relatedModel: {
    type: String,
    required: false,
    enum: ['Order', 'Consultaion', 'ContactSubmission'],
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    required: false,
  },
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
