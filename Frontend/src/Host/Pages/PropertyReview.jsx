import { useState, useEffect } from "react";
import { FaFlag, FaStar } from "react-icons/fa";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import ReviewDescriptionModal from "../Components/ReviewDescriptionModal";
import { HiArrowLeft } from "react-icons/hi2";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"; // Adjust the import path based on your project structure

const PropertyReview = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Added for navigation
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-24 h-24 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl border max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button>Try Again</button>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const { reviewStats = {}, addressId = {}, title } = property;
  const { averageRating = 0, reviews = [], totalReviews = 0 } = reviewStats;

  return (
    <div className="min-h-screen bg-gray-50 py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className=""> 
        <button
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full mb-2 flex gap-1"
          onClick={() => navigate(-1)}
        >
          <HiArrowLeft className="text-2xl text-gray-700" /> Back
        </button>
         
        </div>

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

        {/* Review Table or No Review Message */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 mt-8 text-center">
            <p className="text-gray-500 text-lg">No Review</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left text-gray-700 font-semibold border-b">
                    User
                  </th>
                  <th className="p-4 text-left text-gray-700 font-semibold border-b">
                    Date
                  </th>
                  <th className="p-4 text-left text-gray-700 font-semibold border-b">
                    Rating
                  </th>
                  <th className="p-4 text-left text-gray-700 font-semibold border-b">
                    Title
                  </th>
                  <th className="p-4 text-left text-gray-700 font-semibold border-b">
                    Review
                  </th>
                  <th className="p-4 text-left text-gray-700 font-semibold border-b">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review, index) => {
                  const reviewId = review._id || `review-${index}`;
                  const description = review.reviewText?.trim() || "";
                  const maxPreviewLength = 30;
                  const profileImage = review.userId.profileImage
                    ? `http://localhost:8000/${review.userId.profileImage}`
                    : "/default-profile.jpg";
                  return (
                    <tr key={reviewId} className="hover:bg-gray-50">
                      <td className="p-4 border-b">
                        <div className="flex items-center space-x-2">
                          <img
                            src={profileImage}
                            alt={`${review.userId.firstName} ${review.userId.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = "/default-profile.jpg";
                            }}
                          />
                          <span>
                            {review.userId.firstName} {review.userId.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 border-b text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="p-4 border-b">
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
                      </td>
                      <td className="p-4 border-b text-gray-800">
                        {review.title || "No Title"}
                      </td>
                      <td className="p-4 border-b">
                        <div className="flex flex-col space-y-2">
                          <p className="text-gray-700">
                            {description.length > maxPreviewLength
                              ? `${description.substring(0, 30)}...`
                              : description}
                          </p>
                          {description.length > maxPreviewLength && (
                            <button
                              onClick={() => openModal(review)}
                              className="text-blue-600 hover:text-blue-800 text-sm text-left"
                            >
                              Show more
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 border-b">
                        <button
                          onClick={() => handleReport(reviewId)}
                          className="text-red-500 hover:text-red-600"
                          aria-label="Report this review"
                        >
                          <FaFlag />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* shadcn/ui Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() => handlePagination(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePagination(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return <PaginationEllipsis key={page} />;
                  }
                  return null;
                })}
                <PaginationNext
                  onClick={() => handlePagination(currentPage + 1)}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      <ReviewDescriptionModal isOpen={showModal} onClose={closeModal}>
        {modalReview && (
          <div className="w-full h-full">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                Profile
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {modalReview.userId.firstName} {modalReview.lastName}
                </h3>
                <span className="text-sm text-gray-500">
                  {new Date(modalReview.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{modalReview.title}</h4>
              <p>{modalReview.reviewText}</p>
            </div>
          </div>
        )}
      </ReviewDescriptionModal>
    </div>
  );
};

export default PropertyReview;
