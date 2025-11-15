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
// List Products with Search, Filter, Pagination
const listProduct = async (req, res) => {
  try {
    // Query Parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const subCategory = req.query.subCategory || "";
    const bestseller = req.query.bestseller || "";

    // Build Dynamic Filter Object
    let filter = {};

    // SEARCH by product name
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // CATEGORY FILTER
    if (category) {
      filter.category = category;
    }

    // SUBCATEGORY FILTER
    if (subCategory) {
      filter.subCategory = subCategory;
    }

    // BESTSELLER FILTER
    if (bestseller === "true") {
      filter.bestseller = true;
    }

    // Pagination calculations
    const skip = (page - 1) * limit;

    // Get filtered + paginated data
    const products = await productModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    // Total Count for pagination
    const totalProducts = await productModel.countDocuments(filter);

    res.json({
      success: true,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
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

// Update Product
const updateProduct = async (req, res) => {
  try {
    const productId = req.body.id;

    if (!productId) {
      return res.json({ success: false, message: "Product ID is required" });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // =============================
    //   HANDLE IMAGES (if provided)
    // =============================
    let updatedImages = product.image; // keep existing images

    const imageFiles = [
      req.files?.image1?.[0] || null,
      req.files?.image2?.[0] || null,
      req.files?.image3?.[0] || null,
      req.files?.image4?.[0] || null,
    ].filter((file) => file !== null);

    if (imageFiles.length > 0) {
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );

      // Replace existing images with new ones
      updatedImages = imageUrls;
    }

    // =============================
    //   HANDLE SIZES UPDATE
    // =============================
    let parsedSizes = product.sizes; // keep old sizes if not updating

    if (req.body.sizes) {
      try {
        parsedSizes = JSON.parse(req.body.sizes);

        if (!Array.isArray(parsedSizes)) {
          throw new Error("Sizes must be an array");
        }

        parsedSizes = parsedSizes.filter((s) => {
          if (!s.size || s.stock === undefined) return false;
          return Number(s.stock) >= 1;
        });

        if (parsedSizes.length === 0) {
          return res.json({
            success: false,
            message: "Add at least one size with stock",
          });
        }
      } catch (err) {
        return res.json({ success: false, message: "Invalid sizes format" });
      }
    }

    // =============================
    //   UPDATE PRODUCT FIELDS
    // =============================
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.subCategory = req.body.subCategory || product.subCategory;
    product.bestseller =
      req.body.bestseller !== undefined
        ? req.body.bestseller === "true"
        : product.bestseller;

    product.sizes = parsedSizes;
    product.image = updatedImages;

    await product.save();

    res.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addProduct, listProduct, removeProduct, singleProduct, updateProduct };
