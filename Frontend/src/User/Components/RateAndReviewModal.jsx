import { useState, useEffect } from "react";
import { IoMdStar } from "react-icons/io";
import axios from "axios";

const RateAndReviewModal = ({
  onClose,
  id,
  hostId,
  propertyId,
  onReviewSubmitted,
}) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    reviewText: "", // Consistent naming
  });
  const [hover, setHover] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Empty useEffect for now
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (formData.rating === 0) newErrors.rating = "Please select a rating";
    if (!formData.title.trim()) newErrors.title = "Please enter a title";
    if (!formData.reviewText.trim())
      newErrors.reviewText = "Please write a review"; // Match formData key
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const reviewData = {
        ...formData,
        hostId,
        bookingId: id, // Use 'id' as bookingId
        propertyId,
      };

      const response = await axios.post(
        "http://localhost:8000/api/review",
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API response:", response.data);

      setShowSuccess(true);
      setFormData({ rating: 0, title: "", reviewText: "" }); // Match formData key
      setErrors({});
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          "Failed to submit review. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (field === "rating" && value > 0) delete newErrors.rating;
      if (field === "title" && value.trim()) delete newErrors.title;
      if (field === "reviewText" && value.trim()) delete newErrors.reviewText; // Match formData key
      return newErrors;
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Rate & Review
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {!showSuccess ? (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => {
                  const currentRating = index + 1;
                  return (
                    <button
                      type="button"
                      key={currentRating}
                      className={`p-1 transition-all duration-150 ${
                        currentRating <= (hover || formData.rating)
                          ? "text-yellow-400 scale-110"
                          : "text-gray-300 hover:text-yellow-300"
                      }`}
                      onClick={() =>
                        handleInputChange("rating")({
                          target: { value: currentRating },
                        })
                      }
                      onMouseEnter={() => setHover(currentRating)}
                      onMouseLeave={() => setHover(0)}
                      aria-label={`Rate ${currentRating} stars`}
                      disabled={isSubmitting}
                    >
                      <IoMdStar className="w-8 h-8" />
                    </button>
                  );
                })}
              </div>
              {errors.rating && (
                <p className="text-red-500 text-xs mt-1.5">{errors.rating}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reviewTitle"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                id="reviewTitle"
                type="text"
                value={formData.title}
                onChange={handleInputChange("title")}
                className={`w-full px-3 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                  ${errors.title ? "border-red-400" : "border-gray-200"}`}
                placeholder="Summarize your experience"
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reviewText"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Review
              </label>
              <textarea
                id="reviewText"
                value={formData.reviewText} // Match formData key
                onChange={handleInputChange("reviewText")} // Match formData key
                className={`w-full px-3 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400
                  h-28 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                  ${errors.reviewText ? "border-red-400" : "border-gray-200"}`}
                placeholder="Share your thoughts..."
                disabled={isSubmitting}
              />
              {errors.reviewText && (
                <p className="text-red-500 text-xs mt-1.5">
                  {errors.reviewText}
                </p>
              )}
            </div>

            {errors.submit && (
              <p className="text-red-500 text-xs text-center">
                {errors.submit}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        ) : (
          <div className="text-center py-6" aria-live="polite">
            <div className="text-5xl mb-4 animate-pulse">⭐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Review Submitted!
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Thank you for sharing your feedback.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                focus:ring-offset-2 transition-all"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RateAndReviewModal;
