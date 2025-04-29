import React from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const Pagination = ({ page, totalPages, onPageChange, disabled = false }) => {
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !disabled) {
      onPageChange(newPage);
    }
  };



  return (
    <div className="flex items-center justify-center mt-6 gap-1">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1 || disabled}
        className="px-3 py-1 border rounded-lg disabled:opacity-50 group hover:bg-blue-600 flex items-center justify-center w-10 h-10"
      >
        <FaAngleLeft className="text-base group-hover:text-white" />
      </button>

      {/* Always show first page */}
      <button
        onClick={() => handlePageChange(1)}
        disabled={disabled}
        className={`w-10 h-10 flex items-center justify-center border rounded-lg ${
          page === 1 ? "bg-blue-500 text-white" : "hover:bg-gray-100"
        }`}
      >
        1
      </button>

      {/* Show ellipsis if current page is far from start */}
      {page > 3 && <span className="px-2">...</span>}

      {/* Show one page before current page if exists */}
      {page > 2 && (
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={disabled}
          className="w-10 h-10 flex items-center justify-center border rounded-lg hover:bg-gray-100"
        >
          {page - 1}
        </button>
      )}

      {/* Show current page if not first or last */}
      {page > 1 && page < totalPages && (
        <button
          onClick={() => handlePageChange(page)}
          disabled={disabled}
          className="w-10 h-10 flex items-center justify-center border rounded-lg bg-blue-500 text-white"
        >
          {page}
        </button>
      )}

      {/* Show one page after current page if exists */}
      {page < totalPages - 1 && (
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={disabled}
          className="w-10 h-10 flex items-center justify-center border rounded-lg hover:bg-gray-100"
        >
          {page + 1}
        </button>
      )}

      {/* Show ellipsis if current page is far from end */}
      {page < totalPages - 2 && <span className="px-2">...</span>}

      {/* Always show last page if different from first */}
      {totalPages > 1 && (
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={disabled}
          className={`w-10 h-10 flex items-center justify-center border rounded-lg ${
            page === totalPages ? "bg-blue-500 text-white" : "hover:bg-gray-100"
          }`}
        >
          {totalPages}
        </button>
      )}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages || disabled}
        className="px-3 py-1 border rounded-lg disabled:opacity-50 group hover:bg-blue-600 flex items-center justify-center w-10 h-10"
      >
        <FaAngleRight className="text-base group-hover:text-white" />
      </button>
    </div>
  );
};

export default Pagination;
