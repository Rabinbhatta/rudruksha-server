import Review from "../models/review.js";

export const createReview = async(req,res)=>{
    try {
        const {userID,comment,rating} = req.body
        const review = new Review({
            userID,
            comment,
            rating
        })
        const savedReview = await review.save()
        res.status(202).json({savedReview})
    } catch (error) {
        res.status(404).json({message: error.message})
        
    }
}

export const getReview = async (req, res) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        const skip = (page - 1) * limit;
        
        // Fetch paginated reviews
        const reviews = await Review.find().skip(skip).limit(limit);

        // Get total count of reviews
        const totalCount = await Review.countDocuments();

        res.status(200).json({
            reviews,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page),
            totalReviews: totalCount
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedReview = await Review.findByIdAndDelete(id);
        res.status(202).json({ deletedReview });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}