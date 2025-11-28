// src/controllers/categoryController.js
import Category from "../models/categoryModel.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    // Check if category already exists
    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ 
        success: false,
        message: "Category already exists" 
      });
    }

    const category = await Category.create({ 
      name, 
      description, 
      color: color || "#10B981",
      icon 
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while creating category",
      error: error.message 
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching categories",
      error: error.message 
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, color, icon },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while updating category",
      error: error.message 
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: "Category not found" 
      });
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    res.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while deleting category",
      error: error.message 
    });
  }
};