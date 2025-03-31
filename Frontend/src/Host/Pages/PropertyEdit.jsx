import axios from "axios";
import React, { useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi2";
import { useParams, useNavigate } from "react-router-dom";
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
  const [titleForm, setTitleForm] = useState({ title: "", description: "" });
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    province_id: "",
    zipCode: "",
  });
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [roomsForm, setRoomsForm] = useState({
    bedrooms: 1,
    bathrooms: 1,
    kitchen: 1,
    amenities: [], // Initialize amenities
  });

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
      console.log("Fetch API Response:", response.data);
      const data = response.data.property || response.data;
      if (!data || typeof data !== "object") {
        console.error("Invalid API response data:", data);
        return;
      }

      setProperty(data);
      setTitleForm({
        title: data.title || "",
        description: data.description || "",
      });
      setRoomsForm({
        bedrooms: data.bedrooms || 1,
        bathrooms: data.bathrooms || 1,
        kitchen: data.kitchen || 1,
        amenities: data.amenities || [], // Set fetched amenities
      });
      setCoordinates({
        lat: data.latitude || 0,
        lng: data.longitude || 0,
      });
      setAddressForm({
        street: data.addressId?.street || data.address?.street || "",
        city: data.addressId?.city || data.address?.city || "",
        province_id:
          data.addressId?.province_id || data.address?.province_id || "",
        zipCode: data.addressId?.zipCode || data.address?.zipCode || "",
      });
      setImages(data.images || []);
    } catch (error) {
      console.error("Error fetching property:", error);
    } finally {
      setLoading(false);
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

    const updatedProperty = {
      ...property,
      title: titleForm.title,
      description: titleForm.description,
      address: { ...addressForm },
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      bedrooms: roomsForm.bedrooms,
      bathrooms: roomsForm.bathrooms,
      kitchen: roomsForm.kitchen,
      amenities: roomsForm.amenities, // Include updated amenities
    };

    const formData = new FormData();
    formData.append("title", updatedProperty.title);
    formData.append("description", updatedProperty.description);
    formData.append("addressId", updatedProperty.addressId?._id || "");
    formData.append("address", JSON.stringify(updatedProperty.address));
    formData.append("price", updatedProperty.price || "");
    formData.append("maxGuest", updatedProperty.maxGuest || "");
    formData.append("bedrooms", updatedProperty.bedrooms);
    formData.append("bathrooms", updatedProperty.bathrooms);
    formData.append("kitchen", updatedProperty.kitchen);
    formData.append("longitude", updatedProperty.longitude);
    formData.append("latitude", updatedProperty.latitude);
    updatedProperty.amenities.forEach((amenity) =>
      formData.append("amenities[]", amenity)
    ); // Append amenities as array

    try {
      const response = await axios.put(
        `http://localhost:8000/api/edit/property/${id}`, // Updated endpoint to match your editProperty route
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Update API Response:", response.data);

      // Refetch the full property to ensure we get the updated data
      await fetchProperty();
      alert("Property updated successfully!");
    } catch (error) {
      console.error(
        "Error updating property:",
        error.response?.data || error.message
      );
      alert("Error updating property!");
    }
  };

  const handleDelete = async (imagePath) => {
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
      }
    } catch (error) {
      console.error(
        "Error deleting image:",
        error.response?.data || error.message
      );
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
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const [isPropertyActive, setIsPropertyActive] = useState(false);

  const handleToggle = () => {
    setIsPropertyActive(!isPropertyActive);
  };

  if (loading) return <div>Loading...</div>;
  if (!property) return <div>Property not found</div>;

  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8 flex flex-col h-screen">
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
              onClick={handleToggle}
            >
              {/* Icon */}
              <FiHome className="h-6 w-6 text-gray-700" />

              {/* Text Label */}
              <span className="text-base font-semibold text-gray-800 flex-1">
                {isPropertyActive ? "Property: Active" : "Property: Inactive"}
              </span>

              {/* Toggle Switch */}
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
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Room and Amenties </h2>
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
              Edit Title & Description
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
                  className="w-full h-72 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={titleForm.description}
                ></textarea>
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
                    State
                  </label>
                  <input
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        province_id: e.target.value,
                      }))
                    }
                    value={addressForm.province_id}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
