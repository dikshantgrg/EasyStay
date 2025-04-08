import { useState, useEffect, useRef } from "react";
import PropertyDescriptionModal from "../Components/PropertyDescriptionModal";
import { FiMapPin } from "react-icons/fi";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useParams, useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import axios from "axios";
import {
  IoIosWifi,
  IoIosSnow,
  IoIosCar,
  IoIosRestaurant,
  IoIosWater,
  IoIosBed,
  IoIosPeople,
  IoMdImages,
  IoMdStar,
} from "react-icons/io";
import { FiThumbsUp, FiFlag } from "react-icons/fi";
import {
  Circle,
  LayerGroup,
  MapContainer,
  Marker,
  TileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Footer from "../Components/Footer";
import ImageGalleryModal from "../Components/ImageGalleryModal";
import ReviewListModal from "../Components/ReviewListModal";
import AmenitiesDisplay from "../Components/AmenitiesDisplay";
import moment from "moment";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";

// New ReviewModal Component

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);

  const today = startOfDay(new Date()); // Ensures date starts at midnight local time
  const tomorrow = startOfDay(new Date());
  tomorrow.setDate(today.getDate() + 1);

  const [dateRange, setDateRange] = useState({
    from: today,
    to: tomorrow,
  });
  const [guests, setGuests] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false); // New state for review modal
  const fillBlueOptions = { fillColor: "blue" };
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    // window.scrollTo(0, 0);

    const fetchPropertyWithDelay = () => {
      axios
        .get(`http://localhost:8000/api/property/${id}`)
        .then((res) => {
          setProperty(res.data.property);
        })
        .catch((error) => {
          console.error("Error fetching property:", error);
        });
    };

    fetchPropertyWithDelay();
  }, [id]);
  console.log(property);

  // useEffect(() => {
  //   const today = new Date();
  //   const tomorrow = new Date(today);
  //   tomorrow.setDate(today.getDate() + 1);

  //   // setCheckIn(formatDate(today));
  //   // setCheckOut(formatDate(tomorrow));
  // }, []);

  const amenities = [
    { icon: IoIosWifi, label: "High-speed Wi-Fi" },
    { icon: IoIosSnow, label: "Air Conditioning" },
    { icon: IoIosRestaurant, label: "Full Kitchen" },
    { icon: IoIosCar, label: "Free Parking" },
    { icon: IoIosWater, label: "Swimming Pool" },
  ];

  if (!property)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setGalleryModalOpen(true);
  };

  const displayedImages = property.images.slice(0, 5);
  const extraImagesCount = property.images.length - 5;

  // Limit to 6 reviews for initial display
  const displayedReviews = property.reviewStats.reviews.slice(0, 6);
  const limitedReviews = displayedReviews;

  // Total slides = number of items - visible items + 1
  const totalSlides = Math.max(0, limitedReviews.length - 3); // 6 items, 3 visible = 4 slides (0-3)

  const handlePrevious = () => {
    if (currentSlide > 0) {
      carouselRef.current?.previous();
      setCurrentSlide((prev) => prev - 1);
    }
  };
  const handleDateChange = (range) => {
    if (range?.from) {
      let newCheckOut = range.to;

      // Ensure check-out date is always after check-in
      if (!newCheckOut || newCheckOut <= range.from) {
        newCheckOut = new Date(range.from);
        newCheckOut.setDate(range.from.getDate() + 1);
      }

      setDateRange({ from: range.from, to: newCheckOut });
    }
  };
  const handleNext = () => {
    if (currentSlide < totalSlides) {
      carouselRef.current?.next();
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const checkAvailability = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/check-availability",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            propertyId: id,
            checkIn: moment(dateRange.from).format("YYYY-MM-DD"),
            checkOut: moment(dateRange.to).format("YYYY-MM-DD"),
          },
        }
      );
     
      if (response.data.available) {
        navigate(`/booking/${id}`, {
          state: {
            checkIn: moment(dateRange.from).format("YYYY-MM-DD"),
            checkOut: moment(dateRange.to).format("YYYY-MM-DD"),
            guests,
          },
        });
      } else {
        alert("This property is already booked for these dates.");
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      alert("An error occurred while checking availability.");
    }
  };

  return (
    <div className="bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery Section */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-2 h-[500px] mb-12 sm:w-full">
          <div className="md:col-span-2 row-span-2 relative group overflow-hidden">
            <button
              onClick={() => handleImageClick(0)}
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
            ></button>
            <img
              src={`http://localhost:8000/${property.images[0]}`}
              alt="Featured"
              className="w-full h-full object-cover rounded-tl-xl rounded-bl-xl shadow-lg"
            />
          </div>
          {displayedImages.slice(1, 5).map((img, i) => (
            <div
              key={i}
              className="relative group overflow-hidden hidden md:block"
            >
              <button
                onClick={() => handleImageClick(i + 1)}
                className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity"
              ></button>
              <img
                src={`http://localhost:8000/${img}`}
                alt={`Gallery ${i + 1}`}
                className={`w-full h-full object-cover shadow-lg ${
                  i === 1 ? "rounded-tr-xl" : ""
                } ${i === 3 ? "rounded-br-xl" : ""}`}
              />
              {i === 3 && extraImagesCount > 0 && (
                <button
                  onClick={() => {
                    setCurrentImageIndex(4);
                    setGalleryModalOpen(true);
                  }}
                  className="absolute bottom-2 right-4 text-white z-50 bg-black/80 rounded-lg p-2 hover:bg-black/100 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="items-center flex gap-1 group">
                    <IoMdImages className="text-xl transition-all duration-300 group-hover:scale-110" />
                    Show all photos
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {property.title}
              </h1>
              <div className="mt-2 flex items-center text-lg text-gray-600">
                <FiMapPin className="mr-1" />
                <span>
                  {property.addressId.street}, {property.addressId.city}
                </span>
              </div>
              <div className="mt-2 flex items-center">
                <IoMdStar className="h-5 w-5 text-yellow-400" />
                <span className="ml-1 text-gray-700">
                  {property.reviewStats.averageRating} (
                  {property.reviewStats.totalReviews} reviews)
                </span>
              </div>
            </div>

            {/* Property Features Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Property Features</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <IoIosBed className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-gray-700">
                    {property.bedrooms} Bedrooms
                  </span>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <IoIosWater className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-gray-700">
                    {property.bathrooms} Bathrooms
                  </span>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <IoIosRestaurant className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-gray-700">
                    {property.kitchen} Kitchen
                  </span>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <IoIosPeople className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-gray-700">
                    Sleeps up to {property.maxGuest}
                  </span>
                </div>
              </div>
            </section>

            {/* Description Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">About this property</h2>
              <p className="text-gray-600 leading-relaxed">
                {property.description
                  ?.substring(0, 230)
                  .split("\n")
                  .map((line, index) => (
                    <span key={index}>
                      {line}
                      ....
                    </span>
                  ))}
                {property.description?.length > 230 && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-blue-600 font-medium hover:underline ml-1"
                    aria-label="Read more about this property"
                  >
                    Read more
                  </button>
                )}
              </p>
            </section>

            {/* Amenities Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Amenities</h2>

              <AmenitiesDisplay amenities={property.amenities} />
            </section>
          </div>

          {/* Booking Sidebar */}
          <div className="w-full lg:w-96 xl:w-[420px]">
            <div className="sticky top-8 bg-white rounded-xl shadow-xl p-6">
              <div className="mb-6">
                <div className="space-x-2 justify-between items-center mb-4">
                  <span className="text-2xl font-bold">
                    NPR{property.price}
                  </span>
                  <span className="text-gray-600">per night</span>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                      Check in & Check out
                    </span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-14 justify-between px-4 border-gray-300 hover:border-gray-400",
                          "text-base font-medium rounded-lg",
                          dateRange.from &&
                            "bg-gray-50 border-blue-500 hover:border-blue-600"
                        )}
                      >
                        <div className="grid grid-cols-2 gap-x-4 text-left flex-1">
                          <div>
                            <div className="text-xs font-normal text-gray-500">
                              Check in
                            </div>
                            {moment(dateRange.from).format("MMM D")}
                          </div>
                          <div>
                            <div className="text-xs font-normal text-gray-500">
                              Check out
                            </div>
                            {moment(dateRange.to).format("MMM D")}
                          </div>
                        </div>
                        <CalendarIcon className="ml-2 h-5 w-5 text-gray-500" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl shadow-2xl border-0">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={{ from: dateRange.from, to: dateRange.to }} // ✅ Ensures default dates are selected
                        onSelect={handleDateChange}
                        numberOfMonths={2}
                        fromDate={today} // Prevents past date selection
                        classNames={{
                          day_selected:
                            "bg-blue-600 text-white hover:bg-blue-700", // ✅ Ensures selected dates are properly highlighted
                          head: "text-gray-600 font-medium",
                          day_today: "bg-gray-200 font-semibold", // ✅ Makes today visible without being fully white
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guests
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                  >
                    {Array.from({ length: property.maxGuest }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                  onClick={checkAvailability}
                  disabled={!dateRange.from || !dateRange.to}
                >
                  Reserve
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-6 h-96 border-b-2 mb-8">
          <h2 className="text-2xl font-bold mb-4">Where you'll be</h2>
          <MapContainer
            center={[property.latitude, property.longitude]}
            zoom={16}
            scrollWheelZoom={false}
            className="h-96 w-full rounded-xl z-0"
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LayerGroup>
              <Circle
                center={[property.latitude, property.longitude]}
                pathOptions={fillBlueOptions}
                radius={150}
              />
            </LayerGroup>
            <Marker position={[property.latitude, property.longitude]} />
          </MapContainer>
        </div>

        <ImageGalleryModal
          images={property.images}
          isOpen={galleryModalOpen}
          onClose={() => setGalleryModalOpen(false)}
          initialIndex={currentImageIndex}
        />

        <PropertyDescriptionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <h3 className="text-2xl font-semibold mb-4">Full Description</h3>
          <p className="whitespace-pre-line">{property.description}</p>
        </PropertyDescriptionModal>

        <section className="my-14 max-w-7xl">
          <h2 className="py-5 text-2xl font-bold mb-6">Guest Reviews</h2>

          {/* Rating Summary */}
          <div className="bg-blue-50 p-4 md:p-6 rounded-xl mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="flex items-center">
                <span className="text-3xl md:text-4xl font-bold text-blue-600">
                  {property.reviewStats.averageRating}
                </span>
                <span className="text-gray-500 ml-1 mt-1">/5</span>
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <IoMdStar
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(property.reviewStats.averageRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm md:text-base">
                  Based on {property.reviewStats.totalReviews} reviews
                </p>
              </div>
            </div>
          </div>

          {/* Reviews Grid - Limited to 6 */}

          <div className="relative  py-2">
            <div className="relative max-w-7xl mx-auto">
              {/* Left Arrow */}
              <div className="absolute top-1/2 -translate-y-1/2 -left-1 md:-left-10 z-10">
                <button
                  className={`hidden md:flex p-2 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 ${
                    currentSlide === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handlePrevious}
                  disabled={currentSlide === 0}
                >
                  <FiChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Carousel */}
              <Carousel
                responsive={{
                  desktop: {
                    breakpoint: { max: 3000, min: 1024 },
                    items: 3, // Show 3 items at a time
                  },
                  tablet: {
                    breakpoint: { max: 1024, min: 464 },
                    items: 2,
                  },
                  mobile: {
                    breakpoint: { max: 464, min: 0 },
                    items: 1,
                  },
                }}
                infinite={false}
                autoPlay={false}
                showDots={false}
                arrows={false}
                ref={carouselRef}
                itemClass="px-2"
                containerClass="carousel-container"
                slidesToSlide={1}
                afterChange={(previousSlide, { currentSlide }) => {
                  setCurrentSlide(currentSlide);
                }}
              >
                {limitedReviews.map((review, index) => (
                  <div
                    key={review._id}
                    className="bg-white p-7 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 h-full border-[0.5px] border-gray-300"
                  >
                    <div className="flex items-start gap-2 md:gap-3 mb-2">
                      <div className="flex-shrink-0">
                        <div className="w-8 h- md:w-9 md:h-9 bg-blue-50 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {review.user.FirstName?.charAt(0) || "G"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-medium text-sm truncate">
                            {review.user.FirstName || "Guest"}
                          </span>
                          <div className="flex items-center gap-0.5 ml-1">
                            {[...Array(5)].map((_, i) => (
                              <IoMdStar
                                key={i}
                                className={`h-3 w-3 md:h-4 md:w-4 ${
                                  i < review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm md:text-base mb-1.5 text-gray-800">
                      {review.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-snug line-clamp-4">
                      {review.reviewText}
                    </p>
                  </div>
                ))}
              </Carousel>

              {/* Right Arrow */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-10 md:-right-10 z-10">
                <button
                  className={`hidden md:flex p-2 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 ${
                    currentSlide >= totalSlides
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={handleNext}
                  disabled={currentSlide >= totalSlides}
                >
                  <FiChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
          {property.reviewStats.totalReviews > 3 && (
            <div className="mt-4 ">
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm md:text-base"
              >
                Show all {property.reviewStats.totalReviews} reviews
              </button>
            </div>
          )}
        </section>

        {/* Review Modal */}
        <ReviewListModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          reviews={property.reviewStats.reviews}
        />
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetails;
