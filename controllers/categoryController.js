import Category from "../models/categoryModel.js";
import asyncHandler from "../middleware/asyncHandler.js";

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  if (!name || name === undefined) {
    return res.status(400).json({ status: false, message: "Name is required" });
  }

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return res
      .status(400)
      .json({ status: false, message: "Category already exists" });
  }

  //create a new category
  const newCategory = new Category({ name, description, image });
  try {
    await newCategory.save();
    res.status(201).json({
      status: true,
      message: "Category created successfully",
      results: newCategory,
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }

  return res
    .status(200)
    .json({ status: true, message: `Category: ${name} created successfully` });
});

//get all categories
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json({ status: true, results: categories });
});

//update category by id
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  const categoryId = req.params.id;
  const category = await Category.findById(categoryId);
  if (category) {
    category.name = name || category.name;
    category.description = description || category.description;
    category.image = image || category.image;
    try {
      await category.save();
      res.status(200).json({
        status: true,
        message: "Category updated successfully",
        results: category,
      });
    } catch (error) {
      res.status(400).json({ status: false, message: error.message });
    }
  } else {
    res.status(404).json({ status: false, message: "Category not found" });
  }
});

const getCategoryById = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const category = await Category.findById(categoryId);
  if (category) {
    return res.status(200).json({ status: true, results: category });
  } else {
    return res
      .status(404)
      .json({ status: false, message: "Category not found" });
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const category = await Category.findById(categoryId);
  if (category) {
    try {
      await Category.deleteOne({ _id: categoryId });
      return res
        .status(200)
        .json({ status: true, message: "Category deleted successfully" });
    } catch (error) {
      res.status(400).json({ status: false, message: error.message });
    }
  }
});

//export controller functions
export { createCategory, getAllCategories, updateCategory, getCategoryById, deleteCategory };
