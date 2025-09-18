import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, cartItems, updateQuantity } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
        return null;
      }
    });
  };

  useEffect(() => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
        return null;
      }
    });
  }, [productId, products]);

  // Get current quantity for selected size
  const getCurrentQuantity = () => {
    if (!size || !cartItems[productId]) return 0;
    return cartItems[productId][size] || 0;
  };

  // Handle quantity increment
  const incrementQuantity = () => {
    if (!size) {
      toast.error("Please Select a Size");
      return;
    }
    const currentQty = getCurrentQuantity();
    updateQuantity(productId, size, currentQty + 1);
  };

  // Handle quantity decrement
  const decrementQuantity = () => {
    if (!size) {
      toast.error("Please Select a Size");
      return;
    }
    const currentQty = getCurrentQuantity();
    if (currentQty > 0) {
      updateQuantity(productId, size, currentQty - 1);
    }
  };

  // Handle add to cart (for first time addition)
  const handleAddToCart = () => {
    if (!size) {
      toast.error("Please Select a Size");
      return;
    }
    addToCart(productId, size);
  };

  const currentQuantity = getCurrentQuantity();

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product Data */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData?.image.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={productData.name}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                onClick={() => setImage(img)}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img src={image} alt="" className="w-full h-auto" />
          </div>
        </div>
        {/* Product Information */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <img src={assets.star_icon} alt="" className="w-3" />
            <img src={assets.star_icon} alt="" className="w-3" />
            <img src={assets.star_icon} alt="" className="w-3" />
            <img src={assets.star_icon} alt="" className="w-3" />
            <img src={assets.star_dull_icon} alt="" className="w-3" />
            <p className="pl-2">(122)</p>
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  key={index}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? "border-orange-500" : ""
                  }`}
                  onClick={() => setSize(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Display and Controls */}
          {size && currentQuantity > 0 && (
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium">Quantity in cart:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={decrementQuantity}
                  className="px-3 py-1 hover:bg-gray-100 text-lg font-medium"
                  disabled={currentQuantity <= 0}
                >
                  −
                </button>
                <span className="px-4 py-1 border-x border-gray-300 min-w-[50px] text-center">
                  {currentQuantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  className="px-3 py-1 hover:bg-gray-100 text-lg font-medium"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart or Update Quantity */}
          <div className="flex gap-3">
            <button
              className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
              onClick={handleAddToCart}
            >
              {currentQuantity > 0 ? "ADD MORE TO CART" : "ADD TO CART"}
            </button>
          </div>

          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 flex mt-5 flex-col gap-1">
            <p className="">100% Original Products</p>
            <p>Cash On Delivery is available on this products</p>
            <p>Easy Return and Replacement Policy within 7 days</p>
          </div>
        </div>
      </div>
      {/* Description and Review System */}
      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm">Description</b>
          <p className="border px-5 py-3 text-sm">Reviews(122)</p>
        </div>
        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          <p>
            An e-commerce website is an online platform that facilitates the
            buying and selling of products or services over the internet. It
            serves as a virtual marketplace where businesses and individuals can
            showcase their products, interact with customers, and conduct
            transactions without the need for a physical presence. E-commerce
            websites have gained immense popularity due to their convenience,
            accessibility, and the global reach they offer.
          </p>
          <p>
            E-commerce websites typically display products or services along
            with detailed descriptions, images, prices, and any available
            variations (e.g., sizes, colors). Each product usually has its own
            dedicated page with relevant information.
          </p>
        </div>
      </div>

      {/* Display related products */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;