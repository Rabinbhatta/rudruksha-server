import Order from "../models/order.js";
import PromoCode from "../models/promocode.js";
import Notification from "../models/notification.js";
import PersonalInfo from "../models/personal-info.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/email.js";
import { getOrderConfirmationTemplate, getOrderStatusUpdateTemplate, getPaymentStatusUpdateTemplate, getAdminOrderNotificationTemplate } from "../utils/emailTemplates.js";

import mongoose from "mongoose";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      orderId,
      fullname, // Legacy field - will use deliveryAddress.fullname if available
      email, // Legacy field - will use deliveryAddress.email if available
      phone, // Legacy field - will use deliveryAddress.phone if available
      products,
      totalAmout,
      orderStatus,
      deliveryAddress,
      promocode,
      paymentMethod,
      paymentStatus,
      transactionId,
      shippingLocation,
      shippingFee,
      subtotal,
      discountAmount,
      subtotalAfterDiscount,
    } = req.body;

    // User ID is optional: guest orders are allowed
    // req.userId is set by optional_jwt_verify middleware if token is present
    let userId = req.userId || req.body.userId || null;
    
    // Convert userId to ObjectId if it's a valid string
    if (userId && typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userId = new mongoose.Types.ObjectId(userId);
    }

    // Handle payment verification image upload
    let paymentVerificationImageUrl = null;
    if (req.files && req.files.paymentVerificationImage) {
      const paymentImage = req.files.paymentVerificationImage;
      paymentVerificationImageUrl = await uploadToCloudinary(paymentImage.tempFilePath);
    }

    // Parse JSON-encoded fields when they come from multipart/form-data
    let parsedProducts = products;
    let parsedDeliveryAddress = deliveryAddress;
    let parsedShippingLocation = shippingLocation;
    let parsedShippingFee = shippingFee;

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

    // Parse shippingFee if it's a string
    if (typeof parsedShippingFee === "string") {
      parsedShippingFee = parseFloat(parsedShippingFee) || 0;
    }

    // Parse additional amount fields if they're strings
    // All amounts are stored in cents (multiplied by 100) for consistency
    let parsedSubtotal = subtotal;
    let parsedDiscountAmount = discountAmount;
    let parsedSubtotalAfterDiscount = subtotalAfterDiscount;

    if (typeof parsedSubtotal === "string") {
      parsedSubtotal = parseFloat(parsedSubtotal) || null;
    }
    if (typeof parsedDiscountAmount === "string") {
      parsedDiscountAmount = parseFloat(parsedDiscountAmount) || null;
    }
    if (typeof parsedSubtotalAfterDiscount === "string") {
      parsedSubtotalAfterDiscount = parseFloat(parsedSubtotalAfterDiscount) || null;
    }
    
    // Ensure all amounts are in cents (if they come as decimals, multiply by 100)
    // This handles backward compatibility with old orders that might have been stored differently
    if (parsedSubtotal != null && parsedSubtotal < 10000) {
      // If subtotal is less than 10000, it's likely in dollars, convert to cents
      parsedSubtotal = Math.round(parsedSubtotal * 100);
    }
    if (parsedDiscountAmount != null && parsedDiscountAmount < 10000) {
      parsedDiscountAmount = Math.round(parsedDiscountAmount * 100);
    }
    if (parsedSubtotalAfterDiscount != null && parsedSubtotalAfterDiscount < 10000) {
      parsedSubtotalAfterDiscount = Math.round(parsedSubtotalAfterDiscount * 100);
    }
    if (parsedShippingFee != null && parsedShippingFee < 10000) {
      parsedShippingFee = Math.round(parsedShippingFee * 100);
    }

    // Use deliveryAddress fields if available, otherwise fall back to legacy fields
    const orderFullname = parsedDeliveryAddress?.fullname || fullname
    const orderEmail = parsedDeliveryAddress?.email || email
    const orderPhone = parsedDeliveryAddress?.phone || phone

    // Validate required fields (userId is NOT required for guest checkout)
    // Email is optional for Nepal orders
    const isNepalOrder = parsedShippingLocation === 'insideKathmandu' || parsedShippingLocation === 'outsideKathmandu' ||
                         (parsedDeliveryAddress?.country && parsedDeliveryAddress.country.toLowerCase() === 'nepal')
    
    if (
      !orderFullname ||
      (!isNepalOrder && !orderEmail) ||
      !orderPhone ||
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

    // Validate location-specific required fields
    if (isNepalOrder) {
      if (!parsedDeliveryAddress.district || !parsedDeliveryAddress.municipality || !parsedDeliveryAddress.streetToleLandmark) {
        return res.status(400).json({
          success: false,
          message: "Missing required Nepal address fields: district, municipality, and street/tole/landmark are required"
        });
      }
    } else if (parsedShippingLocation === 'india' || (parsedDeliveryAddress?.country && parsedDeliveryAddress.country.toLowerCase() === 'india')) {
      if (!parsedDeliveryAddress.state || !parsedDeliveryAddress.addressLine1) {
        return res.status(400).json({
          success: false,
          message: "Missing required India address fields: state and addressLine1 are required"
        });
      }
    } else {
      // Other countries
      if (!parsedDeliveryAddress.addressLine1Other || !parsedDeliveryAddress.postalZipCode) {
        return res.status(400).json({
          success: false,
          message: "Missing required address fields: addressLine1Other and postalZipCode are required"
        });
      }
    }

    const promoCode = await PromoCode.findById(promocode);

    if (!promoCode && promocode) {
      return res.status(400).json({ message: "Invalid promocode" });
    }


    // Only enforce per-user promocode restrictions when we have a userId
    if (promoCode && userId && !promoCode.usedCount.includes(userId)) {
      return res.status(400).json({ message: "Promocode not applicable for this user" });
    }

    // Determine order location type and shipping location based on country and district
    const country = parsedDeliveryAddress?.country?.toLowerCase() || '';
    let orderLocationType = 'other';
    let finalShippingLocation = parsedShippingLocation;
    
    // Auto-determine shipping location if not provided
    if (!finalShippingLocation && country) {
      if (country === 'nepal' || country.includes('nepal')) {
        // For Nepal: check district to determine inside/outside Kathmandu
        const district = parsedDeliveryAddress?.district?.toLowerCase() || '';
        if (district === 'kathmandu') {
          finalShippingLocation = 'insideKathmandu';
        } else {
          finalShippingLocation = 'outsideKathmandu';
        }
        orderLocationType = 'nepal';
      } else if (country === 'india' || country.includes('india')) {
        finalShippingLocation = 'india';
        orderLocationType = 'india';
      } else {
        finalShippingLocation = 'otherInternational';
        orderLocationType = 'other';
      }
    } else if (finalShippingLocation) {
      // If shipping location is provided, determine order location type from it
      if (finalShippingLocation === 'insideKathmandu' || finalShippingLocation === 'outsideKathmandu') {
        orderLocationType = 'nepal';
      } else if (finalShippingLocation === 'india') {
        orderLocationType = 'india';
      } else if (finalShippingLocation === 'otherInternational') {
        orderLocationType = 'other';
      }
    } else if (country === 'nepal' || country.includes('nepal')) {
      // Fallback: if country is Nepal but no shipping location, default to outsideKathmandu
      finalShippingLocation = 'outsideKathmandu';
      orderLocationType = 'nepal';
    } else if (country === 'india' || country.includes('india')) {
      finalShippingLocation = 'india';
      orderLocationType = 'india';
    }

    // Pull shipping estimate text from personal info based on location
    let estimatedDeliveryDays = null;
    try {
      const personalInfo = await PersonalInfo.getOrCreate();
      const estimates = personalInfo?.shippingEstimates || {};
      if (finalShippingLocation && typeof estimates[finalShippingLocation] === 'string') {
        estimatedDeliveryDays = estimates[finalShippingLocation];
      }
    } catch (err) {
      console.error('Error fetching shipping estimates', err);
    }

    // Provide a sensible fallback if no estimate was configured
    if (!estimatedDeliveryDays && finalShippingLocation) {
      const fallbackEstimates = {
        insideKathmandu: '3-5 days',
        outsideKathmandu: '5-7 days',
        india: '7-10 days',
        otherInternational: '10-15 days',
      };
      estimatedDeliveryDays = fallbackEstimates[finalShippingLocation] || null;
    }

    // Ensure deliveryAddress has fullname, email, phone (use from deliveryAddress or fallback to legacy fields)
    if (!parsedDeliveryAddress.fullname) {
      parsedDeliveryAddress.fullname = orderFullname
    }
    if (!parsedDeliveryAddress.email && orderEmail) {
      parsedDeliveryAddress.email = orderEmail
    }
    if (!parsedDeliveryAddress.phone) {
      parsedDeliveryAddress.phone = orderPhone
    }

    // Create new order
    const newOrder = new Order({
      orderId,
      userId: userId || undefined, // Use undefined instead of null to ensure it's saved correctly
      fullname: orderFullname, // Keep for backward compatibility
      email: orderEmail || null, // Keep for backward compatibility
      phone: orderPhone, // Keep for backward compatibility
      products: parsedProducts,
      totalAmout,
      subtotal: parsedSubtotal,
      discountAmount: parsedDiscountAmount,
      subtotalAfterDiscount: parsedSubtotalAfterDiscount,
      orderStatus: orderStatus || "Pending",
      deliveryAddress: parsedDeliveryAddress,
      promocode: promocode || null,
      paymentMethod,
      paymentStatus: paymentStatus || "Pending",
      transactionId: transactionId || null,
      paymentVerificationImage: paymentVerificationImageUrl,
      shippingLocation: finalShippingLocation || null,
      shippingFee: parsedShippingFee || 0,
      orderLocationType: orderLocationType, // Add location type for easier filtering
      estimatedDeliveryDays: estimatedDeliveryDays || null,
    });

    await newOrder.save();

    // Create notification for admin
    const notification = new Notification({
      type: 'order',
      title: 'New Order Received',
      message: `New order ${newOrder.orderId} from ${newOrder.fullname}`,
      relatedId: newOrder._id,
      relatedModel: 'Order',
    });
    await notification.save();

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

    // Add orderType field to each order (user or guest)
    const ordersWithType = orders.map(order => ({
      ...order.toObject(),
      orderType: order.userId ? 'user' : 'guest'
    }));

    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: ordersWithType,
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

    // Add orderType field (user or guest)
    const orderWithType = {
      ...order.toObject(),
      orderType: order.userId ? 'user' : 'guest'
    };

    res.status(200).json({
      success: true,
      data: orderWithType,
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

    // Ensure userId exists (should be set by jwt_verify middleware)
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const skip = (page - 1) * limit;

    // Convert userId to ObjectId for querying (MongoDB stores it as ObjectId)
    const userIdObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;
    
    // Query orders - try both formats to ensure we find all orders
    let orders = await Order.find({ userId: userIdObjectId })
      .populate("products.productId", "title price img size")
      .populate("products.variant", "name")
      .populate("promocode", "code discount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // If no orders found with ObjectId, try with string format
    if (orders.length === 0 && typeof userId === 'string') {
      orders = await Order.find({ userId: userId })
        .populate("products.productId", "title price img size")
        .populate("products.variant", "name")
        .populate("promocode", "code discount")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

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

    // Count with same query logic
    const totalOrders = await Order.countDocuments({ userId: userIdObjectId });

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