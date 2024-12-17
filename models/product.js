import mongoose from "mongoose";


const ProductSchema = mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    price:{
        type:Number,
        required: true
    },
    category:{
        type:String,
        required: true
    },
    img:{
        type:String,
        required: true
    }
})


const Product = mongoose.model("Product",ProductSchema)

export default Product

