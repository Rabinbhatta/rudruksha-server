import User from "../models/user.js";
import Product from "../models/product.js";

export const getUsers = async (req, res) => {
  try {
    // Extract pagination parameters from the query string
    const { page = 1, limit = 10 } = req.query;

    // Calculate the starting index for pagination
    const startIndex = (page - 1) * limit;

    // Get the total number of users in the database
    const total = await User.countDocuments({});

    // Fetch users with pagination
    const users = await User.find()
      .select("-password") // Exclude the password field
      .limit(limit) // Limit the number of results per page
      .skip(startIndex); // Skip the documents before the start index

    // Return the response with pagination details
    res.status(200).json({
      users,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total: total,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Handle server errors
  }
};

export const getProducts = async (req, res) => {
  const {
    sortBy = "",
    order = "asc",
    page = 1,
    limit = 8,
    excludeId,
    filterBy, // Now supports multiple filters
    filterValue,
  } = req.query;

  try {
    // Determine sort order
    const sortOrder = order === "desc" ? -1 : 1;

    // Parse pagination parameters
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 8;
    const skip = (pageNumber - 1) * limitNumber;

    // Build the match stage dynamically
    const matchStage = {};

    if (excludeId) {
      matchStage._id = { $ne: excludeId };
    }

    if (filterBy && filterValue) {
      const filters = filterBy.split(",");
      const values = filterValue.split(",");

      filters.forEach((filter, index) => {
        const value = values[index];

        switch (filter) {
          case "priceRange":
            const [minPrice, maxPrice] = value.split("-").map(parseFloat);
            matchStage.priceNumeric = { $gte: minPrice, $lte: maxPrice };
            break;
          case "category":
            matchStage.category = { $in: value.split("|") };
            break;
          case "subCategory":
            matchStage.subCategory = { $in: value.split("|") };
            break;
          case "country":
            matchStage.country = { $in: value.split("|") };
            break;
          case "size":
            matchStage.size = { $in: value.split("|") };
            break;
          case "faces":
            matchStage.facesNumeric = parseInt(value, 10);
            break;
          case "sale":
            matchStage.isSale = value === "true";
            break;
          case "special":
            matchStage.isSpecial = value === "true";
            break;
          case "topSelling":
            matchStage.isTopSelling = value === "true";
            break;
          case "exclusive":
            matchStage.isExclusive = value === "true";
            break;
          default:
            break;
        }
      });
    }

    // Fetch products with filtering, sorting, and pagination
    const products = await Product.aggregate([
      {
        $addFields: {
          priceNumeric: { $toDouble: "$price" },
          facesNumeric: { $toInt: "$faces" },
          sizeNumeric: {
            $switch: {
              branches: [
                { case: { $eq: ["$size", "small"] }, then: 1 },
                { case: { $eq: ["$size", "medium"] }, then: 2 },
                { case: { $eq: ["$size", "big"] }, then: 3 },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $match: matchStage,
      },
      {
        $sort: {
          [sortBy === "size"
            ? "sizeNumeric"
            : sortBy === "faces"
            ? "facesNumeric"
            : "priceNumeric"]: sortOrder,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limitNumber,
      },
    ]);

    const totalCount = await Product.countDocuments(matchStage);

    res.status(200).json({
      products,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching products." });
  }
};

export const getProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id); // Await the query
    if (!product) {
      return res.status(404).json({ msg: "No data found" }); // Use 404 for empty data
    }
    return res.status(200).json({ product }); // Use 200 for success
  } catch (error) {
    return res.status(500).json({ msg: error.message }); // 500 for server error
  }
};
