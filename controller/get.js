import User from "../models/user.js";
import Product from "../models/product.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Await the query
    // if (!users || users.length === 0) {
    //   return res.status(404).json({ msg: "No data found" }); // Use 404 for empty data
    // }
    return res.status(200).json({ users }); // Use 200 for success
  } catch (error) {
    return res.status(500).json({ msg: error.message }); // 500 for server error
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find(); // Await the query
    if (!products || products.length === 0) {
      return res.status(404).json({ msg: "No data found" }); // Use 404 for empty data
    }
    return res.status(200).json({ products }); // Use 200 for success
  } catch (error) {
    return res.status(500).json({ msg: error.message }); // 500 for server error
  }
};

export const getProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id); // Await the query
    if (!product) {
      return res.status(404).json({ msg: "No data found" }); // Use 404 for empty data
    }
    return res.status(200).json({product}); // Use 200 for success
  } catch (error) {
    return res.status(500).json({ msg: error.message }); // 500 for server error
  }
};
