import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "./Pagination";
import ConfirmationModal from "./ConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import { IoIosSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const AllBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Added search term state
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/admin/bookings",
        {
          params: {
            search: searchTerm.trim() || undefined, // Added search term
            status: statusFilter || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            sortBy: sortBy || undefined,
            sortOrder: sortOrder || undefined,
            page,
            limit: pageSize,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const { data: bookings, pagination } = response.data;
      setBookings(bookings);
      setPage(pagination.currentPage);
      setPageSize(pagination.limit || pageSize);
      setTotalBookings(pagination.totalBookings);
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(timer);
  }, [
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    page,
    pageSize,
  ]);

  useEffect(() => {
    setPage(1); // Reset to first page when filters change
  }, [
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    pageSize,
  ]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value); // Added handler
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);
  const handleSortByChange = (e) => setSortBy(e.target.value);
  const handleSortOrderChange = (e) => setSortOrder(e.target.value);
  const handlePageSizeChange = (e) => setPageSize(parseInt(e.target.value));
  const handlePageChange = (newPage) => setPage(newPage);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleOpenModal = (id) => {
    setItemIdToDelete(id);
    setIsModalOpen(true);
  };

  // Delete user
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:8000/api/admin/delete-booking/${itemIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("User deleted successfully!");
      setBookings(
        bookings.filter((bookings) => bookings._id !== itemIdToDelete)
      );
    } catch (error) {
      console.error(
        "Error deleting user:",
        error.response?.data || error.message
      );
      toast.error("Failed to delete user. Please try again.");
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
      <h2 className="text-3xl font-bold mb-6">Booking Management</h2>

      {/* Search and Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        {/* Search Bar */}
        <div className="mb-4">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search Bookings
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoIosSearch />
            </div>
            <input
              id="search"
              type="text"
              placeholder="Search by user, property, or booking ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label
                htmlFor="sortBy"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sort By
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={handleSortByChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Created At</option>
                <option value="totalPrice">Price</option>
              </select>
            </div>
            <div className="flex-1">
              <label
                htmlFor="sortOrder"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Order
              </label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={handleSortOrderChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-sm rounded-lg border">
          <thead className="bg-gray-200 text-sm">
            <tr className="text-left">
              <th className="p-3 font-medium">Booking ID</th>
              <th className="p-3 font-medium">Booked by</th>
              <th className="p-3 font-medium">Booked Property</th>
              <th className="p-3 font-medium">No of Guest</th>
              <th className="p-3 font-medium">Total Amount</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Created At</th>
              <th className="p-3 font-medium text-center">View</th>
              <th className="p-3 font-medium text-center">Delete</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking._id} className="border-b even:bg-gray-50">
                  <td className="p-3">{booking.bookingId}</td>
                  <td className="p-3 flex-row items-center ">
                    {booking.userId?.FirstName} {booking.userId?.LastName} {""}(
                    {booking.userId?.UserId})
                  </td>

                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[200px]" title={booking.propertyId?.title}>
                        {booking.propertyId?.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        PropertyID: {booking.propertyId?.propertyId}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 flex items-center">
                    {booking.totalGuest}
                  </td>

                  <td className="p-3">Rs {booking.totalPrice}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-lg ${
                        booking.status === "active"
                          ? "bg-green-100 text-green-600"
                          : booking.status === "upcoming"
                          ? "bg-yellow-100 text-yellow-600"
                          : booking.status === "completed"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-3">{formatDate(booking.createdAt)}</td>
                  <td className="p-3 text-blue-400 text-center">
                    <button
                      onClick={() =>
                        navigate(`/booking/details/${booking.bookingId}`)
                      }
                    >
                      View
                    </button>
                  </td>
                  <td className="p-3 text-red-500 text-center">
                    {" "}
                    <button onClick={() => handleOpenModal(booking._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="mb-6 flex justify-between items-center">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            disabled={loading}
          />
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="p-2 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="10">10/ page</option>
            <option value="20">20/ page</option>
            <option value="50">50/ page</option>
          </select>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        message="Are you sure you want to delete this user?"
        onConfirm={handleDelete}
        onCancel={handleCancel}
        isDeleting={isDeleting} // Pass isDeleting to disable button
      />
      <ToastContainer />
    </div>
  );
};

export default AllBooking;
