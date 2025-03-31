import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingCard from "../Components/BookingCard";
import axios from "axios";


const UserBooking = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/user-booking",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const bookingsData = response.data?.bookings || [];
      setBookings(bookingsData);

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
  }, []);

  const statusConfig = {
    upcoming: { label: "Upcoming" },
    active: { label: "Current Stay" },
    completed: { label: "Completed" },
   
  };
console.log(bookings);

  const StatusFilter = () => (
    <div className="flex flex-wrap gap-3 mb-8">
      {Object.entries(statusConfig).map(([key, { label }]) => (
        <button
          key={key}
          onClick={() => setSelectedFilter(key)}
          className={`px-4 py-2 rounded-full border transition-colors ${
            selectedFilter === key
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-slate-200 hover:border-slate-300"
          }`}
          aria-label={`Show ${label.toLowerCase()} bookings`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredBookings = bookings.filter(b => b.status === selectedFilter);

 

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Your Journeys</h1>
        <p className="text-slate-600 mt-2">
          Manage your upcoming and past reservations
        </p>
      </header>

      <StatusFilter />

      {filteredBookings.length > 0 ? (
        filteredBookings.map((booking) => (
          <BookingCard
            bookingId={booking.bookingId}
            hostId={booking.hostId._id}
            title={booking.propertyId.title}
            image={booking.propertyId.images[0]} // Show first image
            city={booking.propertyId.addressId.city}
            street={booking.propertyId.addressId.street}
            checkIn={formatDate(booking.checkIn)}
            checkOut={formatDate(booking.checkOut)}
            guests={booking.totalGuest}
            status={booking.status}
            price={booking.totalPrice.toLocaleString('en-US', {
              style: 'currency',
              currency: 'NPR'
            })}
          
          />
        ))
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🌄</div>
            <h3 className="text-xl font-medium mb-2">
              No {statusConfig[selectedFilter].label.toLowerCase()} journeys found
            </h3>
            <p className="text-slate-600 mb-4">
              {selectedFilter === "upcoming"
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