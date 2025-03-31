import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiCalendar, FiUser, FiMessageSquare } from "react-icons/fi";
import axios from "axios";

import { HiArrowLeft } from "react-icons/hi2";

const HostBookingDetail = () => {
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
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading booking details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div className="flex items-center space-x-4">
            <button
              className="p-2 bg-gray-300 hover:bg-gray-400 rounded-full"
              onClick={() => window.history.back()}
            >
              <HiArrowLeft className="text-2xl text-gray-800" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Booking Details
            </h1>
          </div>
          {/* <span
            className={`px-4 py-2 rounded-full text-sm font-medium mt-4 sm:mt-0 ${
              booking.status === "Confirmed"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {booking.status}
          </span> */}
        </div>
        <p className="text-gray-600 ">Booking ID: {booking.bookingId}</p>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Guest Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiUser className="mr-2" /> Guest Information
              </h2>
              <div className="flex items-start gap-6">
                <img
                  src="/default-avatar.png"
                  alt="Guest"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {" "}
                    {booking.userId.FirstName} {booking.userId.LastName}
                  </p>
                  <p className="text-gray-600">{booking.userId.Email}</p>
                  <p className="text-gray-600">{booking.userId.phoneNumber}</p>
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
                    <p className="text-gray-600">{booking.checkIn}</p>
                  </div>
                  <div>
                    <p className="font-medium">Check-out</p>
                    <p className="text-gray-600">{booking.checkOut}</p>
                  </div>
                </div>
                {/* <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Guest is expected to arrive at {booking.checkIn}
                  </p>
                </div> */}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Earnings */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                Earnings
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Booking Price</span>
                  <span>NPR {booking.totalPrice}</span>
                </div>
                {/* <div className="flex justify-between text-green-600">
                  <span>Your Earnings</span>
                  <span>${(booking.totalPrice * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Service Fee (15%)</span>
                  <span>${(booking.totalPrice * 0.15).toFixed(2)}</span>
                </div> */}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiMessageSquare className="mr-2" /> Actions
              </h2>
              <div className="space-y-3">
                {/* <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Contact Guest
                </button> */}
                <button className="w-full py-2 px-4 border text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  Update Booking Status
                </button>
                {/* <button className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Generate Report
                </button> */}
              </div>
            </div>

            {/* Special Requests */}
            {/* {booking.specialRequests && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Special Requests</h2>
                <p className="text-gray-600">{booking.specialRequests}</p>
              </div>
            )} */}
          </div>
        </div>

        {/* Property Info */}
        {/* <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Property Information</h2>
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
              <h3 className="font-medium mb-2">House Rules</h3>
              <p className="text-gray-600">{booking.property.rules}</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default HostBookingDetail;
