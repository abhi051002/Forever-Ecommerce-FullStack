import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backEndURL, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import StatusModal from "./StatusModal";

const STATUS_FLOW = [
  "Order Placed",
  "Packing",
  "Order Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled", // terminal
];

const TERMINAL_STATUSES = new Set(["Delivered", "Cancelled"]);
const CANCEL_CUTOFF = "Order Shipped";

/* =========================
   Orders Page
========================= */
const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Updating state
  const [updatingId, setUpdatingId] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [modalNewStatus, setModalNewStatus] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const statusRank = useMemo(() => {
    const map = {};
    STATUS_FLOW.forEach((s, i) => (map[s] = i));
    return map;
  }, []);

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${backEndURL}/api/order/list`, {
        headers: { token },
        params: { page, limit: 10, search, status, paymentMethod },
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages || 1);
      } else {
        toast.error(response.data.message || "Failed to load orders");
      }
    } catch (error) {
      toast.error(error.message || "Network error");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentMethod("");
    setPage(1);
    fetchAllOrders();
  };

  const openStatusModal = (order, newStatus) => {
    setModalOrder(order);
    setModalNewStatus(newStatus);
    setModalOpen(true);
  };

  const closeStatusModal = () => {
    setModalOpen(false);
    setModalOrder(null);
    setModalNewStatus("");
  };

  const statusChangeRequested = (e, order) => {
    const newStatus = e.target.value;
    const currentStatus = order.status;

    // Lock if terminal
    if (TERMINAL_STATUSES.has(currentStatus) && newStatus !== currentStatus) {
      toast.error(`Order is ${currentStatus}. No further changes allowed.`);
      return;
    }

    // Prevent backward
    const canMoveForward = statusRank[newStatus] >= statusRank[currentStatus];
    if (!canMoveForward) {
      toast.error(
        `You can’t move back from "${currentStatus}" to "${newStatus}".`
      );
      return;
    }

    // Disallow cancelling at/after cutoff
    if (
      newStatus === "Cancelled" &&
      statusRank[currentStatus] >= statusRank[CANCEL_CUTOFF]
    ) {
      toast.error(`Cannot cancel once order is ${CANCEL_CUTOFF} or later.`);
      return;
    }

    if (newStatus === currentStatus) return;
    openStatusModal(order, newStatus);
  };

  const submitStatusUpdate = async ({ note, meta }) => {
    if (!modalOrder || !modalNewStatus) return;

    try {
      setModalSubmitting(true);
      setUpdatingId(modalOrder._id);

      const payload = {
        orderId: modalOrder._id,
        status: modalNewStatus,
        actorType: "admin",
        // actorId: "<admin-id>", // add if you have admin context
        note,
        meta,
      };

      const response = await axios.post(
        `${backEndURL}/api/order/status`,
        payload,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Status updated");
        closeStatusModal();
        fetchAllOrders();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      toast.error(error.message || "Network error");
    } finally {
      setModalSubmitting(false);
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {STATUS_FLOW.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
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
        {orders.map((order) => {
          const statusRankMap = statusRank;
          const currentRank = statusRankMap[order.status] ?? 0;

          return (
            <div
              key={order._id}
              className="bg-white border rounded-lg shadow p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              {/* ICON */}
              <div className="flex justify-center sm:block">
                <img src={assets.parcel_icon} alt="parcel" className="w-12" />
              </div>

              {/* ITEMS + ADDRESS */}
              <div className="text-sm">
                {order.items.map((item) => (
                  <p key={`${order._id}-${item._id || item.name}-${item.size}`}>
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
              <div className="flex items-center">
                <select
                  className="border px-3 py-2 rounded-md text-sm bg-gray-50 hover:bg-gray-100 cursor-pointer 
  focus:ring-2 focus:ring-blue-300 transition shadow-sm w-full sm:w-auto"
                  value={order.status}
                  onChange={(e) => statusChangeRequested(e, order)}
                  disabled={
                    updatingId === order._id ||
                    TERMINAL_STATUSES.has(order.status)
                  }
                >
                  {STATUS_FLOW.map((s) => {
                    const optRank = statusRank[s];
                    const currentRank = statusRank[order.status];

                    const isBackward = optRank < currentRank;
                    const blockCancelAfterCutoff =
                      s === "Cancelled" &&
                      currentRank >= statusRank[CANCEL_CUTOFF];

                    const disabled = isBackward || blockCancelAfterCutoff; // terminal is handled by disabling the whole select

                    return (
                      <option key={s} value={s} disabled={disabled}>
                        {s}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------- PAGINATION ---------------- */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-300"
        >
          Prev
        </button>

        <span className="px-4 py-2 bg-gray-100 rounded-md shadow">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-300"
        >
          Next
        </button>
      </div>

      {/* Status Modal */}
      <StatusModal
        open={modalOpen}
        onClose={closeStatusModal}
        order={modalOrder}
        newStatus={modalNewStatus}
        loading={modalSubmitting}
        onSubmit={submitStatusUpdate}
      />
    </div>
  );
};

export default Orders;
