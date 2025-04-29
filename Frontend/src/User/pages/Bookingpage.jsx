import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { IoIosArrowBack, IoIosCheckmarkCircle } from "react-icons/io";
import { FiCalendar, FiUser } from "react-icons/fi";
import Footer from "../Components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [bookingInfo, setBookingInfo] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    property: "",
    host: "",
    totalPrice: 0,
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!location.state) {
      navigate(`/property/${id}`);
      return;
    }

    const fetchProperty = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/property/${id}`
        );
        console.log(response);
        setProperty(response.data.property);
        setBookingInfo((prev) => ({
          ...prev,
          ...location.state,
          guests: location.state.guests || 1,
        }));
      } catch (error) {
        console.error("Error fetching property:", error);
        navigate(`/property/${id}`);
      }
    };

    fetchProperty();
  }, [id, location.state, navigate]);

  const validateForm = () => {
    let tempErrors = {};
    console.log(user);
    // Phone validation (only if user doesn't have a phone number)
    if (!user?.phoneNumber) {
      if (!bookingInfo.phone) {
        tempErrors.phone = "Phone number is required";
      } else if (!/^\+?[1-9]\d{1,14}$/.test(bookingInfo.phone)) {
        tempErrors.phone = "Please enter a valid phone number";
      }
    }

    // Other validations (check-in, check-out, guests) remain unchanged
    if (!bookingInfo.checkIn) {
      tempErrors.checkIn = "Check-in date is required";
    }
    if (!bookingInfo.checkOut) {
      tempErrors.checkOut = "Check-out date is required";
    }
    if (bookingInfo.checkIn && bookingInfo.checkOut) {
      const checkInDate = new Date(bookingInfo.checkIn);
      const checkOutDate = new Date(bookingInfo.checkOut);
      if (checkInDate >= checkOutDate) {
        tempErrors.checkOut = "Check-out date must be after check-in date";
      }
    }

    if (bookingInfo.guests < 1) {
      tempErrors.guests = "Number of guests must be at least 1";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const calculateTotal = () => {
    if (!bookingInfo.checkIn || !bookingInfo.checkOut)
      return { total: 0, nights: 0 };

    const dailyPrice = parseFloat(property.price);
    const startDate = new Date(bookingInfo.checkIn);
    const endDate = new Date(bookingInfo.checkOut);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    return { total: dailyPrice * nights, nights, dailyPrice };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form submitted with bookingInfo:", bookingInfo);
    if (!validateForm()) {
      console.log("Validation failed with errors:", errors);
      return;
    }

    setLoading(true);
    try {
      const { total } = calculateTotal();
      const bookingData = {
        propertyId: id,
        checkIn: bookingInfo.checkIn,
        checkOut: bookingInfo.checkOut,
        totalGuest: bookingInfo.guests,
        totalPrice: total,
        userId: user._id,
        hostId: property.hostId._id,
        phoneNumber: user?.phoneNumber || bookingInfo.phone, // Use user's phone if available
      };

      console.log("Sending bookingData:", bookingData);

      const response = await axios.post(
        "http://localhost:8000/api/make-booking",
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Booking successful:", response);
      setBookingSuccess(true);
      localStorage.setItem("token", response.data.token);

      

      window.location.href = response.data.paymentUrl;
      // setTimeout(() => navigate("/booking-confirmation"), 2000);
    } catch (error) {
      console.error("Booking failed:", error);
      alert(
        error.response?.data?.message || "Booking failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!property)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  const { total, nights, dailyPrice } = calculateTotal();

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
        >
          <IoIosArrowBack className="mr-1" />
          Back
        </button>

        {bookingSuccess && (
          <div className="mb-6 p-4 bg-green-100 rounded-lg flex items-center">
            <IoIosCheckmarkCircle className="text-green-600 mr-2" />
            <span>Booking confirmed! Redirecting to payment...</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-semibold mb-6">Booking Summary</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Property Image and Details */}
            <div className="lg:w-2/5">
              <img
                src={`http://localhost:8000/${property.images[0]}`}
                alt={property.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              <h2 className="text-xl font-medium mt-4 mb-1">
                {property.title}
              </h2>
              <p className="text-gray-600">
                {property.addressId.street}, {property.addressId.city}
              </p>
            </div>

            {/* Booking Details */}
            <div className="lg:w-3/5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Check-in</p>
                  <p className="font-medium">
                    {new Date(bookingInfo.checkIn).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Check-out</p>
                  <p className="font-medium">
                    {new Date(bookingInfo.checkOut).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Guests</p>
                  <p className="font-medium">{bookingInfo.guests} guests</p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-medium">{nights} nights</p>
                </div>
              </div>

              {/* Phone Number Input if needed */}
              {!user?.phoneNumber && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-3">
                    Contact Information
                  </h3>
                  <input
                    type="tel"
                    name="phone"
                    value={bookingInfo.phone || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
              )}

              {/* Price Summary */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">
                    Room Rate × {nights} nights
                  </span>
                  <span>
                    Rs {dailyPrice} × {nights}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount</span>
                  <span>Rs {total}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full mt-4 py-3 rounded-lg text-white font-medium ${
                    loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Processing..." : "Proceed to Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
