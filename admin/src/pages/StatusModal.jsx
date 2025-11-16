import React from "react";
import { useEffect } from "react";
import { useState } from "react";

const StatusModal = ({
  open,
  onClose,
  order,
  newStatus,
  onSubmit,
  loading,
}) => {
  const needsLogistics =
    newStatus === "Order Shipped" || newStatus === "Out for Delivery";

  const [note, setNote] = useState("");
  const [courier, setCourier] = useState("");
  const [awb, setAwb] = useState("");
  const [location, setLocation] = useState("");

  // Reset fields every time a different status/modal opens
  useEffect(() => {
    if (open) {
      setNote("");
      setCourier("");
      setAwb("");
      setLocation("");
    }
  }, [open, newStatus]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">
            Update Status: <span className="text-blue-600">{newStatus}</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Order #{order?._id?.slice(-6)} — {order?.address?.firstName}{" "}
            {order?.address?.lastName}
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Note (optional)
            </label>
            <textarea
              className="w-full border rounded-md p-2 text-sm"
              rows={3}
              placeholder="Add a short note for the timeline"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {needsLogistics && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Courier <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border rounded-md p-2 text-sm"
                    placeholder="Delhivery / Bluedart / DTDC..."
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    AWB / Tracking No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border rounded-md p-2 text-sm"
                    placeholder="e.g. DLV123456789"
                    value={awb}
                    onChange={(e) => setAwb(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Location / Hub (optional)
                </label>
                <input
                  className="w-full border rounded-md p-2 text-sm"
                  placeholder="Bhubaneswar Hub"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            className="px-5 py-2 rounded-md border hover:bg-gray-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={() =>
              onSubmit({
                note: note?.trim() || undefined,
                meta: needsLogistics
                  ? {
                      courier: courier?.trim() || undefined,
                      awb: awb?.trim() || undefined,
                      location: location?.trim() || undefined,
                    }
                  : undefined,
              })
            }
            disabled={
              loading || (needsLogistics && (!courier.trim() || !awb.trim()))
            }
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
