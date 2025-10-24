
import Event from "../models/events.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";

// Get all events with pagination
export const getEvents = async (req, res) => {
  try {
    const { 
      isActive,
      page = 1,
      limit = 1
        } = req.query;
    const productsSkip = (page - 1) * limit;
    
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const events = await Event.find(filter)
      .sort({ createdAt: -1 });

    const totalEvents = await Event.countDocuments(filter);

    // Populate products with pagination for each event
    const eventsWithPaginatedProducts = await Promise.all(
      events.map(async (event) => {
        const eventObj = event.toObject();
        const totalProducts = eventObj.products.length;
        
        // Get paginated product IDs
        const paginatedProductIds = eventObj.products.slice(
          parseInt(productsSkip),
          parseInt(productsSkip) + parseInt(limit)
        );

        // Populate only the paginated products
        const populatedEvent = await Event.findById(event._id)
          .select('title bannerPopUpImage bannerImage isActive createdAt updatedAt')
          .populate({
            path: 'products',
            match: { _id: { $in: paginatedProductIds } }
          });

        return {
          ...populatedEvent.toObject(),
          productsPagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            limit: parseInt(limit),
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: eventsWithPaginatedProducts,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ 
      success: false,
      error: "An error occurred while fetching events." 
    });
  }
};

// Get single event by ID
export const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id).populate("products", "name price images");
    if (!event) {
      return res.status(404).json({ 
        success: false,
        error: "Event not found" 
      });
    }
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ 
      success: false,
      error: "An error occurred while fetching the event." 
    });
  }
};

// Create new event
export const createEvent = async (req, res) => {
  const { title, products, isActive } = req.body;
  
  try {
    const events = await Event.countDocuments();
    if(events == 2){
        return res.status(400).json({message: "Only two events are allowed" });
    }
    // Validate required fields
    if (!title) {
      return res.status(400).json({ 
        success: false,
        error: "Title is required" 
      });
    }

    if (!req.files || !req.files.bannerPopUpImage || !req.files.bannerImage) {
      return res.status(400).json({ 
        success: false,
        error: "Banner popup image and banner images are required" 
      });
    }

    // Upload banner popup image
    const bannerPopUpImage = req.files.bannerPopUpImage;
    const bannerPopUpImageUrl = await uploadToCloudinary(bannerPopUpImage.tempFilePath);

    // Upload banner images (multiple)
    const bannerImages = Array.isArray(req.files.bannerImage) 
      ? req.files.bannerImage 
      : [req.files.bannerImage];
    
    const bannerImageUrls = await Promise.all(
      bannerImages.map(img => uploadToCloudinary(img.tempFilePath))
    );

    // Parse products if it's a string
    let parsedProducts = products;
    if (typeof products === 'string') {
      try {
        parsedProducts = JSON.parse(products);
      } catch (e) {
        parsedProducts = products.split(',').map(p => p.trim());
      }
    }

    // Create new event
    const newEvent = new Event({
      title,
      bannerPopUpImage: bannerPopUpImageUrl,
      bannerImage: bannerImageUrls,
      products: parsedProducts || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    await newEvent.save();
    
    const populatedEvent = await Event.findById(newEvent._id)
      .populate("products", "name price images");

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: populatedEvent
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ 
      success: false,
      error: "An error occurred while creating the event." 
    });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, products, isActive } = req.body;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        error: "Event not found" 
      });
    }

    const updateData = {};

    // Update title if provided
    if (title) updateData.title = title;

    // Update isActive if provided
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update products if provided
    if (products) {
      let parsedProducts = products;
      if (typeof products === 'string') {
        try {
          parsedProducts = JSON.parse(products);
        } catch (e) {
          parsedProducts = products.split(',').map(p => p.trim());
        }
      }
      updateData.products = parsedProducts;
    }

    // Update banner popup image if provided
    if (req.files && req.files.bannerPopUpImage) {
      const bannerPopUpImage = req.files.bannerPopUpImage;
      const bannerPopUpImageUrl = await uploadToCloudinary(bannerPopUpImage.tempFilePath);
      await deleteFromCloudinary(event.bannerPopUpImage);
      updateData.bannerPopUpImage = bannerPopUpImageUrl;
    }

    // Update banner images if provided
    if (req.files && req.files.bannerImage) {
      const bannerImages = Array.isArray(req.files.bannerImage) 
        ? req.files.bannerImage 
        : [req.files.bannerImage];
      
      const bannerImageUrls = await Promise.all(
        bannerImages.map(img => uploadToCloudinary(img.tempFilePath))
      );

      // Delete old banner images
      await Promise.all(
        event.bannerImage.map(imgUrl => deleteFromCloudinary(imgUrl))
      );

      updateData.bannerImage = bannerImageUrls;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("products", "name price images");

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ 
      success: false,
      error: "An error occurred while updating the event." 
    });
  }
};

// Add products to event
export const addProductsToEvent = async (req, res) => {
  const { id } = req.params;
  const { products } = req.body;

  try {
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ 
        success: false,
        error: "Products array is required" 
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        error: "Event not found" 
      });
    }

    // Add only new products (avoid duplicates)
    const newProducts = products.filter(p => !event.products.includes(p));
    event.products.push(...newProducts);
    await event.save();

    const updatedEvent = await Event.findById(id)
      .populate("products", "name price images");

    res.status(200).json({
      success: true,
      message: "Products added successfully",
      data: updatedEvent
    });
  } catch (error) {
    console.error("Error adding products to event:", error);
    res.status(500).json({ 
      success: false,
      error: "An error occurred while adding products to the event." 
    });
  }
};

// Remove products from event
export const removeProductsFromEvent = async (req, res) => {
  const { id } = req.params;
  const { products } = req.body;

  try {
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ 
        success: false,
        error: "Products array is required" 
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        error: "Event not found" 
      });
    }

    event.products = event.products.filter(p => !products.includes(p.toString()));
    await event.save();

    const updatedEvent = await Event.findById(id)
      .populate("products", "name price images");

    res.status(200).json({
      success: true,
      message: "Products removed successfully",
      data: updatedEvent
    });
  } catch (error) {
    console.error("Error removing products from event:", error);
    res.status(500).json({ 
      success: false,
      error: "An error occurred while removing products from the event." 
    });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        error: "Event not found" 
      });
    }

    // Delete banner popup image from cloudinary
    await deleteFromCloudinary(event.bannerPopUpImage);

    // Delete all banner images from cloudinary
    await Promise.all(
      event.bannerImage.map(imgUrl => deleteFromCloudinary(imgUrl))
    );

    await Event.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true,
      message: "Event deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ 
      success: false,
      error: "An error occurred while deleting the event." 
    });
  }
};

// Toggle event active status
export const toggleEventStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        error: "Event not found" 
      });
    }

    event.isActive = !event.isActive;
    await event.save();

    res.status(200).json({
      success: true,
      message: `Event ${event.isActive ? 'activated' : 'deactivated'} successfully`,
      data: event
    });
  } catch (error) {
    console.error("Error toggling event status:", error);
    res.status(500).json({ 
      success: false,
      error: "An error occurred while toggling event status." 
    });
  }
};