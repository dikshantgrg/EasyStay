import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { IoIosArrowBack, IoIosCheckmarkCircle } from "react-icons/io";
import { FiCalendar, FiUser } from "react-icons/fi";
import Footer from "../Components/Footer";
import { useSelector } from "react-redux";

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

  // console.log(user);
  
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
        console.log(response)
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
  
      console.log("Booking successful:", response.data);
      setBookingSuccess(true);
      window.location.href = response.data.paymentUrl;
      // setTimeout(() => navigate("/booking-confirmation"), 2000);
    } catch (error) {
      console.error("Booking failed:", error.response?.data || error.message);
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
    <div className="bg-white min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
        >
          <IoIosArrowBack className="mr-1" />
          Back to Property
        </button>

        {bookingSuccess && (
          <div className="mb-6 p-4 bg-green-100 rounded-lg flex items-center">
            <IoIosCheckmarkCircle className="text-green-600 mr-2 text-2xl" />
            <span className="text-green-800">
              Booking confirmed! Redirecting...
            </span>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <form onSubmit={handleSubmit} className="flex-1" noValidate>
                {!user?.phoneNumber && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold mb-6">Required information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingInfo.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                      required
                      placeholder="+1234567890"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
              </div>
            </div>
                )}

            <div className="py-6">
              <span className="text-sm">
                "By selecting 'below button,' you acknowledge and accept our
                Terms and Conditions and Privacy Policy."
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:bg-gray-400"
            >
              {loading ? "Processing..." : "Confirm Booking"}
            </button>
          </form>

          <div className="w-full lg:w-96 xl:w-[420px] ">
            <div className="sticky top-8 bg-white rounded-xl border-2 border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6">Booking Summary</h2>
              <div className="flex items-center mb-4">
                <img
                  src={`http://localhost:8000/${property?.images[0]}`}
                  alt={property.title}
                  className="w-20 h-20 object-cover rounded-lg mr-4"
                />
                <div>
                  <h3 className="font-semibold">{property.title}</h3>
                  <p className="text-sm text-gray-600">
                    {property.addressId.city}, {property.addressId.country}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <FiCalendar className="mr-2" />
                  <span>
                    {new Date(bookingInfo.checkIn).toLocaleDateString()} -{" "}
                    {new Date(bookingInfo.checkOut).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiUser className="mr-2" />
                  <span>{bookingInfo.guests} guests</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span>
                    Rs {dailyPrice.toFixed(2)} × {nights} nights
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    Rs {total.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 text-center mt-4">
                  Includes taxes and service fees
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;
