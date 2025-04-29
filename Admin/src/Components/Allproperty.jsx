import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "./Pagination";
import { format } from "date-fns";
import ConfirmationModal from "./ConfirmationModal";
import { useNavigate } from "react-router-dom";

const AllProperty = () => {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt"); // Default sort by createdAt
  const [sortOrder, setSortOrder] = useState("desc"); // Default descending
  const navigate = useNavigate();

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/admin/properties",
        {
          params: {
            searchTerm,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            status: statusFilter || undefined,
            page,
            pageSize,
            sortBy, // Add sortBy to query
            sortOrder, // Add sortOrder to query
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setProperties(response.data.properties);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to fetch properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, pageSize, searchTerm, minPrice, maxPrice, statusFilter, sortBy, sortOrder]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleMinPriceChange = (e) => {
    setMinPrice(e.target.value);
    setPage(1);
  };

  const handleMaxPriceChange = (e) => {
    setMaxPrice(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setPage(1);
  };

  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (isoDate) => {
    return format(new Date(isoDate), "MMMM d, yyyy 'at' HH:mm:ss 'UTC'");
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenModal = (id) => {
    setItemIdToDelete(id);
    setIsModalOpen(true);
  };

  // Delete property
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:8000/api/admin/delete-property/${itemIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Property deleted successfully!");
      setProperties(
        properties.filter((property) => property._id !== itemIdToDelete)
      );
      setTotal(total - 1);
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
      setItemIdToDelete(null);
    }
  };

  // Cancel deletion
  const handleCancel = () => {
    setIsModalOpen(false);
    setItemIdToDelete(null);
  };

  return (
    <div className="ml-64 w-[calc(100%-16rem)] p-6 bg-gray-100 min-h-screen">
      <div className="w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            All Properties
          </h1>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Properties
                </label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by property ID, host ID, or city..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                </div>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <div className="flex gap-2">
                    <div>
                      <input
                        type="number"
                        placeholder="Min Price"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={minPrice}
                        onChange={handleMinPriceChange}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Max Price"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={maxPrice}
                        onChange={handleMaxPriceChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="sortBy"
                      value={sortBy}
                      onChange={handleSortByChange}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="createdAt">Created At</option>
                      <option value="price">Price</option>
                    </select>
                    <select
                      id="sortOrder"
                      value={sortOrder}
                      onChange={handleSortOrderChange}
                      className="w-32 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Property
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Host
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Created At
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Active
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  View
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Delete
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-24 text-center text-gray-500"
                  >
                    Loading properties...
                  </td>
                </tr>
              ) : properties.length > 0 ? (
                properties.map((property) => (
                  <tr
                    key={property._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.propertyId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden">
                          <img
                            src={`http://localhost:8000/${property.images[0]}`}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {property.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.hostId?.UserId || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.addressId?.city || "N/A"},{" "}
                        {property.addressId?.street || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-blue-600">
                        Rs {property.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          property.status === "approved"
                            ? "border-green-300 bg-green-100 text-green-700"
                            : property.status === "pending"
                            ? "border-yellow-300 bg-yellow-100 text-yellow-700"
                            : "border-red-300 bg-red-100 text-red-700"
                        }`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {property.createdAt
                          ? formatDate(property.createdAt)
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          property.is_active
                            ? "border-green-300 bg-green-100 text-green-700"
                            : "border-red-300 bg-red-100 text-red-700"
                        }`}
                      >
                        {property.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="px-3 py-1 rounded-full text-sm font-medium border border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-200"
                        onClick={() => navigate(`/property/${property._id}`)}
                      >
                        View
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="px-3 py-1 rounded-full text-sm font-medium border border-red-300 bg-red-100 text-red-700 hover:bg-red-200"
                        onClick={() => handleOpenModal(property._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-24 text-center text-gray-500"
                  >
                    No properties found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

         
          <div className="mt-4 flex justify-between items-center">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disabled={loading}
            />

            <div >
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="w-32 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
            </div>

          </div>
        
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        message="Are you sure you want to delete this property?"
        onConfirm={handleDelete}
        onCancel={handleCancel}
        isDeleting={isDeleting}
      />
      <ToastContainer />
    </div>
  );
};

export default AllProperty;