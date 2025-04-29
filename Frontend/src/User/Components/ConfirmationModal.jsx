import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const ConfirmationModal = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  title = "Confirm Action",
  isDeleting = false, // New: Accept isDeleting prop
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-6 flex-grow">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto">
              <FaExclamationTriangle
                className="w-6 h-6 text-red-600"
                aria-hidden="true"
              />
            </div>
            <h3
              id="modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            aria-label="Cancel action"
            disabled={isDeleting} // Disable during deletion
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Confirm action"
            disabled={isDeleting} // Disable during deletion
          >
            {isDeleting ? "Deleting..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
