import React from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';

const ConfirmDeleteModal = ({ open, onClose, onConfirm, product, loading }) => {
    const dlgRef = useRef(null);
  
    // Close on outside click
    useEffect(() => {
      if (!open) return;
      const onClick = (e) => {
        if (dlgRef.current && !dlgRef.current.contains(e.target)) onClose();
      };
      const onKey = (e) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onClick);
        document.removeEventListener("keydown", onKey);
      };
    }, [open, onClose]);
  
    if (!open) return null;
  
    return (
      <div
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
        role="dialog"
        aria-modal="true"
      >
        <div
          ref={dlgRef}
          className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="px-5 py-4 border-b">
            <h3 className="text-lg font-semibold">Delete product?</h3>
            <p className="text-sm text-gray-500 mt-1">
              {product?.name ? (
                <>
                  You’re about to delete <span className="font-medium">{product.name}</span>.
                </>
              ) : (
                "You’re about to delete this product."
              )}
            </p>
          </div>
  
          <div className="p-5 space-y-3 text-sm text-gray-700">
            <p>This action can’t be undone.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Product will be removed from the catalog.</li>
              <li>Existing orders will still keep their line items.</li>
            </ul>
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
              className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  };

export default ConfirmDeleteModal
