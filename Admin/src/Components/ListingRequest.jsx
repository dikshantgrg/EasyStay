import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "./Pagination";
import { useNavigate } from "react-router-dom";

const ListingRequest = () => {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt"); // Default sort by createdAt
  const [sortOrder, setSortOrder] = useState("desc"); // Default descending
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const navigate = useNavigate();

  // Function to fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/admin/pending-approval",
        {
          params: {
            searchTerm,
            sortBy,
            sortOrder,
            page,
            pageSize,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Response:", response); // Log the response data

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
  }, [searchTerm, sortBy, sortOrder, page, pageSize]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleStatusChange = async (propertyId, newStatus, hostId) => {
    const status = newStatus.toLowerCase();
    setLoadingStates((prev) => ({ ...prev, [propertyId]: true }));

    try {
      const response = await axios.put(
        `http://localhost:8000/api/admin/property-status/${propertyId}`,
        {
          hostId: hostId._id, // Send hostId as ObjectId string
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(response.data.message || "Status updated successfully!");
      await fetchProperties();
    } catch (error) {
      console.error("Error updating property status:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update property status. Please try again.";
      toast.error(errorMessage);
      await fetchProperties();
    } finally {
      setLoadingStates((prev) => ({ ...prev, [propertyId]: false }));
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="ml-64 w-[calc(100%-16rem)] p-6 bg-gray-100 min-h-screen">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pending Listings
          </h1>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by property ID, host ID, or city..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400 text-xl" />
            </div>
            <select
              value={sortBy}
              onChange={handleSortByChange}
              className="w-40 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Sort by Created At</option>
              <option value="price">Sort by Price</option>
              <option value="title">Sort by Title</option>
            </select>
            <select
              value={sortOrder}
              onChange={handleSortOrderChange}
              className="w-32 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
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

        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
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
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
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
                        {property.hostId?.FirstName || "N/A"}{" "}
                        {property.hostId?.LastName || "N/A"} (
                        {property.hostId?.UserId || "N/A"})
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
                      <select
                        value={property.status || "pending"}
                        onChange={(e) =>
                          handleStatusChange(
                            property._id,
                            e.target.value,
                            property.hostId
                          )
                        }
                        disabled={loadingStates[property._id]}
                        className={`px-3 py-1 rounded-full text-sm font-medium border border-gray-300 bg-white ${
                          loadingStates[property._id]
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="pending" className="text-yellow-800">
                          Pending
                        </option>
                        <option value="approved" className="text-green-800">
                          Approved
                        </option>
                        <option value="rejected" className="text-red-800">
                          Rejected
                        </option>
                      </select>
                      {loadingStates[property._id] && (
                        <span className="ml-2 text-sm text-gray-500">
                          Updating...
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="px-3 py-1 rounded-full text-sm font-medium border border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-200"
                        onClick={() => navigate(`/property/${property._id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-24 text-center text-gray-500"
                  >
                    No pending properties found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, total)} of {total} properties
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disabled={loading}
            />
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default ListingRequest;
