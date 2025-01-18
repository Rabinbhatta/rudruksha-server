import { Cart } from "../models/cart.js";


export const addCart = async (req,res) => {
    try {
        const {userId, products} = req.body;
        const cart = new Cart({
            userId,
            products
        });
        const savedCart = await cart.save();
        res.status(201).json({ savedCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
}  

export const updateCart = async (req,res) => {
    try {
        const {userId, products} = req.body;
        const updatedCart = await Cart.findOneAndUpdate({userId}, {products}, {new: true});
        res.status(200).json({ updatedCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
}

export const removeCart = async (req,res) => {
    try {
        const {userId} = req.body;
        const deletedCart = await Cart.findOneAndDelete({userId});
        if(!deletedCart){
            return res.status(404).json({ message: 'Cart not found' });     
        }
        res.status(200).json({ deletedCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
}

export const getCartByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the cart by userId, populate user fullname and products
        const cart = await Cart.findOne({ userId })
            .populate('userId', 'fullname') // Populates user fullname
            .populate('products.productId'); // Populates product details

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


