import mongoose from "mongoose";


const queriesSchema = new mongoose.Schema({
     email:{
        type:String,
        required:true
    },
    fullName:{
        type:String,
        required:true,
    },
    Message:{
        type:String,
        required:true
    },
    Phone:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    }
})

const Queries =  mongoose.model("Queries",queriesSchema) 