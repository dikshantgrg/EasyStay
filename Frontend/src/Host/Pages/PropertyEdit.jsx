import axios from "axios";
import React, { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi2";
import { useParams, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { RxCross1 } from "react-icons/rx";
import { MapContainer, Marker, TileLayer, useMapEvent } from "react-leaflet";
import {
  FaWifi,
  FaTv,
  FaCoffee,
  FaParking,
  FaSwimmingPool,
  FaHotTub,
  FaFireExtinguisher,
  FaLock,
  FaSnowflake,
  FaFan,
  FaDumbbell,
  FaUtensils,
  FaLaptop,
  FaDog,
  FaCat,
  FaBan,
  FaWheelchair,
  FaBabyCarriage,
  FaPlug,
  FaShower,
  FaBath,
  FaBed,
  FaCouch,
  FaChair,
  FaTable,
  FaBlender,
  FaSink,
  FaBreadSlice,
  FaTrash,
  FaBroom,
  FaSoap,
  FaTshirt,
  FaAirFreshener,
  FaCamera,
  FaBook,
  FaGamepad,
  FaMusic,
  FaBicycle,
  FaCar,
  FaBus,
  FaPlane,
  FaTree,
  FaSun,
} from "react-icons/fa";
import { FiHome } from "react-icons/fi";

const amenitiesList = [
  { name: "WiFi", icon: FaWifi },
  { name: "TV", icon: FaTv },
  { name: "Coffee Maker", icon: FaCoffee },
  { name: "Parking", icon: FaParking },
  { name: "Swimming Pool", icon: FaSwimmingPool },
  { name: "Hot Tub", icon: FaHotTub },
  { name: "Fire Extinguisher", icon: FaFireExtinguisher },
  { name: "Lockbox", icon: FaLock },
  { name: "Air Conditioning", icon: FaSnowflake },
  { name: "Ceiling Fan", icon: FaFan },
  { name: "Gym", icon: FaDumbbell },
  { name: "Kitchen", icon: FaUtensils },
  { name: "Laptop Workspace", icon: FaLaptop },
  { name: "Pet Friendly (Dogs)", icon: FaDog },
  { name: "Pet Friendly (Cats)", icon: FaCat },
  { name: "No Smoking", icon: FaBan },
  { name: "Wheelchair Accessible", icon: FaWheelchair },
  { name: "Baby Stroller", icon: FaBabyCarriage },
  { name: "Power Backup", icon: FaPlug },
  { name: "Shower", icon: FaShower },
  { name: "Bathtub", icon: FaBath },
  { name: "Extra Bed", icon: FaBed },
  { name: "Sofa", icon: FaCouch },
  { name: "Armchair", icon: FaChair },
  { name: "Dining Table", icon: FaTable },
  { name: "Blender", icon: FaBlender },
  { name: "Dishwasher", icon: FaSink },
  { name: "Toaster", icon: FaBreadSlice },
  { name: "Trash Disposal", icon: FaTrash },
  { name: "Cleaning Supplies", icon: FaBroom },
  { name: "Soap/Shampoo", icon: FaSoap },
  { name: "Extra Towels", icon: FaTshirt },
  { name: "Hair Dryer", icon: FaAirFreshener },
  { name: "Security Camera", icon: FaCamera },
  { name: "Books", icon: FaBook },
  { name: "Gaming Console", icon: FaGamepad },
  { name: "Music System", icon: FaMusic },
  { name: "Bicycles", icon: FaBicycle },
  { name: "Car Rental", icon: FaCar },
  { name: "Public Transport Access", icon: FaBus },
  { name: "Airport Shuttle", icon: FaPlane },
  { name: "Garden", icon: FaTree },
  { name: "Balcony", icon: FaSun },
];

const PropertyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState("Title");
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [titleForm, setTitleForm] = useState({
    title: "",
    description: "",
    price: 0,
  });
  const [formErrors, setFormErrors] = useState({
    title: "",
    description: "",
    price: "",
    images: "",
  });
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    province_name: "",
    zipCode: "",
  });
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [roomsForm, setRoomsForm] = useState({
    bedrooms: 1,
    bathrooms: 1,
    kitchen: 1,
    amenities: [],
  });
  const [isPropertyActive, setIsPropertyActive] = useState(false);

  // Validation function
  const validateForm = () => {
    const errors = {
      title: "",
      description: "",
      price: "",
      images: "",
    };
    let isValid = true;

    // Title validation
    if (!titleForm.title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    } else if (titleForm.title.length < 5) {
      errors.title = "Title must be at least 5 characters long";
      isValid = false;
    }

    // Description validation
    if (!titleForm.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    } else if (titleForm.description.length < 20) {
      errors.description = "Description must be at least 20 characters long";
      isValid = false;
    }

    // Price validation
    if (titleForm.price === "" || isNaN(titleForm.price)) {
      errors.price = "Price is required";
      isValid = false;
    } else if (titleForm.price <= 0) {
      errors.price = "Price must be greater than 0";
      isValid = false;
    } else if (titleForm.price < 1) {
      errors.price = "Price must be at least $1";
      isValid = false;
    } else if (titleForm.price > 10000) {
      errors.price = "Price cannot exceed $10,000";
      isValid = false;
    }

    // Images validation
    if (images.length < 5) {
      errors.images = "At least 5 images are required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Fetch property data
  const fetchProperty = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/property/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("API Response:", response);
      const data = response.data.property || response.data;
      if (!data || typeof data !== "object") {
        console.error("Invalid API response data:", data);
        return;
      }

      setProperty(data);
      setTitleForm({
        title: data.title || "",
        description: data.description || "",
        price: data.price || 0,
      });
      setRoomsForm({
        bedrooms: data.bedrooms || 1,
        bathrooms: data.bathrooms || 1,
        kitchen: data.kitchen || 1,
        amenities: data.amenities || [],
      });
      setCoordinates({
        lat: data.latitude || 0,
        lng: data.longitude || 0,
      });
      setAddressForm({
        street: data.addressId?.street || data.address?.street || "",
        city: data.addressId?.city || data.address?.city || "",
        province_name:
          data.addressId?.province_name || data.address?.province_name || "",
        zipCode: data.addressId?.zipCode || data.address?.zipCode || "",
      });
      setImages(data.images || []);
      setIsPropertyActive(data.is_active || false); // Set initial is_active status
    } catch (error) {
      console.error("Error fetching property:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle property is_active status
  const togglePropertyActive = async () => {
    try {
      const newActiveStatus = !isPropertyActive;
      const response = await axios.put(
        `http://localhost:8000/api/host/toggle-active/${property._id}`,
        { is_active: newActiveStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setIsPropertyActive(newActiveStatus);
        toast.success(
          `Property status updated to ${
            newActiveStatus ? "Active" : "Inactive"
          }`
        );
        await fetchProperty();
      }
    } catch (error) {
      console.error(
        "Error updating property active status:",
        error.response?.data || error.message
      );
      toast.error("Failed to update property status. Please try again.");
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const MapClickHandler = () => {
    useMapEvent("click", (event) => {
      const { lat, lng } = event.latlng;
      setCoordinates({ lat, lng });
    });
    return null;
  };

  const updateRoomValue = (field, change) => {
    setRoomsForm((prev) => {
      if (prev[field] <= 1 && change < 0) return prev;
      return { ...prev, [field]: prev[field] + change };
    });
  };

  const handleAmenityChange = (amenityName) => {
    setRoomsForm((prev) => {
      const currentAmenities = prev.amenities || [];
      const updatedAmenities = currentAmenities.includes(amenityName)
        ? currentAmenities.filter((item) => item !== amenityName)
        : [...currentAmenities, amenityName];
      return { ...prev, amenities: updatedAmenities };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    const updatedProperty = {
      ...property,
      title: titleForm.title,
      description: titleForm.description,
      price: titleForm.price,
      address: { ...addressForm },
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      bedrooms: roomsForm.bedrooms,
      bathrooms: roomsForm.bathrooms,
      kitchen: roomsForm.kitchen,
      amenities: roomsForm.amenities,
    };

    const formData = new FormData();
    formData.append("title", updatedProperty.title);
    formData.append("description", updatedProperty.description);
    formData.append("addressId", updatedProperty.addressId?._id || "");
    formData.append("address", JSON.stringify(updatedProperty.address));
    formData.append("price", updatedProperty.price);
    formData.append("maxGuest", updatedProperty.maxGuest || "");
    formData.append("bedrooms", updatedProperty.bedrooms);
    formData.append("bathrooms", updatedProperty.bathrooms);
    formData.append("kitchen", updatedProperty.kitchen);
    formData.append("longitude", updatedProperty.longitude);
    formData.append("latitude", updatedProperty.latitude);
    updatedProperty.amenities.forEach((amenity) =>
      formData.append("amenities[]", amenity)
    );

    try {
      const response = await axios.put(
        `http://localhost:8000/api/edit/property/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await fetchProperty();
      toast.success("Property updated successfully!");
    } catch (error) {
      console.error(
        "Error updating property:",
        error.response?.data || error.message
      );
      toast.error("Error updating property!");
    }
  };

  const handleDelete = async (imagePath) => {
    if (images.length <= 5) {
      toast.error("Cannot delete image: At least 5 images are required.");
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8000/api/delete/${property?._id}`,
        {
          data: { imagePath },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setImages((prevImages) =>
          prevImages.filter((img) => img !== imagePath)
        );
        toast.success("Image deleted successfully");
        validateForm();
      }
    } catch (error) {
      console.error(
        "Error deleting image:",
        error.response?.data || error.message
      );
      toast.error("Failed to delete image");
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleUpload(selectedFiles);
  };

  const handleUpload = async (selectedFiles) => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("images", file));

    try {
      const response = await axios.post(
        `http://localhost:8000/api/upload-images/${property?._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const validImages = response.data.images || [];
      setImages((prev) => [...prev, ...validImages]);
      toast.success("Images uploaded successfully");
      validateForm();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!property) return <div>Property not found</div>;

  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8 flex flex-col h-screen">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "#4aed88",
            },
          },
        }}
      />
      <div className="flex items-center gap-4 mb-4 flex-shrink-0">
        <button
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
          onClick={() => navigate(-1)}
        >
          <HiArrowLeft className="text-2xl text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow h-[calc(100vh-100px)]">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto h-full p-3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Update Status
            </h2>
            <div
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-150"
              onClick={togglePropertyActive}
            >
              <FiHome className="h-6 w-6 text-gray-700" />
              <span className="text-base font-semibold text-gray-800 flex-1">
                {isPropertyActive ? "Property: Active" : "Property: Inactive"}
              </span>
              <div
                className={`w-12 h-6 rounded-full p-1 ${
                  isPropertyActive ? "bg-green-500" : "bg-red-500"
                } transition-colors duration-300`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-lg transform transition-transform duration-300 ${
                    isPropertyActive ? "translate-x-6" : ""
                  }`}
                ></div>
              </div>
            </div>
          </div>

          <div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:shadow-lg"
            onClick={() => setEditMode("Title")}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Property Information
            </h2>
            <div className="space-y-4">
              <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <h3 className="text-sm font-medium text-gray-600">Title</h3>
                <p className="text-gray-900 mt-1">
                  {property.title || titleForm.title}
                </p>
              </div>
              <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <h3 className="text-sm font-medium text-gray-600">Price</h3>
                <p className="text-gray-900 mt-1">
                  Rs {property.price || titleForm.price} / night
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            onClick={() => setEditMode("Image")}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Photo</h2>
            <div className="grid grid-cols-2 gap-4">
              {images.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
                >
                  <img
                    className="w-full h-full object-cover rounded-lg"
                    src={`http://localhost:8000/${item}`}
                    alt={`Property Image ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            {formErrors.images && (
              <p className="mt-4 text-sm text-red-500">{formErrors.images}</p>
            )}
          </div>

          <div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:shadow-lg"
            onClick={() => setEditMode("Address")}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Location
            </h2>
            <div className="space-y-4">
              <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <p className="text-gray-900 mt-1">
                  {property.addressId?.city || addressForm.city},{" "}
                  {property.addressId?.street || addressForm.street}
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:shadow-lg"
            onClick={() => setEditMode("Room")}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Room and Amenities
            </h2>
            <div className="space-y-4">
              <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <p className="text-gray-900 mt-1">
                  {property.bedrooms || roomsForm.bedrooms} bedrooms,{" "}
                  {property.kitchen || roomsForm.kitchen} kitchen,{" "}
                  {property.bathrooms || roomsForm.bathrooms} bathrooms
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        {editMode === "Title" ? (
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Edit Title, Description & Price
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title
                </label>
                <input
                  onChange={(e) =>
                    setTitleForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  value={titleForm.title}
                  type="text"
                  className={`w-full px-4 py-2 border ${
                    formErrors.title ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.title}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Night
                </label>
                <input
                  onChange={(e) =>
                    setTitleForm((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  value={titleForm.price}
                  type="number"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 border ${
                    formErrors.price ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.price && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.price}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  onChange={(e) =>
                    setTitleForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows="4"
                  className={`w-full h-72 px-4 py-2 border ${
                    formErrors.description
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  value={titleForm.description}
                ></textarea>
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.description}
                  </p>
                )}
              </div>
              <div>
                {formErrors.images && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.images}
                  </p>
                )}
              </div>
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : editMode === "Image" ? (
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Manage Photos
            </h2>
            {formErrors.images && (
              <p className="mb-4 text-sm text-red-500">{formErrors.images}</p>
            )}
            <div className="grid grid-cols-3 gap-4">
              {images.map((item, index) => (
                <div
                  key={index}
                  className="group relative aspect-square bg-gray-50 border border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:shadow-lg transition-colors"
                >
                  <img
                    className="w-full h-full object-cover rounded-xl"
                    src={`http://localhost:8000/${item}`}
                    alt={`Property Image ${index + 1}`}
                  />
                  <button
                    onClick={() => handleDelete(item)}
                    className="absolute top-2 right-2 text-lg p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <RxCross1 />
                  </button>
                </div>
              ))}
              <div className="flex flex-col gap-4">
                <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <span className="text-gray-500">+ Add Photos</span>
                </label>
              </div>
            </div>
          </div>
        ) : editMode === "Address" ? (
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Edit Address
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      street: e.target.value,
                    }))
                  }
                  value={addressForm.street}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    value={addressForm.city}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-1">
                    Province
                  </label>
                  <select
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        province_name: e.target.value,
                      }))
                    }
                    value={addressForm.province_name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Province</option>
                    <option value="Koshi">Koshi</option>
                    <option value="Madhesh">Madhesh</option>
                    <option value="Bagmati">Bagmati</option>
                    <option value="Gandaki">Gandaki</option>
                    <option value="Lumbini">Lumbini</option>
                    <option value="Karnali">Karnali</option>
                    <option value="Sudurpashchim">Sudurpashchim</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xl text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      zipCode: e.target.value,
                    }))
                  }
                  value={addressForm.zipCode}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <label className="block text-xl text-gray-700 mb-1">
                Location
              </label>
              <div className="mt-6 h-96 border-2 rounded-xl">
                <MapContainer
                  center={[coordinates.lat || 0, coordinates.lng || 0]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="h-full rounded-xl z-0"
                >
                  <TileLayer
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler />
                  <Marker
                    position={[coordinates.lat || 0, coordinates.lng || 0]}
                  />
                </MapContainer>
                <div>
                  <p>Property Latitude: {coordinates.lat}</p>
                  <p>Property Longitude: {coordinates.lng}</p>
                </div>
              </div>
              <div>
                {formErrors.images && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.images}
                  </p>
                )}
              </div>
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Manage Rooms
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => updateRoomValue("bedrooms", -1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={roomsForm.bedrooms}
                    readOnly
                    className="w-16 px-4 py-2 border border-gray-300 rounded-lg text-center"
                  />
                  <button
                    type="button"
                    onClick={() => updateRoomValue("bedrooms", 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => updateRoomValue("bathrooms", -1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={roomsForm.bathrooms}
                    readOnly
                    className="w-16 px-4 py-2 border border-gray-300 rounded-lg text-center"
                  />
                  <button
                    type="button"
                    onClick={() => updateRoomValue("bathrooms", 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kitchen
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => updateRoomValue("kitchen", -1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={roomsForm.kitchen}
                    readOnly
                    className="w-16 px-4 py-2 border border-gray-300 rounded-lg text-center"
                  />
                  <button
                    type="button"
                    onClick={() => updateRoomValue("kitchen", 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Manage Amenities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                  {amenitiesList.map((amenity) => {
                    const isSelected = roomsForm.amenities.includes(
                      amenity.name
                    );
                    return (
                      <label
                        key={amenity.name}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleAmenityChange(amenity.name)}
                          className="hidden"
                        />
                        <amenity.icon className="w-6 h-6 mr-3" />
                        <span className="text-sm font-medium">
                          {amenity.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                {formErrors.images && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.images}
                  </p>
                )}
              </div>
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  Update Property
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyEdit;
