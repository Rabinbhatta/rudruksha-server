import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId : { type: String, required: true, unique: true },
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullname : { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    products : [
        {
            productId : { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity : { type: Number, required: true, default: 1 },
            variant: {type: mongoose.Schema.Types.ObjectId, ref: 'Variant' },
            size: {type: mongoose.Schema.Types.ObjectId, ref: 'Size' }
        }
    ],
    totalAmout: { type: Number, required: true },
    orderStatus: { type: String, required: true, default: "Pending" },
    deliveryAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        country : { type: String, required: true },
        postalCode: { type: String, required: true },
    },
    promocode : { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode', default: null },
    paymentMethod: { type: String, required: true  },
    paymentStatus: { type: String, required: true, default: "Pending" },
    createdAt: { type: Date, default: Date.now },
})

const Order = mongoose.model("Order", orderSchema);

export default Order;