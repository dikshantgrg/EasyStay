import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import Pagination from "./Pagination";
import ConfirmationModal from "./ConfirmationModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const AllReview = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minRatingFilter, setMinRatingFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt"); // Default sort by createdAt
  const [sortOrder, setSortOrder] = useState("desc"); // Default descending
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/admin/property-review",
        {
          params: {
            searchTerm: searchTerm.trim() || undefined,
            minRating: minRatingFilter || undefined,
            sortBy,
            sortOrder,
            page,
            pageSize,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);
      const {
        reviews,
        total,
        page: currentPage,
        pageSize: responsePageSize,
      } = response.data;
      setReviews(reviews);
      setTotal(total);
      setPage(currentPage);
      setPageSize(responsePageSize);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews. Please try again.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, minRatingFilter, sortBy, sortOrder, page, pageSize]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleRatingChange = (e) => {
    setMinRatingFilter(e.target.value);
    setPage(1);
  };

  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    setPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleOpenModal = (id) => {
    setItemIdToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:8000/api/admin/delete-review/${itemIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Review deleted successfully!");
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review._id !== itemIdToDelete)
      );
      setTotal((prevTotal) => prevTotal - 1);
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
      setItemIdToDelete(null);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setItemIdToDelete(null);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="ml-64 w-[calc(100%-16rem)] p-6 bg-gray-100 min-h-screen">
      <div className="w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Review Management
          </h1>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search Reviews
                </label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by review ID, user ID, or property title..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                </div>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Rating Filter */}
                <div>
                  <label
                    htmlFor="rating"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Minimum Rating
                  </label>
                  <select
                    id="rating"
                    value={minRatingFilter}
                    onChange={handleRatingChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Ratings</option>
                    <option value="1">1+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="sortBy"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Sort By
                      </label>
                      <select
                        id="sortBy"
                        value={sortBy}
                        onChange={handleSortByChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="createdAt">Created At</option>
                        <option value="rating">Rating</option>
                        <option value="title">Title</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="sortOrder"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Sort Order
                      </label>
                      <select
                        id="sortOrder"
                        value={sortOrder}
                        onChange={handleSortOrderChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>
                  </div>
                </div>

             
              
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                  Review ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Sender
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  User ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Property
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Rating
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Comment
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  View
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Created at
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-24 text-center text-gray-500"
                  >
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <tr
                    key={review._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {review.reviewId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {review.user || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {review.userId || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900 truncate max-w-[200px]" title={review.propertyTitle}>
                          {review.propertyTitle || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {review.propertyId || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          review.rating >= 4
                            ? "border-green-300 bg-green-100 text-green-700"
                            : review.rating >= 2
                            ? "border-yellow-300 bg-yellow-100 text-yellow-700"
                            : "border-red-300 bg-red-100 text-red-700"
                        }`}
                      >
                        {review.rating} ★
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      <div className="text-sm text-gray-600">
                        {review.reviewText || "No comment"}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      <div className="text-sm text-gray-600">
                        {new Date(review.createdAt).toISOString().split('T')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className=" text-sm font-medium  text-blue-700 hover:underline"
                        onClick={() => navigate(`/review/${review._id}`)}
                      >
                        View
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className=" text-sm font-medium text-red-700 hover:underline"
                        onClick={() => handleOpenModal(review._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-24 text-center text-gray-500"
                  >
                    No reviews found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disabled={loading}
            />
            <div className="text-sm text-gray-700">
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="w-32 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={isModalOpen}
          message="Are you sure you want to delete this review?"
          onConfirm={handleDelete}
          onCancel={handleCancel}
          isDeleting={isDeleting}
        />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default AllReview;
