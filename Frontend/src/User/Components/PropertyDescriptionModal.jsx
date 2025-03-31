import { RxCross1 } from "react-icons/rx"; // Import the close icon
import React from "react";

const PropertyDescriptionModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Don't render anything if the modal is not open

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose} 
    >
      <div
        className="bg-white rounded-xl p-6 w-3/4 md:w-1/2 max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800"
        >
          <RxCross1 />
        </button>

        {/* Modal Content */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default PropertyDescriptionModal;
