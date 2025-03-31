import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaMapMarkedAlt } from "react-icons/fa";
import { HiArrowLeft } from "react-icons/hi2";
import {
  FiCalendar,
  FiUser,
  FiHome,
  FiDollarSign,
  FiMessageSquare,
  FiMapPin,
} from "react-icons/fi";
import axios from "axios";
import { use } from "react";

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const response = await axios.get(
        `http://localhost:8000/api/booking/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setBooking(response.data.booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching (success or fail)
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  console.log(booking);

  // Generate OpenStreetMap URL
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading booking details...</p>
      </div>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/?mlat=${booking.propertyId.latitude}&mlon=${booking.propertyId.longitude}#map=15/${booking.propertyId.latitude}/${booking.propertyId.longitude}`;
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 bg-gray-300 hover:bg-gray-400 rounded-full"
                onClick={() => window.history.back()}
              >
                <HiArrowLeft className="text-2xl text-gray-800" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Your Booking Details
              </h1>
            </div>
            <div className="ml-4 mt-5">
              <p className="text-gray-600 mt-2 ">
                Booking ID: {booking.bookingId}
              </p>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium mt-4 sm:mt-0 ${
              booking.status === "Confirmed"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {booking.status}
          </span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiHome className="mr-2" /> Property Details
              </h2>

              <div className="space-y-6">
                <img
                  src={`http://localhost:8000/${booking.propertyId.images[0]}`}
                  alt="Property"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="flex flex-col space-y-2 text-xl">
                  <div>
                    <h1>{booking.propertyId.title}</h1>
                  </div>

                  <div className="flex items-center text-lg">
                    <FiMapPin className="mr-2 text-gray-500" />
                    <span>
                      {booking.propertyId.addressId.street},
                      {booking.propertyId.addressId.city}
                    </span>
                  </div>

                  <div className="text-lg">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <FaMapMarkedAlt className="mr-2 " />
                      View on OpenStreetMap
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Timeline */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiCalendar className="mr-2" /> Booking Timeline
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Check-in</p>
                    <p className="text-gray-600">
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Check-out</p>
                    <p className="text-gray-600">
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Payment Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                Payment Details
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Paid</span>
                  <span className="font-medium">NPR{booking.totalPrice}</span>
                </div>
                {/* <div className="flex justify-between text-sm">
                  <span>Payment Method</span>
                  <span>{booking.payment.method}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Status</span>
                  <span className="text-green-600">
                    {booking.payment.status}
                  </span>
                </div> */}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                Host Information
              </h2>
              <div className="space-y-8">
                <div className="flex flex-col space-y-2">
                  <span>
                    {" "}
                    Name: {booking.hostId.FirstName} {booking.hostId.LastName}
                  </span>
                  <span> Email: {booking.hostId.Email}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {/* <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiMessageSquare className="mr-2" /> Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Contact Host
                </button>
                <button className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Modify Booking
                </button>
                <button className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Request Cancellation
                </button>
              </div>
            </div> */}

            {/* Special Requests */}
            {/* {booking.specialRequests && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Special Requests</h2>
                <p className="text-gray-600">{booking.specialRequests}</p>
              </div>
            )} */}
          </div>
        </div>

        {/* Amenities & Rules */}
        {/* <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Amenities & Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Amenities</h3>
              <ul className="list-disc pl-5 space-y-2">
                {booking.property.amenities.map((amenity, index) => (
                  <li key={index} className="text-gray-600">
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Important Rules</h3>
              <p className="text-gray-600">{booking.property.rules}</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default BookingDetails;
