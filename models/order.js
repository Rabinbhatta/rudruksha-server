import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId : { type: String, required: true, unique: true },
    // userId is optional to support guest checkout
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    fullname : { type: String, required: true },
    email: { type: String, required: false, default: null }, // Optional for Nepal orders
    phone: { type: String, required: true },
    products : [
        {
            productId : { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity : { type: Number, required: true, default: 1 },
            variant: {type: mongoose.Schema.Types.ObjectId, ref: 'Variant' },
            size: {type: mongoose.Schema.Types.ObjectId },
        }
    ],
    totalAmout: { type: Number, required: true },
    subtotal: { type: Number, default: null },
    discountAmount: { type: Number, default: null },
    subtotalAfterDiscount: { type: Number, default: null },
    orderStatus: { type: String, required: true, default: "Pending" },
    deliveryAddress: {
        // Common fields
        fullname: { type: String, required: true },
        email: { type: String, default: null },
        phone: { type: String, required: true },
        country: { type: String, required: true },
        additionalNotes: { type: String, default: null },
        
        // Nepal specific fields
        province: { type: String, default: null },
        district: { type: String, default: null },
        municipality: { type: String, default: null },
        wardNumber: { type: String, default: null },
        streetToleLandmark: { type: String, default: null },
        
        // India specific fields
        state: { type: String, default: null },
        addressLine1: { type: String, default: null },
        addressLine2: { type: String, default: null },
        landmark: { type: String, default: null },
        
        // Other countries specific fields
        addressLine1Other: { type: String, default: null },
        addressLine2Other: { type: String, default: null },
        stateProvinceRegion: { type: String, default: null },
        postalZipCode: { type: String, default: null },
        
        // Legacy fields (for backward compatibility)
        street: { type: String, default: null },
        city: { type: String, default: null },
        postalCode: { type: String, default: null },
    },
    promocode : { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode', default: null },
    paymentMethod: { type: String, required: true  },
    paymentStatus: { type: String, required: true, default: "Pending" },
    transactionId: { type: String, default: null },
    paymentVerificationImage: { type: String, default: null },
    shippingLocation: { type: String, enum: ['insideKathmandu', 'outsideKathmandu', 'india', 'otherInternational'], default: null },
    shippingFee: { type: Number, default: 0, min: 0 },
    orderLocationType: { type: String, enum: ['nepal', 'india', 'other'], default: 'other' },
    createdAt: { type: Date, default: Date.now },
})

const Order = mongoose.model("Order", orderSchema);

export default Order;