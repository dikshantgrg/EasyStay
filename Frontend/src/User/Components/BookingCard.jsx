import React, { useState } from "react";
import PropTypes from "prop-types";
import { FaRegCalendar, FaStar } from "react-icons/fa";
import { SlLocationPin } from "react-icons/sl";
import { MdOutlinePeopleOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import ToReviewPage from "../pages/ToReviewPage";
import RateAndReviewModal from "./RateAndReviewModal";

const BookingCard = ({
  id,
  bookingId,
  title,
  image,
  hostId,
  propertyId,
  city,
  street,
  checkIn,
  checkOut,
  guests,
  status,
  price,
  rating,
  isReviewPage = false,
  onRefreshBookings,
}) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  console.log(id);
  
  // Callback to trigger parent refresh
  const handleReviewSubmitted = () => {
    if (onRefreshBookings) {
      onRefreshBookings(); // Call the parent's refresh function
    }
  };


  const statusConfig = {
    upcoming: { color: "bg-blue-100 text-blue-800", label: "Upcoming" },
    completed: { color: "bg-green-100 text-green-800", label: "Completed" },
    cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    active: { color: "bg-amber-100 text-amber-800", label: "Current Stay" },
  };

  const handleImageError = (e) => {
    e.target.src = "/images/placeholder-property.jpg"; // Fallback image
  };

  return (
    <div className="mb-8 transition-transform duration-200">
      <div className="flex flex-col bg-white border-2 border-gray-200 rounded-xl md:flex-row hover:shadow-lg transition-shadow">
        {/* Image Section */}
        <div className="relative md:w-1/3 overflow-hidden rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
          <img
            src={`http://localhost:8000/${image}`}
            alt={`${title} property`}
            className="w-full h-48 md:h-full object-cover"
            onError={handleImageError}
          />
          {rating && (
            <div className="absolute top-2 right-2 backdrop-blur-sm bg-white/80 px-2 py-0.5 rounded-full text-xs font-medium flex items-center shadow-sm">
              <FaStar className="text-amber-500" />
              <span className="ml-1">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 md:p-4">
          <div className="flex flex-col h-full justify-between">
            {/* Header Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h2>
                <span
                  className={`${
                    statusConfig[status]?.color || "bg-gray-100 text-gray-800"
                  } 
                    px-2.5 py-1 rounded-full text-sm font-medium min-w-[100px] text-center`}
                >
                  {statusConfig[status]?.label || status}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center text-gray-800 mb-3">
                <SlLocationPin className="w-5 h-5 mr-1.5 text-gray-600 shrink-0" />
                <span className="text-sm truncate">
                  {street}, {city}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-gray-600 mb-2">
                <div className="flex items-center">
                  <FaRegCalendar className="w-4 h-4 mr-2 text-gray-600 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Check-in</p>
                    <p className="truncate">{checkIn}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaRegCalendar className="w-4 h-4 mr-2 text-gray-600 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Check-out</p>
                    <p className="truncate">{checkOut}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MdOutlinePeopleOutline className="w-4 h-4 mr-2 text-gray-600 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Guests</p>
                    <p>
                      {guests} {guests === 1 ? "guest" : "guests"}
                    </p>
                  </div>
                </div>
                {price && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Total: {price}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Section */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/booking/details/${bookingId}`)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 transition-colors"
                  aria-label={`View details for ${title} booking`}
                >
                  View Details
                </button>
                {isReviewPage && (
                  <>
                    <button
                      onClick={() => setShowModal(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-200 transition-colors"
                    >
                      Write Review
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <RateAndReviewModal
          onClose={() => setShowModal(false)}
          id={id}
          hostId={hostId}
          propertyId={propertyId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

BookingCard.propTypes = {
  bookingId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  city: PropTypes.string.isRequired,
  street: PropTypes.string.isRequired,
  checkIn: PropTypes.string.isRequired,
  checkOut: PropTypes.string.isRequired,
  guests: PropTypes.number.isRequired,
  status: PropTypes.oneOf(["upcoming", "completed", "cancelled", "active"])
    .isRequired,
  price: PropTypes.string,
  rating: PropTypes.number,
  isReviewPage: PropTypes.bool, // Add new prop to PropTypes
};

export default BookingCard;
