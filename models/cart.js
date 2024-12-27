import mongoose from "mongoose";


const cartSchema = mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    products:{
        type: Array,
        required: true
    },
})


export const Cart = mongoose.model("Cart",cartSchema)
