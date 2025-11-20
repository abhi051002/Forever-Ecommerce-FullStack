import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { toast } from "react-toastify";
import axios from "axios";
import TimelineModal from "./TimelineModal";
import { PackageSearch } from "lucide-react";
import CancelReasonModal from "./CancelReasonModal";

const STATUS_FLOW = ["Order Placed", "Packing", "Order Shipped", "Out for Delivery", "Delivered", "Cancelled"];
const statusRank = STATUS_FLOW.reduce((a, s, i) => ((a[s] = i), a), {});

const Orders = () => {
  const { currency, backendUrl, token, navigate } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);

  // Track modal
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState(null);

  // Cancel modal
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null); // loading only during API call

  // local image for empty state (uploaded file path)
  const emptyImg = "/mnt/data/C2693E22-33F8-49AE-A8D1-7AED63C3C7B6.jpeg";

  const loadOrderData = async () => {
    try {
      if (!token) return null;

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        const allItems = [];
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            allItems.push({
              ...item,
              orderId: order._id,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
            });
          });
        });
        setOrderData(allItems);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]); // eslint-disable-line

  const isCancelable = (status) =>
    statusRank[status] < statusRank["Order Shipped"]; // Only before "Order Shipped"

  const openTrack = (orderId) => {
    setTrackOrderId(orderId);
    setTrackOpen(true);
  };

  const openCancelModal = (orderId, status) => {
    if (!isCancelable(status)) return toast.error("This order can no longer be cancelled.");
    setCancelOrderId(orderId);
    setCancelOpen(true);
  };

  const submitCancel = async (reasonText) => {
    if (!cancelOrderId) return;
    try {
      setCancellingId(cancelOrderId);
      const res = await axios.post(
        `${backendUrl}/api/order/user-status`,
        {
          orderId: cancelOrderId,
          status: "Cancelled",
          actorType: "user",
          note: reasonText || undefined,
        },
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Order cancelled");
        setCancelOpen(false);
        setCancelOrderId(null);
        await loadOrderData();
      } else {
        toast.error(res.data.message || "Failed to cancel order");
      }
    } catch (err) {
      toast.error(err.message || "Network error");
    } finally {
      setCancellingId(null);
    }
  };

  const goToCollection = () => {
    // prefer context navigator if available, fallback to window location
    if (typeof navigate === "function") {
      navigate("/collection");
    } else {
      window.location.href = "/collection";
    }
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {/* Empty state */}
      {orderData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
          <PackageSearch size={70} className="text-gray-400" />
          <h3 className="text-lg font-medium">No orders yet</h3>
          <p className="text-sm text-gray-600 max-w-xs">
            You haven't placed any orders. Browse our collection and find something you love.
          </p>
          <button
            onClick={goToCollection}
            className="mt-2 px-6 py-2 rounded-md border font-medium hover:bg-gray-100"
          >
            Go to Collection
          </button>
        </div>
      ) : (
        <div>
          {orderData.map((item, index) => (
            <div
              key={`${item.orderId}-${item._id || index}-${item.size}`}
              className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer hover:bg-gray-50"
              onClick={() => openTrack(item.orderId)}
            >
              <div className="flex items-start gap-6 text-sm">
                <img src={item.image[0]} className="w-16 sm:w-20 rounded" alt={item.name} />
                <div>
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-base text-gray-700">
                    <p>
                      {currency}
                      {item.price}
                    </p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className="mt-1">
                    Date:{" "}
                    <span className="text-gray-500">
                      {new Date(item.date).toDateString()}
                    </span>
                  </p>
                  <p className="mt-1">
                    Payment:{" "}
                    <span className="text-gray-500">{item.paymentMethod}</span>
                  </p>
                </div>
              </div>

              <div className="md:w-1/2 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      item.status === "Cancelled"
                        ? "bg-red-500"
                        : item.status === "Delivered"
                        ? "bg-green-700"
                        : item.status === "Packing" || item.status === "Order Shipped"
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                  />
                  <p className="text-sm md:text-base">{item.status}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="border px-4 py-2 text-sm font-medium rounded-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTrack(item.orderId);
                    }}
                  >
                    Track Order
                  </button>

                  {isCancelable(item.status) && (
                    <button
                      className="border px-4 py-2 text-sm font-medium rounded-sm bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-60"
                      disabled={cancellingId === item.orderId}
                      onClick={(e) => {
                        e.stopPropagation();
                        openCancelModal(item.orderId, item.status);
                      }}
                    >
                      {cancellingId === item.orderId ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline Modal */}
      <TimelineModal
        open={trackOpen}
        onClose={() => setTrackOpen(false)}
        orderId={trackOrderId}
        backendUrl={backendUrl}
        token={token}
      />

      {/* Cancel Reason Modal */}
      <CancelReasonModal
        open={cancelOpen}
        onClose={() => {
          if (!cancellingId) {
            setCancelOpen(false);
            setCancelOrderId(null);
          }
        }}
        orderId={cancelOrderId}
        loading={Boolean(cancellingId)}
        onSubmit={submitCancel}
      />
    </div>
  );
};

export default Orders;
