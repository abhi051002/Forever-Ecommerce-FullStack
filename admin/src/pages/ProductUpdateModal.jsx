import React, { useState } from "react";
import { RiDeleteBinLine } from "react-icons/ri"; // DELETE ICON
import axios from "axios";
import { backEndURL } from "../App";
import { toast } from "react-toastify";

const defaultSizes = ["S", "M", "L"];

const ProductUpdateModal = ({ product, closeModal, refreshList, token }) => {
  // ============================
  //  IMAGE STATES
  // ============================
  const [image1, setImage1] = useState(product.image[0] || null);
  const [image2, setImage2] = useState(product.image[1] || null);
  const [image3, setImage3] = useState(product.image[2] || null);
  const [image4, setImage4] = useState(product.image[3] || null);

  const [fileImage1, setFileImage1] = useState(null);
  const [fileImage2, setFileImage2] = useState(null);
  const [fileImage3, setFileImage3] = useState(null);
  const [fileImage4, setFileImage4] = useState(null);

  // ============================
  //  NORMALIZE SIZE FORMAT HERE
  // ============================
  const [sizes, setSizes] = useState(() => {
    if (!Array.isArray(product.sizes)) return [];

    return product.sizes.map((s) => {
      // Old format: "S"
      if (typeof s === "string") {
        return { size: s, stock: 1 };
      }

      // Old format: { size: "S" }  (no stock)
      if (typeof s === "object" && !s.stock) {
        return { size: s.size, stock: 1 };
      }

      // Already correct format
      return s;
    });
  });

  // ============================
  //  BASIC STATES
  // ============================
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [category, setCategory] = useState(product.category);
  const [subCategory, setSubCategory] = useState(product.subCategory);
  const [bestseller, setBestseller] = useState(product.bestseller);

  const [customSize, setCustomSize] = useState("");
  const [loader, setLoader] = useState(false);

  // ============================
  //  SIZE OPERATIONS
  // ============================
  const removeSize = (size) => {
    setSizes((prev) => prev.filter((s) => s?.size !== size));
  };

  const handleSizeToggle = (size) => {
    const exists = sizes.find((s) => s?.size === size);

    if (exists) {
      removeSize(size);
    } else {
      setSizes((prev) => [...prev, { size, stock: 1 }]);
    }
  };

  const handleStockChange = (size, value) => {
    setSizes((prev) =>
      prev.map((s) => (s?.size === size ? { ...s, stock: Number(value) } : s))
    );
  };

  const addCustomSize = () => {
    const newSize = customSize.trim().toUpperCase();
    if (!newSize) return toast.error("Enter a valid size");

    if (sizes.some((s) => s.size === newSize))
      return toast.error("Size already exists");

    setSizes((prev) => [...prev, { size: newSize, stock: 1 }]);
    setCustomSize("");
  };

  // ============================
  //  UPDATE PRODUCT
  // ============================
  const updateProduct = async () => {
    setLoader(true);

    try {
      const formData = new FormData();
      formData.append("id", product._id);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));

      fileImage1 && formData.append("image1", fileImage1);
      fileImage2 && formData.append("image2", fileImage2);
      fileImage3 && formData.append("image3", fileImage3);
      fileImage4 && formData.append("image4", fileImage4);

      const response = await axios.post(
        backEndURL + "/api/product/update",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Product Updated Successfully!");
        refreshList();
        closeModal();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setLoader(false);
    }
  };

  // ============================
  //  MODAL UI
  // ============================
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-3 z-50">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-5 text-gray-800">
          Update Product
        </h2>

        {/* IMAGES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[1, 2, 3, 4].map((num) => {
            const img = eval("image" + num);
            return (
              <label key={num} htmlFor={"img" + num} className="cursor-pointer">
                <img
                  src={
                    eval("fileImage" + num)
                      ? URL.createObjectURL(eval("fileImage" + num))
                      : img
                  }
                  className="w-28 h-28 sm:w-24 sm:h-24 rounded-lg border object-cover shadow-sm hover:opacity-80 transition"
                />
                <input
                  type="file"
                  hidden
                  id={"img" + num}
                  onChange={(e) =>
                    eval("setFileImage" + num)(e.target.files[0])
                  }
                />
              </label>
            );
          })}
        </div>

        {/* NAME */}
        <input
          className="w-full border p-3 rounded-lg mb-5 text-gray-700 shadow-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Name"
        />

        {/* DESCRIPTION */}
        <textarea
          className="w-full border p-3 rounded-lg mb-5 text-gray-700 shadow-sm"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product Description"
        />

        {/* CATEGORY SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <select
            className="border p-3 rounded-lg text-gray-700 shadow-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Men</option>
            <option>Women</option>
            <option>Kids</option>
          </select>

          <select
            className="border p-3 rounded-lg text-gray-700 shadow-sm"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
          >
            <option>Topwear</option>
            <option>Bottomwear</option>
            <option>Winterwear</option>
          </select>

          <input
            type="number"
            className="border p-3 rounded-lg text-gray-700 shadow-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
          />
        </div>

        {/* SIZES */}
        <p className="font-semibold mb-2 text-gray-800">Sizes + Stock</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from(
            new Set([...defaultSizes, ...sizes.map((s) => s.size)])
          ).map((size) => {
            const selected = sizes.find((s) => s?.size === size);

            return (
              <div
                key={size}
                className={`p-4 border rounded-xl transition shadow-sm relative ${
                  selected ? "bg-pink-50 border-pink-500" : "bg-white"
                }`}
              >
                <div
                  onClick={() => handleSizeToggle(size)}
                  className="font-semibold cursor-pointer select-none text-gray-700"
                >
                  {size}
                </div>

                {/* DELETE SIZE */}
                {selected && (
                  <button
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSize(size);
                    }}
                  >
                    <RiDeleteBinLine size={18} />
                  </button>
                )}

                {/* STOCK INPUT */}
                {selected && (
                  <input
                    type="number"
                    className="mt-3 border p-2 w-full rounded-lg shadow-sm text-gray-700"
                    value={selected.stock}
                    onChange={(e) => handleStockChange(size, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Stock"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* CUSTOM SIZE */}
        <div className="flex gap-4 mt-5 mb-5">
          <input
            type="text"
            className="border p-3 rounded-lg w-full shadow-sm"
            placeholder="Custom size (e.g., 3XL)"
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
          />
          <button
            type="button"
            className="bg-pink-600 text-white px-5 rounded-lg shadow hover:bg-pink-700 transition"
            onClick={addCustomSize}
          >
            Add
          </button>
        </div>

        {/* BESTSELLER */}
        <div className="flex gap-3 mb-6 items-center">
          <input
            type="checkbox"
            checked={bestseller}
            onChange={() => setBestseller(!bestseller)}
          />
          <span className="text-gray-700 font-medium">Add to Bestseller</span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-between mt-6">
          <button
            className="px-6 py-3 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 transition"
            onClick={closeModal}
          >
            Cancel
          </button>

          <button
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            onClick={updateProduct}
            disabled={loader}
          >
            {loader ? "Updating..." : "Update Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductUpdateModal;
