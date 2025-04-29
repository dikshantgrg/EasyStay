import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "./Pagination";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";
import { toast, ToastContainer } from "react-toastify"; // Optional: for user notifications

const AllUser = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); 
  const navigate = useNavigate();

  // Fetch users from the backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/users", {
        params: {
          search: searchTerm.trim() || undefined,
          role: roleFilter || undefined,
          page,
          limit,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const { users, pages } = response.data;
      setUsers(users);
      setTotalPages(pages);
    } catch (error) {
      console.error(
        "Error fetching users:",
        error.response?.data || error.message
      );
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch on search, role, page, or limit change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, page, limit]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, limit]);

  // Handle input changes
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleRoleChange = (e) => setRoleFilter(e.target.value);
  const handleLimitChange = (e) => setLimit(parseInt(e.target.value));

  // Change page
  const handlePageChange = (newPage) => setPage(newPage);
  // Open confirmation modal
  const handleOpenModal = (id) => {
    setItemIdToDelete(id);
    setIsModalOpen(true);
  };

  // Delete user
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:8000/api/delete/user/${itemIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("User deleted successfully!");
      setUsers(users.filter((user) => user._id !== itemIdToDelete));
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
      <h2 className="text-3xl font-bold mb-6">User Management</h2>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="w-full lg:w-2/4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Users
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full lg:w-1/4">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Role
          </label>
          <select
            id="role"
            value={roleFilter}
            onChange={handleRoleChange}
            className="w-full p-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="host">Host</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-sm rounded-lg border">
          <thead className="bg-gray-200 text-sm">
            <tr className="text-left">
              <th className="p-3 font-medium">ID</th>
              <th className="p-3 font-medium">First Name</th>
              <th className="p-3 font-medium">Last Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Phone</th>
              <th className="p-3 font-medium text-center">View</th>
              <th className="p-3 font-medium text-center">Delete</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="border-b even:bg-gray-50">
                  <td className="p-3">{user.UserId}</td>
                  <td className="p-3">{user.FirstName}</td>
                  <td className="p-3">{user.LastName}</td>
                  <td className="p-3">{user.Email}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-3 py-1 text-sm font-semibold rounded-lg ${
                        user.role === "host"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3">{user.phoneNumber}</td>
                  <td
                    className="p-3 text-blue-400 text-center cursor-pointer hover:bg-blue-100 hover:underline"
                    onClick={() => navigate(`/user-info/${user._id}`)}
                  >
                    View
                  </td>
                  <td
                    className="p-3 text-red-500 text-center cursor-pointer hover:bg-red-100 hover:underline"
                    onClick={() => handleOpenModal(user._id)}
                  >
                    Delete
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        message="Are you sure you want to delete this user?"
        onConfirm={handleDelete}
        onCancel={handleCancel}
        isDeleting={isDeleting} 
      />
<div className="  p-4 rounded-lg shadow-sm flex items-center justify-between">
  <div className="flex items-center space-x-2">
    <label htmlFor="pageSize" className="text-sm font-medium text-gray-700">
      Show
    </label>
    <select
      id="pageSize"
      value={limit}
      onChange={handleLimitChange}
      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    >
      <option value="5">5</option>
      <option value="10">10</option>
      <option value="20">20</option>
      <option value="50">50</option>
    </select>
  
  </div>

  <Pagination
    page={page}
    totalPages={totalPages}
    onPageChange={handlePageChange}
    disabled={loading}
  />
</div>
      <ToastContainer />
    </div>
  );
};

export default AllUser;
