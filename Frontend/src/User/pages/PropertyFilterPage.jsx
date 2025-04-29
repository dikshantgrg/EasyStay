import React, { useState, useEffect } from "react";

import SearchBar from "../Components/SearchBar";
import moment from "moment";
import { useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
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
  FaWheelchair,
  FaBabyCarriage,
  FaShower,
  FaBath,
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
import { FiPlus, FiMinus } from "react-icons/fi";
import Property from "../Components/Property";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  { name: "Wheelchair Accessible", icon: FaWheelchair },
  { name: "Baby Stroller", icon: FaBabyCarriage },
  { name: "Shower", icon: FaShower },
  { name: "Bathtub", icon: FaBath },
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

const PropertyFilterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSearchParams = location.state || {};

  const [filters, setFilters] = useState({
    priceMin: "",
    priceMax: "",
    amenities: [],
    bedrooms: 0,
    bathrooms: 0,
    location: initialSearchParams.destination || "",
    checkIn: initialSearchParams.checkIn
      ? new Date(initialSearchParams.checkIn)
      : null,
    checkOut: initialSearchParams.checkOut
      ? new Date(initialSearchParams.checkOut)
      : null,
    guests: initialSearchParams.guests || "1",
    propertyType: "",
    sortOrder: "none", // Add sort order
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setpageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState([]); // Added state for property types

  // Fetch property types
  const fetchPropertyTypes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/get/property-type",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setPropertyTypes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching property types:", error);
      toast.error("Failed to fetch property types");
      setPropertyTypes([]);
    }
  };

  // Fetch properties
  const fetchProperties = async (
    currentPage = page,
    updatedFilters = filters
  ) => {
    setIsLoading(true);
    try {
      const query = {
        searchTerm: updatedFilters.location,
        minPrice: updatedFilters.priceMin || undefined,
        maxPrice: updatedFilters.priceMax || undefined,
        bedrooms: updatedFilters.bedrooms || undefined,
        bathrooms: updatedFilters.bathrooms || undefined,
        amenities:
          updatedFilters.amenities.length > 0
            ? updatedFilters.amenities.join(",")
            : undefined,
        propertyType: updatedFilters.propertyType || undefined, // Added propertyType
        page: currentPage,
        pageSize,
        checkIn: updatedFilters.checkIn
          ? moment(updatedFilters.checkIn).format("YYYY-MM-DD")
          : undefined,
        checkOut: updatedFilters.checkOut
          ? moment(updatedFilters.checkOut).format("YYYY-MM-DD")
          : undefined,
        guests: updatedFilters.guests || undefined,
        sortOrder: updatedFilters.sortOrder || undefined, // Sort parameter is included
      };

      const response = await axios.get("http://localhost:8000/api/search", {
        params: query,
      });
      console.log(response);
      setProperties(response.data.properties || []);
      setTotalProperties(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
      setTotalProperties(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch property types on mount
  useEffect(() => {
    fetchPropertyTypes();
    fetchProperties();
  }, []);

  // Sync filters with location.state and fetch properties on mount or state change
  useEffect(() => {
    const newSearchParams = location.state || {};
    const updatedFilters = {
      ...filters,
      location: newSearchParams.destination || filters.location || "",
      checkIn: newSearchParams.checkIn
        ? new Date(newSearchParams.checkIn)
        : filters.checkIn,
      checkOut: newSearchParams.checkOut
        ? new Date(newSearchParams.checkOut)
        : filters.checkOut,
      guests: newSearchParams.guests || filters.guests || "1",
    };
    setFilters(updatedFilters);

    // Only fetch if there's a destination
    if (updatedFilters.location) {
      fetchProperties(1, updatedFilters);
    }
  }, [location.state]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => {
      if (type === "checkbox") {
        if (name === "amenities") {
          return {
            ...prev,
            amenities: checked
              ? [...prev.amenities, value]
              : prev.amenities.filter((amenity) => amenity !== value),
          };
        }
        if (name === "selectAll") {
          return {
            ...prev,
            amenities: checked ? amenitiesList.map((a) => a.name) : [],
          };
        }
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSearchChange = (
    e,
    { destination, checkIn, checkOut, guests }
  ) => {
    e.preventDefault();
    const updatedFilters = {
      ...filters,
      location: destination,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      guests: guests || "1",
    };
    setFilters(updatedFilters);
    setPage(1);
    fetchProperties(1, updatedFilters);

    // Update location.state to ensure consistency
    navigate("/properties", {
      state: {
        destination,
        checkIn: checkIn ? moment(checkIn).format("YYYY-MM-DD") : null,
        checkOut: checkOut ? moment(checkOut).format("YYYY-MM-DD") : null,
        guests,
      },
      replace: true,
    });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProperties(1, filters);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    const resetFilters = {
      priceMin: "",
      priceMax: "",
      amenities: [],
      bedrooms: "",
      bathrooms: "",
      location: filters.location,
      checkIn: filters.checkIn,
      checkOut: filters.checkOut,
      guests: filters.guests,
      propertyType: "",
      sortOrder: "none", // Reset sort order
    };
    setFilters(resetFilters);
    setPage(1);
    fetchProperties(1, resetFilters);
    setIsFilterOpen(false);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalProperties / pageSize);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchProperties(newPage, filters);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-gray-50 w-full">
      <div className="w-full mt-5 flex items-center justify-center ">
        <SearchBar
          mode="full"
          onSearch={handleSearchChange}
          initialDestination={filters.location}
          initialCheckIn={filters.checkIn}
          initialCheckOut={filters.checkOut}
          initialGuests={filters.guests}
        />
      </div>
      <div className="max-w-full px-2 sm:px-4 md:max-w-7xl md:px-6 lg:px-0 mx-auto">
        <div className="flex flex-col md:flex-row gap-6 py-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden fixed top-4 left-4 z-20 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isFilterOpen ? "Close filters" : "Open filters"}
          >
            {isFilterOpen ? "✕" : "☰"}
          </button>

          <aside
            className={`bg-white shadow-md p-6 transition-all duration-300 ease-in-out ${
              isFilterOpen
                ? "fixed inset-y-0 left-0 w-3/4 z-20 overflow-y-auto"
                : "hidden"
            } md:block md:w-80 md:h-fit md:sticky md:top-4`}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Filters
            </h2>
            <form onSubmit={applyFilters} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  {propertyTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By Price
                </label>
                <select
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">Default</option>
                  <option value="asc">Price: Low to High</option>
                  <option value="desc">Price: High to Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1 flex flex-col gap-1">
                    <label
                      htmlFor="priceMin"
                      className="text-sm text-gray-600 font-medium"
                    >
                      Min
                    </label>
                    <input
                      id="priceMin"
                      type="number"
                      name="priceMin"
                      value={filters.priceMin}
                      onChange={handleFilterChange}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label="Minimum price"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <label
                      htmlFor="priceMax"
                      className="text-sm text-gray-600 font-medium"
                    >
                      Max
                    </label>
                    <input
                      id="priceMax"
                      type="number"
                      name="priceMax"
                      value={filters.priceMax}
                      onChange={handleFilterChange}
                      placeholder="Any"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label="Maximum price"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border p-3 rounded-md bg-gray-50">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="selectAll"
                      checked={
                        filters.amenities.length === amenitiesList.length
                      }
                      onChange={handleFilterChange}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-800">Select All</span>
                  </label>
                  {amenitiesList.map((amenity) => (
                    <label key={amenity.name} className="flex items-center">
                      <input
                        type="checkbox"
                        name="amenities"
                        value={amenity.name}
                        checked={filters.amenities.includes(amenity.name)}
                        onChange={handleFilterChange}
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-800">
                        {amenity.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="bedrooms"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Rooms & Spaces
                </label>
                <div className="flex flex-col items-start space-y-4 text-sm">
                  <div className="flex items-center gap-4 w-full">
                    <span className="w-24 text-left">Bedrooms</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            bedrooms: Math.max(
                              0,
                              Number(prev.bedrooms || 0) - 1
                            ).toString(),
                          }))
                        }
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full text-lg hover:bg-gray-300"
                        aria-label="Decrease bedrooms"
                      >
                        <FiMinus />
                      </button>
                      <span
                        id="bedrooms"
                        className="w-12 p-2 text-sm text-center rounded-md"
                      >
                        {filters.bedrooms}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            bedrooms: Math.min(
                              10,
                              Number(prev.bedrooms || 0) + 1
                            ).toString(),
                          }))
                        }
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full text-lg hover:bg-gray-300"
                        aria-label="Increase bedrooms"
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full">
                    <span className="w-24 text-left">Bathrooms</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            bathrooms: Math.max(
                              0,
                              Number(prev.bathrooms || 0) - 1
                            ).toString(),
                          }))
                        }
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full text-lg hover:bg-gray-300"
                        aria-label="Decrease bathrooms"
                      >
                        <FiMinus />
                      </button>
                      <span
                        id="bathrooms"
                        className="w-12 p-2 text-sm text-center rounded-md"
                      >
                        {filters.bathrooms}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            bathrooms: Math.min(
                              10,
                              Number(prev.bathrooms || 0) + 1
                            ).toString(),
                          }))
                        }
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full text-lg hover:bg-gray-300"
                        aria-label="Increase bathrooms"
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 p-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                >
                  Clear Filters
                </button>
                <button
                  type="submit"
                  className="flex-1 p-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          </aside>

          {isFilterOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={() => setIsFilterOpen(false)}
              aria-hidden="true"
            />
          )}

          <main className="flex-1">
            <div className="flex justify-between items-center mb-6 mt-6">
              <h1 className="text-3xl font-bold text-gray-800">Properties</h1>
              <span className="text-gray-600">
                {totalProperties}{" "}
                {totalProperties === 1 ? "property" : "properties"} found
              </span>
            </div>

            {isLoading ? (
              <p className="text-gray-500 text-center col-span-full py-10">
                Loading properties...
              </p>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {properties.map((property) => (
                  <Link
                    to={`/property/${property._id}`}
                    key={property._id}
                    state={{ fromFilters: filters }}
                  >
                    <Property
                      id={property._id}
                      title={property.title}
                      image={
                        property.images &&
                        Array.isArray(property.images) &&
                        property.images.length > 0
                          ? property.images[0]
                          : null
                      }
                      city={property.addressId?.city || "Unknown City"}
                      street={property.addressId?.street || "Unknown Street"}
                      price={`${property.price.toLocaleString()}`}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center col-span-full py-10">
                No properties match your criteria. Try adjusting your filters.
              </p>
            )}

            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(page - 1)}
                    className={
                      page === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* Show first page */}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(1)}
                    isActive={page === 1}
                    className={page === 1 ? "bg-blue-100" : "cursor-pointer"}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {/* Show ellipsis if needed before current page */}
                {page > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Show pages around current page */}
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    pageNum !== 1 &&
                    pageNum !== totalPages &&
                    pageNum >= page - 1 &&
                    pageNum <= page + 1
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={page === pageNum}
                          className={
                            page === pageNum ? "bg-blue-100" : "cursor-pointer"
                          }
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                {/* Show ellipsis if needed after current page */}
                {page < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Show last page if not first page */}
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(totalPages)}
                      isActive={page === totalPages}
                      className={
                        page === totalPages ? "bg-blue-100" : "cursor-pointer"
                      }
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    className={
                      page >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilterPage;
