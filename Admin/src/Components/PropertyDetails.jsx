import { useState, useEffect, useRef } from "react";
import PropertyDescriptionModal from "../Components/PropertyDescriptionModal";
import { FiMapPin } from "react-icons/fi";

import { useParams, useNavigate } from "react-router-dom";

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
import {
  Circle,
  LayerGroup,
  MapContainer,
  Marker,
  TileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import ImageGalleryModal from "./ImageGalleryModal";

import AmenitiesDisplay from "./AmenitiesDisplay";



const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);

 


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
    window.scrollTo(0, 0);

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

 

  return (
    <div className="ml-64 w-[calc(100%-16rem)] p-6 bg-gray-100 min-h-screen">
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
      </main>
    </div>
  );
};

export default PropertyDetails;
