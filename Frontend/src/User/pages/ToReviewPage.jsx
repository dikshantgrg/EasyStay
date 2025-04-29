import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingCard from "../Components/BookingCard";
import axios from "axios";
import { useSelector } from "react-redux";
import { IoMdStar } from "react-icons/io";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"; // Adjust path based on your project structure

const ToReviewPage = () => {
  const [booking, setBooking] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' or 'reviewed'
  const [bookingPagination, setBookingPagination] = useState({
    currentPage: 1,
    limit: 6,
    totalBookings: 0,
    totalPages: 1,
  });
  const [reviewPagination, setReviewPagination] = useState({
    currentPage: 1,
    limit: 6,
    totalReviews: 0,
    totalPages: 1,
  });

  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  const fetchBookings = async (page = 1, limit = 6) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/completed-booking?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const bookingsData = response.data?.bookings || [];
      setBooking(bookingsData);
      setBookingPagination({
        currentPage: response.data.pagination.currentPage,
        limit: response.data.pagination.limit,
        totalBookings: response.data.pagination.totalBookings,
        totalPages: response.data.pagination.totalPages,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
      setBooking([]);
      setLoading(false);
    }
  };

  const fetchUserReviews = async (page = 1, limit = 6) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/user-review?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUserReviews(response.data?.reviews || []);
      setReviewPagination({
        currentPage: response.data.pagination.currentPage,
        limit: response.data.pagination.totalReviews / response.data.pagination.totalPages || limit,
        totalReviews: response.data.pagination.totalReviews,
        totalPages: response.data.pagination.totalPages,
      });
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      setUserReviews([]);
    }
  };

  useEffect(() => {
    fetchBookings(bookingPagination.currentPage, bookingPagination.limit);
    fetchUserReviews(reviewPagination.currentPage, reviewPagination.limit);
  }, [bookingPagination.currentPage, reviewPagination.currentPage]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US");
  };

  const handleBookingPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= bookingPagination.totalPages) {
      setBookingPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleReviewPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= reviewPagination.totalPages) {
      setReviewPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Your Bookings and Reviews
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mt-6 border-b">
          <button
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === "pending"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Reviews
          </button>
          <button
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === "reviewed"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("reviewed")}
          >
            Your Reviews
          </button>
        </div>
      </header>

      {activeTab === "pending" ? (
        // Pending Reviews Section
        booking.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🌄</div>
              <h3 className="text-xl font-medium mb-2">
                No bookings to review found
              </h3>
              <p className="text-slate-600 mb-4">
                Your past adventures will appear here once completed
              </p>
              <button
                onClick={() => navigate("/properties")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore Destinations
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {booking.map((item) => (
                <BookingCard
                  key={item._id}
                  id={item._id}
                  bookingId={item.bookingId}
                  hostId={item.hostId._id}
                  propertyId={item.propertyId._id}
                  title={item.propertyId.title}
                  image={item.propertyId.images[0]}
                  city={item.propertyId.addressId.city}
                  street={item.propertyId.addressId.street}
                  checkIn={formatDate(item.checkIn)}
                  checkOut={formatDate(item.checkOut)}
                  guests={item.totalGuest}
                  status={item.status}
                  price={item.totalPrice.toLocaleString("en-US", {
                    style: "currency",
                    currency: "NPR",
                  })}
                  isReviewPage={true}
                  onRefreshBookings={() =>
                    fetchBookings(bookingPagination.currentPage, bookingPagination.limit)
                  }
                />
              ))}
            </div>

            {/* ShadCN Pagination for Bookings */}
            {bookingPagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handleBookingPageChange(bookingPagination.currentPage - 1)}
                        disabled={bookingPagination.currentPage === 1}
                      />
                    </PaginationItem>
                    {[...Array(bookingPagination.totalPages)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          onClick={() => handleBookingPageChange(index + 1)}
                          isActive={bookingPagination.currentPage === index + 1}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handleBookingPageChange(bookingPagination.currentPage + 1)}
                        disabled={bookingPagination.currentPage === bookingPagination.totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )
      ) : (
        // User Reviews Section
        <>
          <div className="space-y-6">
            {userReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">✍️</div>
                  <h3 className="text-xl font-medium mb-2">
                    You haven't written any reviews yet
                  </h3>
                  <p className="text-slate-600">
                    Share your experiences to help other travelers make better decisions
                  </p>
                </div>
              </div>
            ) : (
              userReviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-lg text-gray-900">
                        {review.propertyId.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <IoMdStar
                          key={index}
                          className={`h-5 w-5 ${
                            index < review.rating
                              ? "text-yellow-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">{review.title}</h4>
                  <p className="text-gray-600">{review.reviewText}</p>
                </div>
              ))
            )}
          </div>

          {/* ShadCN Pagination for Reviews */}
          {reviewPagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handleReviewPageChange(reviewPagination.currentPage - 1)}
                      disabled={reviewPagination.currentPage === 1}
                    />
                  </PaginationItem>
                  {[...Array(reviewPagination.totalPages)].map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => handleReviewPageChange(index + 1)}
                        isActive={reviewPagination.currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handleReviewPageChange(reviewPagination.currentPage + 1)}
                      disabled={reviewPagination.currentPage === reviewPagination.totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ToReviewPage;