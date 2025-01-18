import mongoose from "mongoose";


const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
       productId:{ type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',  // Reference to the Product model
        required: true
    },
    quantity:{
        type:Number,
        required: true
    },
    totalPrice:{
        type:Number,
        required: true
    }
    }],
}, {
    timestamps: true
});



export const Cart = mongoose.model("Cart",cartSchema)
