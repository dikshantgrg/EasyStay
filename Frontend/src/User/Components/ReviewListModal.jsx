import { IoMdStar } from "react-icons/io";




const ReviewListModal = ({ isOpen, onClose, reviews }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Reviews</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="border-b pb-4 last:border-b-0"
            >
              <div className="flex items-start gap-4 mb-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {review.userName?.charAt(0) || "G"}
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">
                      {review.userName || "Guest"}
                    </span>
                    <span className="text-gray-400 text-xs">•</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <IoMdStar
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{review.title}</h3>
              <p className="text-gray-600 leading-relaxed">{review.reviewText}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewListModal;