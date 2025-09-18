import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { toast } from "react-toastify";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, token } =
    useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [proceedToPayment, setProceedToPayment] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
      setProceedToPayment(tempData.length > 0);
    }
  }, [cartItems, products]);

  // Handle quantity increment
  const incrementQuantity = (itemId, size, currentQuantity) => {
    updateQuantity(itemId, size, currentQuantity + 1);
  };

  // Handle quantity decrement
  const decrementQuantity = (itemId, size, currentQuantity) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, size, currentQuantity - 1);
    } else {
      // If quantity becomes 0, remove item from cart
      updateQuantity(itemId, size, 0);
    }
  };

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>
      <div>
        {cartData.map((item, index) => {
          const productData = products.find(
            (product) => product._id === item._id
          );
          return (
            <div
              key={index}
              className="py-4 border-t text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <div className="flex items-start gap-6">
                <img
                  src={productData.image[0]}
                  alt={productData.name}
                  className="w-16 sm:w-20"
                />
                <div>
                  <p className="text-sm sm:text-lg font-medium">
                    {productData.name}
                  </p>
                  <div className="flex items-center gap-5 mt-2">
                    <p>
                      {currency}
                      {productData.price}
                    </p>
                    <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                      {item.size}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity Controls with Plus/Minus */}
              <div className="flex items-center border border-gray-300 rounded w-fit">
                <button
                  onClick={() => decrementQuantity(item._id, item.size, item.quantity)}
                  className="px-2 sm:px-3 py-1 hover:bg-gray-100 text-lg font-medium border-r border-gray-300"
                  title="Decrease quantity"
                >
                  −
                </button>
                <span className="px-2 sm:px-4 py-1 min-w-[40px] sm:min-w-[50px] text-center text-sm sm:text-base">
                  {item.quantity}
                </span>
                <button
                  onClick={() => incrementQuantity(item._id, item.size, item.quantity)}
                  className="px-2 sm:px-3 py-1 hover:bg-gray-100 text-lg font-medium border-l border-gray-300"
                  title="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Delete Button */}
              <img
                src={assets.bin_icon}
                alt="Remove Item"
                className="w-4 mr-4 cursor-pointer hover:opacity-70"
                onClick={() => updateQuantity(item._id, item.size, 0)}
                title="Remove from cart"
              />
            </div>
          );
        })}
      </div>

      {/* Empty Cart Message */}
      {cartData.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/collection")}
            className="bg-black text-white px-6 py-2 text-sm hover:bg-gray-800"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      )}

      {/* Cart Total and Checkout */}
      {cartData.length > 0 && (
        <div className="flex justify-end my-20">
          <div className="w-full sm:w-[450px]">
            <CartTotal />
            <div className="w-full text-end">
              <button
                className="bg-black text-white text-sm my-8 px-8 py-3 hover:bg-gray-800"
                onClick={() =>
                  !proceedToPayment
                    ? toast.error("Add Items to cart")
                    : navigate("/place-order")
                }
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;