import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListingRequest = () => {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingStates, setLoadingStates] = useState({}); // Track loading per property

  // Function to fetch properties
  const fetchProperties = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/admin/pending-approval",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProperties(response.data.properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to fetch properties. Please try again later.");
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = async (propertyId, newStatus, hostId) => {
    const status = newStatus.toLowerCase();

    // Set loading state for this property
    setLoadingStates((prev) => ({ ...prev, [propertyId]: true }));

    try {
      const response = await axios.put(
        `http://localhost:8000/api/admin/property-status/${propertyId}`,
        {
          hostId: hostId,
          status: status,
        }
      );

      if (response.data.message) {
        toast.success(response.data.message);
      }

      // Refetch properties after successful update
      await fetchProperties();
    } catch (error) {
      console.error("Error updating property status:", error.response || error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update property status. Please try again.";
      toast.error(errorMessage);

      // Optionally refetch on error to ensure UI reflects server state
      await fetchProperties();
    } finally {
      setLoadingStates((prev) => ({ ...prev, [propertyId]: false })); // Reset loading
    }
  };

  const filteredProperties = properties.filter((property) =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-8xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pending Listings</h1>
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400 text-xl" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Property</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr key={property._id} className="hover:bg-gray-50 transition-colors">
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
                        <div className="text-sm font-medium text-gray-900">{property.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {property.addressId.city || "N/A"}, {property.addressId.street || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-blue-600">
                      ${property.price.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={property.status || "pending"}
                      onChange={(e) =>
                        handleStatusChange(property._id, e.target.value, property.hostId)
                      }
                      disabled={loadingStates[property._id]} // Disable during loading
                      className={`px-3 py-1 rounded-full text-sm font-medium border border-gray-300 bg-white ${
                        loadingStates[property._id] ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="pending" className="text-yellow-800">Pending</option>
                      <option value="approved" className="text-green-800">Approved</option>
                      <option value="rejected" className="text-red-800">Rejected</option>
                    </select>
                    {loadingStates[property._id] && (
                      <span className="ml-2 text-sm text-gray-500">Updating...</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap relative">
                    <button className="px-3 py-1 rounded-full text-sm font-medium border border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-200">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProperties.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-24 text-center text-gray-500">
                    No properties found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ListingRequest;