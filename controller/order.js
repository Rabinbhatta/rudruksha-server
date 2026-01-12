import Order from "../models/order.js";
import PromoCode from "../models/promocode.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/email.js";
import { getOrderConfirmationTemplate, getOrderStatusUpdateTemplate, getPaymentStatusUpdateTemplate, getAdminOrderNotificationTemplate } from "../utils/emailTemplates.js";

import mongoose from "mongoose";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      orderId,
      fullname,
      email,
      phone,
      products,
      totalAmout,
      orderStatus,
      deliveryAddress,
      promocode,
      paymentMethod,
      paymentStatus,
      shippingLocation,
      shippingFee,
    } = req.body;

    // User ID is optional: guest orders are allowed
    const userId = req.userId || req.body.userId || null;

    // Handle payment verification image upload
    let paymentVerificationImageUrl = null;
    if (req.files && req.files.paymentVerificationImage) {
      const paymentImage = req.files.paymentVerificationImage;
      paymentVerificationImageUrl = await uploadToCloudinary(paymentImage.tempFilePath);
    }

    // Parse JSON-encoded fields when they come from multipart/form-data
    let parsedProducts = products;
    let parsedDeliveryAddress = deliveryAddress;

    if (typeof parsedProducts === "string") {
      try {
        parsedProducts = JSON.parse(parsedProducts);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid products format",
        });
      }
    }

    if (typeof parsedDeliveryAddress === "string") {
      try {
        parsedDeliveryAddress = JSON.parse(parsedDeliveryAddress);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid deliveryAddress format",
        });
      }
    }

    // Validate required fields (userId is NOT required for guest checkout)
    if (
      !fullname ||
      !email ||
      !phone ||
      !parsedProducts ||
      !totalAmout ||
      !parsedDeliveryAddress ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const promoCode = await PromoCode.findById(promocode);

    if (!promoCode && promocode) {
      return res.status(400).json({ message: "Invalid promocode" });
    }


    // Only enforce per-user promocode restrictions when we have a userId
    if (promoCode && userId && !promoCode.usedCount.includes(userId)) {
      return res.status(400).json({ message: "Promocode not applicable for this user" });
    }

    // Create new order
    const newOrder = new Order({
      orderId,
      userId,
      fullname,
      email,
      phone,
      products: parsedProducts,
      totalAmout,
      orderStatus: orderStatus || "Pending",
      deliveryAddress: parsedDeliveryAddress,
      promocode: promocode || null,
      paymentMethod,
      paymentStatus: paymentStatus || "Pending",
      paymentVerificationImage: paymentVerificationImageUrl,
      shippingLocation: shippingLocation || null,
      shippingFee: shippingFee || 0,
    });

    await newOrder.save();

    // Send Order Confirmation Email
    const emailHtml = getOrderConfirmationTemplate(newOrder);
    await sendEmail(newOrder.email, "Order Confirmation - Rudraksha", emailHtml);

    // Send Admin Notification Email
    const adminEmailHtml = getAdminOrderNotificationTemplate(newOrder);
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    await sendEmail(adminEmail, `New Order Received - ${newOrder.orderId}`, adminEmailHtml);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

// Get all orders with pagination and filters
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      orderStatus,
      paymentStatus,
      userId
    } = req.query;

    // Build filter object
    const filter = {};
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (userId) filter.userId = userId;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate("userId", "fullName email")
      .populate("products.productId")
      .populate("products.variant", "name")
      .populate("products.size", "name")
      .populate("promocode", "code discount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id)
      .populate("userId", "name email")
      .populate("products.productId", "name price images")
      .populate("products.variant", "name color")
      .populate("products.size", "name")
      .populate("promocode", "code discount");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// Update order
export const editOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find and update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("userId", "name email")
      .populate("products.productId", "name price")
      .populate("products.variant", "name")
      .populate("products.size", "name")
      .populate("promocode", "code discount");

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const orderStatus = status;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: { orderStatus } },
      { new: true }
    );

    if (updatedOrder) {
      // Send Order Status Update Email
      const emailHtml = getOrderStatusUpdateTemplate(updatedOrder);
      await sendEmail(updatedOrder.email, `Order Status Updated: ${orderStatus}`, emailHtml);
    }

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const paymentStatus = status;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: { paymentStatus } },
      { new: true }
    );

    if (updatedOrder) {
      // Send Payment Status Update Email
      const emailHtml = getPaymentStatusUpdateTemplate(updatedOrder);
      await sendEmail(updatedOrder.email, `Payment Status Updated: ${paymentStatus}`, emailHtml);
    }

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message,
    });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: deletedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting order",
      error: error.message,
    });
  }
};

// Get orders by user ID
export const getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const skip = (page - 1) * limit;

    // Fetch orders and populate product & variant references
    const orders = await Order.find({ userId })
      .populate("products.productId", "title price img size") // include size array
      .populate("products.variant", "name")
      .populate("promocode", "code discount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Map each order to include the actual size info
    const ordersWithSizeDetails = orders.map((order) => {
      const updatedProducts = order.products.map((item) => {
        let sizeDetails = null;

        // Find the size from the product's size array using the saved _id
        if (item.size && item.productId && item.productId.size) {
          const foundSize = item.productId.size.id(item.size);
          if (foundSize) {
            sizeDetails = {
              id: foundSize._id,
              name: foundSize.name,
              price: foundSize.price,
            };
          }
        }

        return {
          ...item.toObject(),
          size: sizeDetails,
        };
      });

      return {
        ...order.toObject(),
        products: updatedProducts,
      };
    });

    const totalOrders = await Order.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: ordersWithSizeDetails,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user orders",
      error: error.message,
    });
  }
};



export const deleteOrdersByUserId = async (req, res) => {
  try {
    const userId = req.userId;
    const orderId = req.params.orderId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const order = await Order.findOne({ userId, _id: orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found for this user" });
    }
    if (order.orderStatus != "Pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }
    order.orderStatus = "Cancelled";
    const result = await order.save();
    res.status(200).json({
      success: true,
      message: "Orders cancelled successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting orders",
      error: error.message,
    });
  }
};