import React, { useState, useEffect } from "react";

const GovtIDViewer = ({ govtId }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle body overflow and Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!govtId || !govtId.front) {
    return <span className="text-gray-500">No ID available</span>;
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium">View ID</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Government ID</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Image Content */}
            <div className="p-4 sm:p-6">
              <div className={`grid gap-4 ${govtId.back ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Front Image */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Front side</p>
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={`http://localhost:8000/${govtId.front}`}
                      alt="Government ID Front"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/img/image-error.svg';
                      }}
                    />
                  </div>
                </div>

                {/* Back Image */}
                {govtId.back ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Back side</p>
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                      <img
                        src={`http://localhost:8000/${govtId.back}`}
                        alt="Government ID Back"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/img/image-error.svg';
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No back side available
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GovtIDViewer;