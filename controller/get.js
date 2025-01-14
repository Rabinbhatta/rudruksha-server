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
  const { 
    sortBy = '', 
    order = 'asc', 
    page = 1, 
    limit = 8, 
    filterBy, 
    filterValue 
  } = req.query;

  try {
    // Determine sort order
    const sortOrder = order === 'desc' ? -1 : 1;

    // Parse pagination parameters
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 8;
    const skip = (pageNumber - 1) * limitNumber;

    // Build the match stage with filters
    const matchStage = {};

    if (filterBy && filterValue) {
      switch (filterBy) {
        case 'priceRange':
          const [minPrice, maxPrice] = filterValue.split(',').map(parseFloat);
          matchStage.priceNumeric = { $gte: minPrice, $lte: maxPrice };
          break;
        case 'category':
          matchStage.category = { $in: filterValue.split(',') };
          break;
        case 'country':
          matchStage.country = { $in: filterValue.split(',') };
          break;
        case 'size':
          matchStage.size = { $in: filterValue.split(',') };
          break;
        case 'faces':
          matchStage.facesNumeric = parseInt(filterValue, 10);
          break;
        case 'sale':
          matchStage.isSale = filterValue === 'true';
          break;
          case 'special':
          matchStage.isSpecial = filterValue === 'true';
          break;
          case 'topSelling':
          matchStage.isTopSelling = filterValue === 'true';
          break;
        default:
          break;
      }
    }

    // Fetch products with filtering, sorting, and pagination
    const products = await Product.aggregate([
      // Convert string fields to appropriate types for sorting and filtering
      {
        $addFields: {
          priceNumeric: { $toDouble: '$price' },
          facesNumeric: { $toInt: '$faces' },
          sizeNumeric: {
            $switch: {
              branches: [
                { case: { $eq: ['$size', 'small'] }, then: 1 },
                { case: { $eq: ['$size', 'medium'] }, then: 2 },
                { case: { $eq: ['$size', 'big'] }, then: 3 },
              ],
              default: 0,
            },
          },
        },
      },
      // Apply filters
      {
        $match: matchStage,
      },
      // Sort based on the sortBy parameter
      {
        $sort: {
          [sortBy === 'size' ? 'sizeNumeric' : sortBy === 'faces' ? 'facesNumeric' : 'priceNumeric']: sortOrder,
        },
      },
      // Pagination
      {
        $skip: skip,
      },
      {
        $limit: limitNumber,
      },
    ]);

    // Get total count for pagination metadata
    const totalCount = await Product.countDocuments(matchStage);

    // Respond with the paginated and sorted products
    res.status(200).json({
      products,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'An error occurred while fetching products.' });
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
