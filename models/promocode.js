import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, default: null }, // optional percentage discount
    discountAmount: { type: Number, default: null }, // optional fixed discount amount
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: null , required:true }, // null means unlimited usage
    usedCount: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], // track users who have used the code
})

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

export default PromoCode;