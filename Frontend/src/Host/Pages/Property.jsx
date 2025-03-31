import React, { useState } from "react";
import { useEffect } from "react";
import { IoMdApps, IoMdAdd, IoIosList } from "react-icons/io";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Property = () => {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/properties/host",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProperties(response.data.properties);
      } catch (error) {
        console.error("Error fetching properties:", error);
        // Handle the error accordingly, for example:
        alert("Failed to fetch properties. Please try again later.");
      }
    };

    fetchProperties();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProperties = properties.filter((properties) =>
    properties.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (property) => {
    setEditProperty(property.id);
    setNewName(property.name);
    setNewDescription(property.description);
  };

  const handleSaveEdit = () => {
    const updatedProperties = properties.map((property) =>
      property.id === editProperty
        ? { ...property, name: newName, description: newDescription }
        : property
    );
    setProperties(updatedProperties);
    setEditProperty(null);
  };

  return (
    <div className="max-w-7xl mx-auto  py-8 mt-2">
      <h1 className="text-3xl font-semibold text-gray-800">Your Properties</h1>

      {/* Search bar & View toggle */}
      <div className="my-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search for a property"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full sm:flex-1 px-4 py-3 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
             placeholder-gray-400 transition-all"
        />

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "card" : "list")}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full 
               transition-colors duration-200 focus:outline-none 
               focus:ring-2 focus:ring-blue-500"
            aria-label={
              viewMode === "list"
                ? "Switch to card view"
                : "Switch to list view"
            }
          >
            {viewMode === "list" ? (
              <IoIosList className="text-2xl text-gray-700" />
            ) : (
              <IoMdApps className="text-2xl text-gray-700" />
            )}
          </button>

          <button
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full 
               transition-colors duration-200 focus:outline-none 
               focus:ring-2 focus:ring-blue-500"
            aria-label="Add new property"
          >
            <IoMdAdd className="text-2xl text-gray-700" />
          </button>
        </div>
      </div>

      {/* Properties Display */}
      {viewMode === "list" ? (
        <div className="mt-10">
          <div className="flex flex-col gap-6">
            {/* Header - Aligned with content columns */}
            <div className="hidden md:flex justify-between items-center px-4">
              <div className="md:w-[400px] flex-shrink-0">
                {" "}
                {/* Match image/title container width */}
                <span className="text-lg font-semibold">Property</span>
              </div>
              <div className="grid grid-cols-4 flex-1 md:gap-4 lg:gap-6 xl:gap-8">
                {" "}
                {/* Match card gaps */}
                <span className="text-base text-center">Location</span>
                <span className="text-base text-center">Price</span>
                <span className="text-base text-center">Status</span>
                <span className="text-base text-center">Actions</span>
              </div>
            </div>

            {/* Property Cards */}
            {filteredProperties.map((el) => (
              <div className="flex flex-col md:flex-row justify-between items-start p-4 rounded-lg border hover:bg-gray-50 transition-all gap-4 md:gap-0">
                {/* Image/Title Section */}
                <div className="flex gap-4 items-center w-full md:flex-1 md:max-w-[400px]">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 bg-slate-500 rounded-xl overflow-hidden">
                    <img
                      src={`http://localhost:8000/${el.images[0]}`}
                      alt={el.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h1 className="text-base sm:text-lg font-medium line-clamp-2 flex-1">
                    {el.title}
                  </h1>
                </div>

                {/* Details Grid */}
                <div className="w-full md:flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-4 lg:gap-6 xl:gap-8">
                  {/* Location */}
                  <div className="flex items-center justify-center">
                    <span className="text-sm md:text-base line-clamp-1 text-center">
                      {el.addressId.city}, {el.addressId.street}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-center">
                    <span className="text-sm md:text-base font-medium">
                      ${el.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-center">
                    <span
                      className={`text-sm md:text-base px-3 py-1 rounded-full min-w-[100px] text-center ${
                        el.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : el.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {el.status === "pending"
                        ? "Pending"
                        : el.status === "approved"
                        ? "Active"
                        : "Rejected"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Link
                      to={`/host/property/${el._id}`}
                      key={el._id}
                      // onClick={(e) => {
                      //   navigate.to(`/host/property/${el._id}`);
                      // }}
                      className="text-center text-sm md:text-base font-medium px-2 py-1.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 whitespace-nowrap w-full min-w-[100px]"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/host/property/reviews/${el._id}`}
                      key={el._id}
                      // onClick={(e) => {
                      //   navigate.to(`/bookings/review`);
                      // }}
                      className="text-center text-sm md:text-base font-medium px-4 py-1.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 whitespace-nowrap w-full min-w-[120px]"
                    >
                      View Review
                    </Link>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
          {filteredProperties.map((el) => (
            <div className="group relative border-2 border-gray-200 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:scale-105">
              {/* Image with overlay effect */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={`http://localhost:8000/${el.images[0]}`}
                  alt="Property image"
                  className=" w-full h-full object-cover transition-transform duration-500 group-hover:scale-100"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/20" />
              </div>

              <div className="p-4">
                {/* Title and location */}
                <div className="">
                  <h3 className="text-xl font-semibold text-gray-800 transition-colors group-hover:text-blue-600">
                    {el.title}
                  </h3>
                  <div className="flex items-center text-gray-600 ">
                    <span className="text-sm">
                      {" "}
                      {el.addressId.city}, {el.addressId.street}
                    </span>
                  </div>
                </div>

                <div className="mt- flex items-center justify-between">
                  <p className="text-lg font-bold text-blue-600">
                    {el.price}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      /night
                    </span>
                  </p>
                </div>
              </div>

              {/* Favorite button */}
              <button
                className={`absolute top-4 right-4 p-2 rounded-full shadow-sm transition-colors hover:bg-white 
    ${el.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
  `}
              >
                {el.is_active ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Property;
