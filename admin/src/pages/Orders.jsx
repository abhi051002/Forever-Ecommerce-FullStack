import React from "react";
import axios from "axios";
import { backEndURL, currency } from "../App";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }
    try {
      const response = await axios.post(
        backEndURL + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        console.eroor(response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.eroor(error);
      toast.error(error.message);
    }
  };

  const statusHandler = async (e, orderId) => {
    try {
      const response = await axios.post(
        backEndURL + "/api/order/status",
        { orderId, status: e.target.value },
        { headers: { token } }
      );

      if (response.data.success) {
        await fetchAllOrders();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {orders.map((order, index) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border border-gray-200 p-5 md:p-8 md:my-4 text-xs sm:text-sm text-gray-700"
            key={index}
          >
            <img src={assets.parcel_icon} alt="" className="w-12 " />
            <div>
              <div>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return (
                      <p className="py-0.5" key={index}>
                        {item.name} X {item.quantity} <span>{item.size}</span>
                      </p>
                    );
                  } else {
                    return (
                      <p className="py-0.5" key={index}>
                        {item.name} X {item.quantity} <span>{item.size},</span>
                      </p>
                    );
                  }
                })}
              </div>
              <p className="mt-3 mb-2 font-medium">
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <div>
                <p>{order.address.street + ","}</p>
                <p>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.country +
                    ", " +
                    order.address.zipCode}
                </p>
              </div>
              <p className="text-sm sm:text-[15px]">{order.address.phone}</p>
            </div>
            <div>
              <p className="text-sm sm:text-[15px]">
                Items : {order.items.length}
              </p>
              <p className="mt-3">Method : {order.paymentMethod}</p>
              <p>Payment : {order.payment ? "Done" : "Pending"}</p>
              <p>Date : {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <p>
              {currency}
              {order.amount}
            </p>
            <select
              className="p-2 font-semibold"
              value={order.status}
              onChange={(e) => statusHandler(e, order._id)}
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Order Shipped">Order Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
