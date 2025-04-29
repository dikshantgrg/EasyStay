import { Link } from "react-router-dom";
import moment from "moment";

const GuestCard = ({ reservation, category }) => {
  // Status styling configuration
  const statusStyles = {
    "Checking Out": "bg-orange-100 text-orange-800 font-semibold",
    "Current Guest": "bg-green-100 text-green-800 font-semibold",
    "Arriving Soon": "bg-blue-100 text-blue-800 font-semibold",
    Upcoming: "bg-gray-100 text-gray-800 font-semibold",
    Completed: "bg-green-100 text-green-800 font-semibold",
  };

  return (
    <div className="relative bg-white rounded-md shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row p-3 gap-3">
        {/* Property Image */}
        <div className="w-full md:w-1/4 rounded-md overflow-hidden h-[200px]">
          <img
            src={
              `http://localhost:8000/${reservation.propertyId.images[0]}` ||
              "/default-property.jpg"
            }
            alt={reservation.propertyId.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Guest Details */}
        <div className="flex-1 flex flex-col gap-1.5 space-y-1">
          {/* Status Badge */}
          <span
            className={`absolute top-2 right-2 px-3 py-1 text-sm rounded-full shadow-sm ${
              statusStyles[category]
            }`}
          >
            {category === "All" ? reservation.status : category}
          </span>

          {/* Property Info */}
          <h3 className="text-xl font-semibold">
            {reservation.propertyId.title}
          </h3>
          <p className="text-sm text-gray-600">
            {reservation.propertyId.addressId?.street},{" "}
            {reservation.propertyId.addressId?.city}
          </p>

          {/* Guest Info */}
          <div className="flex items-center gap-2 mt-1">
            <img
              src={
                `http://localhost:8000/${reservation.userId.profileImage}` ||
                "/default-avatar.png"
              }
              alt={reservation.userId.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h4 className="text-lg font-medium">
                {reservation.userId.FirstName} {reservation.userId.LastName}
              </h4>
              <p className="text-xs text-gray-600">
                Booking ID: {reservation.bookingId}
              </p>
            </div>
          </div>

          {/* Dates and Price */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-xs text-gray-600">Check-in</p>
              <p className="text-lg font-medium">
                {moment(reservation.checkIn).format("MMM D, YYYY")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Check-out</p>
              <p className="text-lg font-medium">
                {moment(reservation.checkOut).format("MMM D, YYYY")}
              </p>
            </div>
          </div>

          {/* Total Price */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-base font-semibold text-gray-900">
              Total Price: NPR {reservation.totalPrice}
            </p>
            <Link
              to={`/host/booking/details/${reservation.bookingId}`}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestCard;
