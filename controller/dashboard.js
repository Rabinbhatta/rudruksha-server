import express from "express";
import User from "../models/user.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import Event from "../models/events.js";
import Consultation from "../models/consultation.js";
import Blog from "../models/blog.js";

const router = express.Router();

// GET /api/dashboard/stats

export const dashboardStats = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalConsultations = await Consultation.countDocuments();
    const totalBlogs = await Blog.countDocuments();

    // Orders over time (last 30 days)
    const ordersOverTimeRaw = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const ordersOverTime = ordersOverTimeRaw.map(item => ({
      date: item._id,
      count: item.count,
    }));

    // Top-selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          name: "$product.title",          // For frontend chart
          quantity: "$totalSold",          // For frontend chart
          revenue: { $literal: 0 },        // Placeholder revenue
        },
      },
    ]);

    // Product category distribution using Category model
    const productCategoriesRaw = await Product.aggregate([
      {
        $lookup: {
          from: "categories",        // MongoDB collection name
          localField: "category",    // field in Product
          foreignField: "name",      // field in Category
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo.name",
          count: { $sum: 1 },
        },
      },
    ]);

    const productCategories = productCategoriesRaw.map(item => ({
      name: item._id,
      count: item.count,
    }));

    // User signups over time (last 30 days)
    const userSignupsRaw = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const userSignups = userSignupsRaw.map(item => ({
      date: item._id,
      count: item.count,
    }));

    // Send response
    res.json({
      totals: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        events: totalEvents,
        consultations: totalConsultations,
        blogs: totalBlogs,
      },
      charts: {
        ordersOverTime,
        topProducts,
        productCategories,
        userSignups,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};



