import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    bannerPopUpImage: { type: String, required: true },
    bannerImage: [{ type: String, required: true }], 
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);

export default Event;