import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { products, currency, addToCart, cartItems, updateQuantity } =
    useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  // Total stock of all sizes (safe against bad data)
  const totalStock = useMemo(() => {
    if (!productData?.sizes || !Array.isArray(productData.sizes)) return 0;
    return productData.sizes.reduce((sum, s) => sum + Number(s?.stock || 0), 0);
  }, [productData]);

  useEffect(() => {
    const found = products.find((item) => item._id === productId);
    if (found) {
      setProductData(found);
      setImage(found.image?.[0] || "");
    }
  }, [productId, products]);

  // Current quantity for selected size in cart
  const getCurrentQuantity = () => {
    if (!size || !cartItems?.[productId]) return 0;
    return Number(cartItems[productId][size] || 0);
  };

  // Stock for selected size
  const getSizeStock = () => {
    if (!size || !productData?.sizes) return 0;

    // Your sizes can be { size: "S", stock: n } or old formats;
    // find the string value (size) and read its stock.
    const obj = productData.sizes.find((s) => {
      const val = Object.values(s).find((v) => typeof v === "string");
      return val === size;
    });

    return Number(obj?.stock || 0);
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

  // Add to cart should not auto-navigate now
  const handleAddToCart = () => {
    if (!size) return toast.error("Please select a size");

    const stock = getSizeStock();
    const currentQty = getCurrentQuantity();

    if (stock === 0) return toast.error(`Size ${size} is out of stock`);
    if (currentQty >= stock)
      return toast.error(`You already added max ${stock} items`);

    addToCart(productId, size);
  };

  // Show "Go to Cart" if any item exists in cart (any product/size)
  const hasAnyCartItem = useMemo(() => {
    if (!cartItems) return false;
    return Object.values(cartItems).some(
      (sizesObj) =>
        sizesObj && Object.values(sizesObj).some((qty) => Number(qty) > 0)
    );
  }, [cartItems]);

  const currentQuantity = getCurrentQuantity();
  const selectedStock = getSizeStock();

  if (!productData) return <div />;

  return (
    <div className="border-t-2 pt-6 sm:pt-10">
      {/* -------- Product Layout -------- */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
        {/* Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[420px] pr-1">
            {(productData.image || []).map((img, i) => (
              <img
                key={`thumb-${i}`}
                src={img}
                alt={`product-thumb-${i + 1}`}
                onClick={() => setImage(img)}
                className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded cursor-pointer border hover:opacity-90 flex-shrink-0"
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="w-full sm:w-[80%]">
            <img
              src={image || productData.image?.[0]}
              alt="product-main"
              className="w-full h-auto rounded border object-cover"
            />
          </div>
        </div>

        {/* -------- Product Info -------- */}
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-medium">
            {productData.name}
          </h1>

          {/* PRICE */}
          <p className="mt-4 text-2xl sm:text-3xl font-medium">
            {currency}
            {productData.price}
          </p>

          {/* Total Stock Display */}
          <p
            className={[
              "mt-2 font-medium",
              totalStock === 0
                ? "text-gray-500"
                : totalStock <= 5
                ? "text-red-600"
                : "text-green-600",
            ].join(" ")}
          >
            {totalStock === 0
              ? "Out of Stock"
              : `Total Stock Available: ${totalStock}`}
          </p>

          <p className="mt-4 text-gray-600 md:w-4/5">
            {productData.description}
          </p>

          {/* ---------- SELECT SIZE ---------- */}
          <div className="flex flex-col gap-3 my-6">
            <p className="font-medium">Select Size</p>

            <div className="flex flex-wrap gap-2">
              {(productData.sizes || []).map((item, index) => {
                const sizeValue = Object.values(item).find(
                  (v) => typeof v === "string"
                );
                const stock = Number(item.stock || 0);
                const isSelected = sizeValue === size;

                return (
                  <button
                    key={`size-${sizeValue || index}`}
                    type="button"
                    disabled={stock === 0}
                    onClick={() => stock > 0 && setSize(sizeValue)}
                    className={[
                      "border px-4 py-2 rounded bg-gray-100 transition",
                      isSelected ? "border-orange-500 ring-1 ring-orange-400" : "",
                      stock === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200",
                    ].join(" ")}
                    aria-pressed={isSelected}
                  >
                    {sizeValue} {stock === 0 && "(Out of Stock)"}
                  </button>
                );
              })}
            </div>

            {/* Show stock for selected size */}
            {size && (
              <p className="text-sm text-blue-600 font-medium">
                Available stock for size {size}: {selectedStock}
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
                  aria-label="decrease quantity"
                >
                  −
                </button>

                <span className="px-4 py-1 border-x min-w-[50px] text-center">
                  {currentQuantity}
                </span>

                <button
                  onClick={incrementQuantity}
                  className="px-3 py-1 text-lg"
                  aria-label="increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* -------- Add to Cart + Go to Cart -------- */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className="bg-black text-white px-8 py-3 text-sm rounded w-full sm:w-auto"
              onClick={handleAddToCart}
            >
              ADD TO CART
            </button>

            {hasAnyCartItem && (
              <button
                type="button"
                className="border px-8 py-3 text-sm rounded w-full sm:w-auto"
                onClick={() => navigate("/cart")}
              >
                GO TO CART
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-10">
        <RelatedProducts
          category={productData.category}
          subCategory={productData.subCategory}
        />
      </div>
    </div>
  );
};

export default Product;
