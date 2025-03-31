import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingCard from "../Components/BookingCard";
import axios from "axios";
import { useSelector } from "react-redux";

const ToReviewPage = () => {
  const [booking, setBooking] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user.user);

  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/completed-booking",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const bookingsData = response.data?.bookings || [];
      setBooking(bookingsData);
      console.log("Bookings data:", bookingsData);

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

  useEffect(() => {
    let mounted = true;
    fetchBookings();
    return () => {
      mounted = false;
    };
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 ">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Your Bookings to Review
        </h1>
      </header>

      {booking.length === 0 ? (
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
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Explore Destinations
            </button>
          </div>
        </div>
      ) : (
        booking.map((item) => (
          console.log("Item:", item._id),
          <BookingCard
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
            onRefreshBookings={fetchBookings}
          />
        ))
      )}
    </div>
  );
};

export default ToReviewPage;
