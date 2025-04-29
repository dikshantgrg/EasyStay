import { RxCross1 } from "react-icons/rx";

const ReviewDescriptionModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 w-full h-full bg-black bg-opacity-75  flex items-center justify-center"
      onClick={onClose}
    >
      <div
      className="bg-white rounded-xl p-6 w-11/12 sm:w-3/4 md:w-1/2 max-h-[80vh] overflow-y-auto relative"
        
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-800"
          aria-label="Close modal"
        >
          <RxCross1 />
        </button>

        {/* Modal Content */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default ReviewDescriptionModal;