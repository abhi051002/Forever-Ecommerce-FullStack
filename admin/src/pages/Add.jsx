import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backEndURL } from "../App";
import { toast } from "react-toastify";

const defaultSizes = ["S", "M", "L"];

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");

  const [sizes, setSizes] = useState([]);
  const [customSize, setCustomSize] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [loader, setLoader] = useState(false);

  // Toggle size selection
  const handleSizeToggle = (size) => {
    const exists = sizes.find((s) => s.size === size);

    if (exists) {
      setSizes((prev) => prev.filter((s) => s.size !== size));
    } else {
      setSizes((prev) => [...prev, { size, stock: 0 }]);
    }
  };

  const handleStockChange = (size, stockValue) => {
    setSizes((prev) =>
      prev.map((s) =>
        s.size === size ? { ...s, stock: Number(stockValue) } : s
      )
    );
  };

  // ➕ Add Custom Size
  const addCustomSize = () => {
    const newSize = customSize.trim().toUpperCase();

    if (!newSize) return toast.error("Enter a valid size");
    if (defaultSizes.includes(newSize)) return toast.error("This size already exists");
    if (sizes.some((s) => s.size === newSize)) return toast.error("Size already added");

    setSizes((prev) => [...prev, { size: newSize, stock: 0 }]);
    setCustomSize("");
    toast.success("Custom size added!");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backEndURL + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Product Added Successfully!");

        setName("");
        setDescription("");
        setPrice("");
        setCategory("Men");
        setSubCategory("Topwear");
        setSizes([]);
        setBestseller(false);

        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoader(false);
    }
  };

  return (
    <form
      className="flex flex-col w-full items-start gap-4 p-3 sm:p-6"
      onSubmit={onSubmitHandler}
    >
      {/* IMAGE UPLOAD */}
      <div className="w-full">
        <p className="mb-2 font-semibold">Upload Images</p>

        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((num) => (
            <label key={num} htmlFor={"image" + num} className="cursor-pointer">
              <img
                src={
                  !eval("image" + num)
                    ? assets.upload_area
                    : URL.createObjectURL(eval("image" + num))
                }
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border shadow-sm"
                alt=""
              />
              <input
                type="file"
                hidden
                id={"image" + num}
                onChange={(e) => eval("setImage" + num)(e.target.files[0])}
              />
            </label>
          ))}
        </div>
      </div>

      {/* NAME */}
      <div className="w-full">
        <p className="mb-2 font-semibold">Product Name</p>
        <input
          type="text"
          placeholder="Enter product name"
          required
          className="w-full max-w-[600px] px-3 py-2 border rounded-md shadow-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* DESCRIPTION */}
      <div className="w-full">
        <p className="mb-2 font-semibold">Product Description</p>
        <textarea
          placeholder="Write details..."
          required
          rows={4}
          className="w-full max-w-[600px] px-3 py-2 border rounded-md shadow-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* CATEGORY + PRICE */}
      <div className="flex flex-wrap gap-4 w-full">
        <div className="flex flex-col">
          <p className="mb-2 font-semibold">Category</p>
          <select
            className="px-3 py-2 border rounded-md shadow-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div className="flex flex-col">
          <p className="mb-2 font-semibold">Sub Category</p>
          <select
            className="px-3 py-2 border rounded-md shadow-sm"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>

        <div className="flex flex-col">
          <p className="mb-2 font-semibold">Price</p>
          <input
            type="number"
            placeholder="25"
            className="px-3 py-2 w-28 border rounded-md shadow-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>

      {/* SIZE + STOCK */}
      <div className="w-full mt-2">
        <p className="mb-2 font-semibold">Product Sizes + Stock</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...defaultSizes, ...sizes.map((s) => s.size).filter((sz) => !defaultSizes.includes(sz))].map((size) => {
            const selected = sizes.find((s) => s.size === size);

            return (
              <div
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`p-4 rounded-xl border cursor-pointer transition shadow-sm 
                  ${
                    selected
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-300 bg-white"
                  }
                `}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">{size}</span>

                  {selected && (
                    <span className="text-xs bg-pink-200 px-2 py-1 rounded-md">
                      Selected
                    </span>
                  )}
                </div>

                {selected && (
                  <input
                    type="number"
                    placeholder="Stock"
                    className="mt-3 px-3 py-2 w-full border rounded-md shadow-sm"
                    value={selected.stock}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStockChange(size, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ➕ ADD CUSTOM SIZE */}
        <div className="mt-4 flex gap-3">
          <input
            type="text"
            placeholder="Add custom size (e.g., 3XL)"
            className="px-3 py-2 border rounded-md shadow-sm"
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
          />
          <button
            type="button"
            onClick={addCustomSize}
            className="px-4 py-2 bg-pink-600 text-white rounded-md shadow hover:bg-pink-700 transition"
          >
            Add Size
          </button>
        </div>
      </div>

      {/* BESTSELLER */}
      <div className="flex items-center gap-2 mt-3">
        <input
          type="checkbox"
          id="bestseller"
          checked={bestseller}
          onChange={() => setBestseller((prev) => !prev)}
        />
        <label htmlFor="bestseller" className="cursor-pointer font-medium">
          Add to Bestseller
        </label>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        className="w-36 py-3 mt-4 bg-black text-white rounded-md shadow hover:bg-gray-900 transition"
        disabled={loader}
      >
        {loader ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
};

export default Add;
