import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    imgUrl : { type: String, required: true }
});

const Variant = mongoose.model('Variant', variantSchema);

export default Variant;
