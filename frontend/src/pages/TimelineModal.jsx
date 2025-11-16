import axios from "axios";
import React, { useEffect, useState } from "react";

const TimelineModal = ({ open, onClose, orderId, backendUrl, token }) => {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!open || !orderId) return;
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `${backendUrl}/api/order/${orderId}/timeline`,
          { headers: { token } }
        );

        if (res.data.success) {
          // Support both shapes: { timeline: [...] } or { data: { items: [...] } }
          const rows = res.data.timeline ?? res.data.data?.items ?? [];

          // optional: sort oldest -> newest
          rows.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

          setTimeline(rows);
        } else {
          setError(res.data.message || "Failed to load timeline");
        }
      } catch (err) {
        setError(err.message || "Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [open, orderId, backendUrl, token]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Order Tracking{" "}
            <span className="text-gray-500">#{String(orderId).slice(-6)}</span>
          </h3>
          <button
            className="px-3 py-1 text-sm rounded-md border hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {loading && (
            <p className="text-sm text-gray-600">Loading timeline…</p>
          )}
          {!loading && error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && timeline.length === 0 && (
            <p className="text-sm text-gray-600">No updates yet.</p>
          )}

          {!loading && !error && timeline.length > 0 && (
            <ol className="relative border-s border-gray-200">
              {timeline.map((t) => (
                <li key={t._id} className="ms-4 pb-6 last:pb-0">
                  {/* Dot */}
                  {t.status == "Cancelled" ? (
                    <div className="absolute w-3 h-3 bg-red-600 rounded-full mt-1.5 -start-1.5 border border-white"></div>
                  ) : (
                    <div className="absolute w-3 h-3 bg-blue-600 rounded-full mt-1.5 -start-1.5 border border-white"></div>
                  )}
                  {/* Status + time */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h4 className="text-base font-semibold">{t.status}</h4>
                    <time className="text-xs text-gray-500">
                      {new Date(t.createdAt).toLocaleString()}
                    </time>
                  </div>

                  {/* Note */}
                  {t.note && (
                    <p className="mt-1 text-sm text-gray-700">
                      <span className="font-medium">Note:</span> {t.note}
                    </p>
                  )}

                  {/* Logistics */}
                  {(t.meta?.courier || t.meta?.awb || t.meta?.location) && (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      {t.meta?.courier && (
                        <div className="p-2 rounded border bg-gray-50">
                          <span className="block text-gray-500 text-xs">
                            Courier
                          </span>
                          <span className="font-medium">{t.meta.courier}</span>
                        </div>
                      )}
                      {t.meta?.awb && (
                        <div className="p-2 rounded border bg-gray-50 break-all">
                          <span className="block text-gray-500 text-xs">
                            AWB / Tracking
                          </span>
                          <span className="font-medium">{t.meta.awb}</span>
                        </div>
                      )}
                      {t.meta?.location && (
                        <div className="p-2 rounded border bg-gray-50">
                          <span className="block text-gray-500 text-xs">
                            Location
                          </span>
                          <span className="font-medium">{t.meta.location}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actor */}
                  {t.actorType && (
                    <p className="mt-2 text-xs text-gray-500">
                      {t.actorType == "user"
                        ? `Cancelled by you`
                        : `Updated by ${t.actorType}`}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineModal;
