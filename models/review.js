import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true },
    commentTitle:{ type: String, required: true },
    comment: { type: String, required: true },
}, {
    timestamps: true,
});

const Review = mongoose.model('Review', reviewSchema);  
export default Review;