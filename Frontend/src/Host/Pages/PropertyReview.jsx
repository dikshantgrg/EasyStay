import { useState, useEffect } from "react";
import { FaFlag, FaStar } from "react-icons/fa";
import axios from "axios";
import { useParams } from "react-router-dom";
import ReviewDescriptionModal from "../Components/ReviewDescriptionModal";
import { CgProfile } from "react-icons/cg";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const PropertyReview = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalReview, setModalReview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProperty = async (propertyId, page = 1, limit = 6) => {
    if (!propertyId) {
      setError("No property ID provided");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:8000/api/host/property-review/${propertyId}?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setProperty(response.data.property);

      setTotalPages(response.data.property.reviewStats.totalPages);
    } catch (err) {
      console.error("Error fetching property:", err);
      setError(err.response?.data?.message || "Failed to load property data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty(id, currentPage);
  }, [id, currentPage]);

  const handleReport = (reviewId) => {
    console.log(`Reporting review ${reviewId}`);
  };

  const openModal = (review) => {
    setModalReview(review);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalReview(null);
  };

  const handlePagination = (newPage) => {
    window.scrollTo(0, 0);

    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-24 h-24 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl border max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={() => fetchProperty(id, currentPage)}
            className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const { reviewStats = {}, addressId = {}, title } = property;
  const { averageRating = 0, reviews = [], totalReviews = 0 } = reviewStats;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex gap-8 bg-white rounded-2xl shadow-lg p-8">
          <div className="w-full md:w-1/4 rounded-md overflow-hidden">
            <img
              src={
                `http://localhost:8000/${property.images[0]}` ||
                "/default-property.jpg"
              }
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 break-words">
              {title || "Untitled Property"}
            </h1>
            <p className="text-lg text-gray-600 mt-2 break-words">
              {[addressId.street, addressId.city, addressId.zipCode]
                .filter(Boolean)
                .join(", ") || "Address not available"}
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Guest Reviews
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-6xl font-bold text-blue-600">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < Math.floor(averageRating)
                          ? "text-amber-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <p className="text-gray-500 mt-2">
                  {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, index) => {
            const reviewId = review._id || `review-${index}`;
            const description = review.reviewText?.trim() || "";
            const maxPreviewLength = 30;

            return (
              <div
                key={reviewId}
                className="bg-white rounded-xl shadow-md p-6 w-full break-words overflow-hidden"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full  flex items-center justify-center font-semibold">
                    <CgProfile className="w-12 h-12 rounded-full  " />
                  </div>

                  <div className="space-y-2 w-full">
                    <div className="flex justify-between items-center w-full">
                      <h3 className="text-lg font-semibold">
                        {review.userId.firstName} {review.userId.lastName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < Math.floor(review.rating || 0)
                              ? "text-amber-500"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>

                    <h4 className="font-medium text-gray-800">
                      {review.title || "No Title"}
                    </h4>
                    <div className="flex flex-col space-y-2 w-full">
                      <p className={`text-gray-700 leading-relaxed `}>
                        {description.length > maxPreviewLength
                          ? description
                              .substring(0, 30)
                              .split("\n")
                              .map((line, index) => (
                                <span key={index}>
                                  {line}
                                  ....
                                </span>
                              ))
                          : description}
                      </p>
                      {description.length > maxPreviewLength && (
                        <button
                          onClick={() => openModal(review)}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                        >
                          <span>Show more</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleReport(reviewId)}
                    className="text-red-500 hover:text-red-600 pt-1"
                    aria-label="Report this review"
                  >
                    <FaFlag />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={() => handlePagination(currentPage - 1)}
            className={`
      flex items-center justify-center gap-2 
      bg-blue-500 hover:bg-blue-600 text-white 
      p-3 rounded-lg transition-all duration-300
      disabled:bg-gray-300 disabled:cursor-not-allowed
      disabled:hover:bg-gray-300
    `}
            disabled={currentPage === 1}
          >
            <FiChevronLeft className="w-5 h-5" />
            <span className="sr-only">Previous</span>
          </button>

          <span className="flex items-center h-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-semibold">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePagination(currentPage + 1)}
            className={`
      flex items-center justify-center gap-2 
      bg-blue-500 hover:bg-blue-600 text-white 
      p-3 rounded-lg transition-all duration-300
      disabled:bg-gray-300 disabled:cursor-not-allowed
      disabled:hover:bg-gray-300
    `}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Next</span>
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>

        <ReviewDescriptionModal isOpen={showModal} onClose={closeModal}>
          {modalReview && (
            <div className="space-y-4 w-full h-full">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  Profile
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {" "}
                    {modalReview.userId.firstName} {modalReview.userId.lastName}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(modalReview.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800">
                  {modalReview.title}
                </h4>
                <p>{modalReview.reviewText}</p>
              </div>
            </div>
          )}
        </ReviewDescriptionModal>
      </div>
    </div>
  );
};

export default PropertyReview;
