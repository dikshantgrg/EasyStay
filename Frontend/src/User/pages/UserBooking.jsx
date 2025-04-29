import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingCard from "../Components/BookingCard";
import axios from "axios";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const UserBooking = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  const fetchBookings = async (page = 1) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/user-booking?page=${page}&limit=${pagination.limit}&sortField=status&status=${selectedStatus}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const bookingsData = response.data?.bookings || [];
      setBookings(bookingsData);
      setPagination({
        page: response.data.pagination.page,
        pages: response.data.pagination.pages,
        total: response.data.pagination.total,
        limit: response.data.pagination.limit,
      });
      console.log("Bookings:", response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Your Journeys</h1>
        <p className="text-slate-600 mt-2">
           Your upcoming and past Bookings
        </p>
      </header>

      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setSelectedStatus("upcoming")}
          className={`px-4 py-2 rounded-full border transition-colors ${
            selectedStatus === "upcoming"
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-slate-200 hover:border-slate-300"
          }`}
          aria-label="Show upcoming bookings"
        >
          Upcoming
        </button>
        <button
          onClick={() => setSelectedStatus("active")}
          className={`px-4 py-2 rounded-full border transition-colors ${
            selectedStatus === "active"
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-slate-200 hover:border-slate-300"
          }`}
          aria-label="Show current stay bookings"
        >
          Current Stay
        </button>
        <button
          onClick={() => setSelectedStatus("completed")}
          className={`px-4 py-2 rounded-full border transition-colors ${
            selectedStatus === "completed"
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-slate-200 hover:border-slate-300"
          }`}
          aria-label="Show completed bookings"
        >
          Completed
        </button>
        <button
          onClick={() => setSelectedStatus("cancelled")}
          className={`px-4 py-2 rounded-full border transition-colors ${
            selectedStatus === "cancelled"
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-slate-200 hover:border-slate-300"
          }`}
          aria-label="Show completed bookings"
        >
          Cancelled
        </button>
      </div>

      {bookings.length > 0 ? (
        <>
          {bookings.map((booking) => (
            <BookingCard
              key={booking.bookingId}
              bookingId={booking.bookingId}
              hostId={booking.hostId._id}
              title={booking.propertyId.title}
              image={booking.propertyId.images[0]}
              city={booking.propertyId.addressId.city}
              street={booking.propertyId.addressId.street}
              checkIn={formatDate(booking.checkIn)}
              checkOut={formatDate(booking.checkOut)}
              guests={booking.totalGuest}
              status={booking.status}
              price={booking.totalPrice.toLocaleString("en-US", {
                style: "currency",
                currency: "NPR",
              })}
            />
          ))}
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => fetchBookings(pagination.page - 1)}
                  className={
                    pagination.page === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => fetchBookings(page)}
                      isActive={pagination.page === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => fetchBookings(pagination.page + 1)}
                  className={
                    pagination.page === pagination.pages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🌄</div>
            <h3 className="text-xl font-medium mb-2">
              No {selectedStatus === "upcoming" ? "upcoming" : selectedStatus === "active" ? "current stay" : "completed"} journeys found
            </h3>
            <p className="text-slate-600 mb-4">
              {selectedStatus === "upcoming"
                ? "Start planning your next adventure - the mountains are calling!"
                : "Your past adventures will appear here once completed"}
            </p>
            <button
              onClick={() => navigate("/properties")}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Explore Destinations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBooking;