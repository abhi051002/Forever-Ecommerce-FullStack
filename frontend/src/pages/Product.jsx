import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, cartItems, updateQuantity } =
    useContext(ShopContext);

  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  // NEW → total stock of all sizes
  const totalStock = productData
    ? productData.sizes.reduce((sum, s) => sum + s.stock, 0)
    : 0;

  useEffect(() => {
    const found = products.find((item) => item._id === productId);
    if (found) {
      setProductData(found);
      setImage(found.image[0]);
    }
  }, [productId, products]);

  const getCurrentQuantity = () => {
    if (!size || !cartItems[productId]) return 0;
    return cartItems[productId][size] || 0;
  };

  const getSizeStock = () => {
    if (!size) return 0;
    const obj = productData.sizes.find((s) => {
      const val = Object.values(s).find((v) => typeof v === "string");
      return val === size;
    });
    return obj?.stock || 0;
  };

  const incrementQuantity = () => {
    if (!size) return toast.error("Please select a size");

    const stock = getSizeStock();
    const currentQty = getCurrentQuantity();

    if (currentQty >= stock) {
      return toast.error(`Only ${stock} items available`);
    }

    updateQuantity(productId, size, currentQty + 1);
  };

  const decrementQuantity = () => {
    if (!size) return toast.error("Please select a size");

    const currentQty = getCurrentQuantity();

    if (currentQty > 0) {
      updateQuantity(productId, size, currentQty - 1);
    }
  };

  const handleAddToCart = () => {
    if (!size) return toast.error("Please select a size");

    const stock = getSizeStock();
    const currentQty = getCurrentQuantity();

    if (stock === 0) return toast.error(`Size ${size} is out of stock`);

    if (currentQty >= stock)
      return toast.error(`You already added max ${stock} items`);

    addToCart(productId, size);
  };

  const currentQuantity = getCurrentQuantity();
  const selectedStock = getSizeStock(); // NEW

  return productData ? (
    <div className="border-t-2 pt-10">

      {/* -------- Product Layout -------- */}
      <div className="flex gap-12 flex-col sm:flex-row">

        {/* Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll">
            {productData.image.map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-[24%] sm:w-full cursor-pointer"
                onClick={() => setImage(img)}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img src={image} className="w-full h-auto" />
          </div>
        </div>

        {/* -------- Product Info -------- */}
        <div className="flex-1">

          <h1 className="text-2xl font-medium">{productData.name}</h1>

          {/* PRICE */}
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>

          {/* NEW → Total Stock Display */}
          <p
            className={`
                mt-2 font-medium
                ${totalStock === 0
                  ? "text-gray-500"
                  : totalStock <= 5
                    ? "text-red-600"
                    : "text-green-600"}
            `}
          >
            {totalStock === 0
              ? "Out of Stock"
              : `Total Stock Available: ${totalStock}`}
          </p>

          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>

          {/* ---------- SELECT SIZE ---------- */}
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>

            <div className="flex gap-2">
              {productData.sizes.map((item, index) => {
                const sizeValue = Object.values(item).find(
                  (v) => typeof v === "string"
                );
                const stock = item.stock;

                return (
                  <button
                    key={index}
                    disabled={stock === 0}
                    className={`border px-4 py-2 bg-gray-100 
                      ${sizeValue === size ? "border-orange-500" : ""}
                      ${stock === 0 ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                    onClick={() => stock > 0 && setSize(sizeValue)}
                  >
                    {sizeValue} {stock === 0 && "(Out of Stock)"}
                  </button>
                );
              })}
            </div>

            {/* NEW → SHOW STOCK FOR SELECTED SIZE */}
            {size && (
              <p className="text-sm text-blue-600 font-medium">
                Available Stock for size {size}: {selectedStock}
              </p>
            )}

          </div>

          {/* --------- Quantity Controls --------- */}
          {size && currentQuantity > 0 && (
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium">Quantity in cart:</span>

              <div className="flex items-center border rounded">
                <button
                  onClick={decrementQuantity}
                  className="px-3 py-1 text-lg"
                >
                  −
                </button>

                <span className="px-4 py-1 border-x min-w-[50px] text-center">
                  {currentQuantity}
                </span>

                <button
                  onClick={incrementQuantity}
                  className="px-3 py-1 text-lg"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* -------- Add to Cart -------- */}
          <button
            className="bg-black text-white px-8 py-3 text-sm"
            onClick={handleAddToCart}
          >
            {currentQuantity > 0 ? "ADD MORE TO CART" : "ADD TO CART"}
          </button>

        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div></div>
  );
};

export default Product;
