import React, { useEffect, useState } from "react";
import axios from "axios";
import { backEndURL, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [statusDisabled,setStatusDisabled] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${backEndURL}/api/order/list`, {
        headers: { token },
        params: {
          page,
          limit: 10,
          search,
          status,
          paymentMethod,
        },
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentMethod("");
    setPage(1);
    fetchAllOrders();
  };

  const statusHandler = async (e, orderId) => {
    setStatusDisabled(true);
    try {
      const response = await axios.post(
        backEndURL + "/api/order/status",
        { orderId, status: e.target.value },
        { headers: { token } }
      );

      if (response.data.success) {
        fetchAllOrders();
        toast.success("Status Updated");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    finally{
      setStatusDisabled(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token, page]);

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">Orders</h3>

      {/* ---------------- FILTERS ---------------- */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded-md w-full"
          />

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded-md w-full"
          >
            <option value="">All Status</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Packing">Packing</option>
            <option value="Order Shipped">Order Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Payment Method */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="border p-2 rounded-md w-full"
          >
            <option value="">All Payments</option>
            <option value="COD">COD</option>
            <option value="Stripe">Stripe</option>
            <option value="Razorpay">Razorpay</option>
          </select>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setPage(1);
                fetchAllOrders();
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Apply
            </button>

            <button
              onClick={clearFilters}
              className="w-full bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- ORDER LIST ---------------- */}
      <div className="space-y-4">
        {orders.map((order, index) => (
          <div
            key={index}
            className="bg-white border rounded-lg shadow p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {/* ICON */}
            <div className="flex justify-center sm:block">
              <img src={assets.parcel_icon} className="w-12" />
            </div>

            {/* ITEMS */}
            <div className="text-sm">
              {order.items.map((item, i) => (
                <p key={i}>
                  {item.name} x {item.quantity} ({item.size})
                </p>
              ))}

              <p className="mt-3 font-medium text-gray-800">
                {order.address.firstName} {order.address.lastName}
              </p>

              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.state},{" "}
                {order.address.country} - {order.address.zipCode}
              </p>
              <p>{order.address.phone}</p>
            </div>

            {/* PAYMENT INFO */}
            <div className="text-sm">
              <p>Items: {order.items.length}</p>
              <p>Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? "Done" : "Pending"}</p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>

            {/* AMOUNT */}
            <div className="text-lg font-semibold flex items-center">
              {currency}
              {order.amount}
            </div>

            {/* STATUS UPDATE */}
            <select
              className="border px-3 py-2 rounded-md text-sm bg-gray-50 hover:bg-gray-100 cursor-pointer 
             focus:ring-2 focus:ring-blue-300 transition shadow-sm w-full sm:w-auto"
              value={order.status}
              onChange={(e) => statusHandler(e, order._id)}
              disabled={statusDisabled}
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

      {/* ---------------- PAGINATION ---------------- */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-300"
        >
          Prev
        </button>

        <span className="px-4 py-2 bg-gray-100 rounded-md shadow">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Orders;
