import React, { useEffect, useState } from "react";

const COMMON_REASONS = [
  "Ordered by mistake",
  "Found a better price",
  "Delivery time is too long",
  "Need to change address",
  "Change of mind",
  "Other",
];

const CancelReasonModal = ({
  open,
  onClose,
  onSubmit,      // (reasonText) => Promise<void>
  loading = false,
  orderId,
}) => {
  const [selected, setSelected] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    if (open) {
      setSelected(COMMON_REASONS[0]);
      setCustomReason("");
    }
  }, [open]);

  if (!open) return null;

  const isOther = selected === "Other";
  const canSubmit = !loading && (isOther ? customReason.trim().length > 0 : true);

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Cancel Order</h3>
          <p className="text-xs text-gray-500 mt-1">Order #{String(orderId).slice(-6)}</p>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-700">
            Please select a reason for cancellation. This helps us improve your experience.
          </p>

          <div className="grid grid-cols-1 gap-2">
            {COMMON_REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-3 border rounded-md p-3 cursor-pointer hover:bg-gray-50 ${
                  selected === r ? "border-blue-500" : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="cancel-reason"
                  className="h-4 w-4"
                  checked={selected === r}
                  onChange={() => setSelected(r)}
                />
                <span className="text-sm">{r}</span>
              </label>
            ))}
          </div>

          {isOther && (
            <div>
              <label className="block text-sm font-medium mb-1">Tell us more</label>
              <textarea
                className="w-full border rounded-md p-2 text-sm"
                rows={4}
                placeholder="Write your reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 1 character.</p>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            className="px-5 py-2 rounded-md border hover:bg-gray-50"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
          <button
            className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            disabled={!canSubmit}
            onClick={() => onSubmit(isOther ? customReason.trim() : selected)}
          >
            {loading ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelReasonModal;
