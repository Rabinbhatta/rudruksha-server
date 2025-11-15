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
    excludeSlug,
    filterBy,
    filterValue,
  } = req.query;

  try {
    const sortOrder = order === "desc" ? -1 : 1;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 8;
    const skip = (pageNumber - 1) * limitNumber;

    // MATCH STAGE
    const matchStage = {};
    if (excludeSlug) {
      matchStage.slug = { $ne: excludeSlug };
    }
    if (filterBy && filterValue) {
      const filters = filterBy.split(",");
      const values = filterValue.split(",");
      filters.forEach((filter, idx) => {
        const value = values[idx];
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
        }
      });
    }

    const products = await Product.aggregate([
      {
        $addFields: {
          priceNumeric: {
            $convert: {
              input: "$price",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
          facesNumeric: {
            $convert: {
              input: "$faces",
              to: "int",
              onError: 0,
              onNull: 0,
            },
          },
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
      { $match: matchStage },
      {
        $lookup: {
          from: "variants",
          localField: "variants",
          foreignField: "_id",
          as: "variants",
        },
      },
      {
        $lookup: {
          from: "variants",
          localField: "defaultVariant",
          foreignField: "_id",
          as: "defaultVariant",
        },
      },
      {
        $unwind: {
          path: "$defaultVariant",
          preserveNullAndEmptyArrays: true,
        },
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
      { $skip: skip },
      { $limit: limitNumber },
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


export const getProductBySlug = async (req, res) => {
  const { slug } = req.params; // assuming slug comes from the URL: /products/:slug

  try {
    // Find the product by slug
    let product = await Product.findOne({ slug }).populate("variants").populate("defaultVariant");

    if(!product) {
      product = await Product.findById(slug).populate("variants").populate("defaultVariant");
    }


    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the product." });
  }
};
