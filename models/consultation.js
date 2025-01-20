import mongoose from "mongoose";


const consultationSchema = new mongoose.Schema({
     email:{
        type:String,
        required:true
    },
    fullName:{
        type:String,
        required:true,
    },
    message:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    }
})

const Consultation =  mongoose.model("Consultaion",consultationSchema) 

export default Consultation;