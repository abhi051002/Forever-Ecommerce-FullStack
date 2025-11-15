import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// Add Product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;

    // --- Handle Images ---
    const imageFiles = [
      req.files.image1?.[0] || null,
      req.files.image2?.[0] || null,
      req.files.image3?.[0] || null,
      req.files.image4?.[0] || null,
    ].filter((file) => file !== null);

    const imageUrls = await Promise.all(
      imageFiles.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    // =============================
    //   SIZE VALIDATION START
    // =============================
    let parsedSizes = [];
    try {
      parsedSizes = JSON.parse(sizes);

      if (!Array.isArray(parsedSizes)) {
        throw new Error("Sizes must be an array");
      }

      // Validate and filter sizes
      parsedSizes = parsedSizes.filter((s) => {
        if (!s.size || s.stock === undefined) return false; // invalid format
        return Number(s.stock) >= 1; // keep only sizes with stock >= 1
      });

      // No valid size with stock?
      if (parsedSizes.length === 0) {
        return res.json({
          success: false,
          message: "Add at least one size with stock",
        });
      }
    } catch (err) {
      return res.json({ success: false, message: "Invalid sizes format" });
    }
    // =============================
    //   SIZE VALIDATION END
    // =============================

    // --- Create Product ---
    const product = new productModel({
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true",
      sizes: parsedSizes,
      image: imageUrls,
      date: Date.now(),
    });

    await product.save();

    res.json({ success: true, message: "Product Added Successfully." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// List all products
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Remove product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const singleProduct = await productModel.findById(productId);
    res.json({ success: true, singleProduct });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { addProduct, listProduct, removeProduct, singleProduct };
