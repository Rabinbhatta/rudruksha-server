import mongoose from "mongoose";

const ContactSchema = mongoose.Schema({
    location: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
}, { timestamps: true });
const Contact = mongoose.model("Contact", ContactSchema);

export default Contact;