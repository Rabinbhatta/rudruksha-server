import Category from "../models/category.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const createSubCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    const { name } = req.body;
    category.subCategories.push({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.log(error.message);
    res.status(409).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(category);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategory = await Category.findOneAndUpdate(
      { "subCategories._id": id }, // Find category containing subcategory
      { $pull: { subCategories: { _id: id } } }, // Remove subcategory
      { new: true } // Return updated document
    );

    if (!updatedCategory) {
      console.log("Subcategory not found!");
      return;
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
