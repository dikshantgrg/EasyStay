import React, { useState, useEffect } from "react";
import axios from "axios";
import GovtIDViewer from "./GovtIDViewer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "./Pagination";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";

const RequestToBeHost = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8000/users/host-approval",
        {
          params: {
            search: searchTerm.trim() || undefined,
            page,
            limit,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers(response.data.users);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, limit]);

  const handleStatusChange = async (e, userId) => {
    const newStatus = e.target.value;
    try {
      const response = await axios.put(
        `http://localhost:8000/host-approval`,
        {
          userId,
          action: newStatus === "approved" ? "approve" : "reject",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success(`User status updated to "${newStatus}" successfully!`);
      await fetchUsers();
    } catch (error) {
      console.error("Error updating status:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update user status. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleLimitChange = (e) => setLimit(parseInt(e.target.value));
  const handlePageChange = (newPage) => setPage(newPage);

  const handleOpenModal = (id) => {
    setItemIdToDelete(id);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setItemIdToDelete(null);
  };

  return (
    <div className="ml-64 w-[calc(100%-16rem)] p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">
        ID Verification Requests for Hosts
      </h2>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="w-full lg:w-2/4">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-sm rounded-lg border">
          <thead className="bg-gray-200 text-sm">
            <tr className="text-left">
              <th className="p-3 font-medium">User ID</th>
              <th className="p-3 font-medium">First Name</th>
              <th className="p-3 font-medium">Last Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Phone</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">ID Type</th>
              <th className="p-3 font-medium">ID Verification</th>
              <th className="p-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="border-b even:bg-gray-50">
                  <td className="p-3">{user.UserId}</td>
                  <td className="p-3">{user.FirstName}</td>
                  <td className="p-3">{user.LastName}</td>
                  <td className="p-3">{user.Email}</td>
                  <td className="p-3">{user.phoneNumber}</td>
                  <td className="p-3">
                    <select
                      value={user.hostApprovalStatus}
                      onChange={(e) => handleStatusChange(e, user._id)}
                      className="block w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="p-3">{user.govtId?.type || "N/A"}</td>
                  <td className="p-3">
                    <GovtIDViewer govtId={user.govtId} />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      onClick={() => navigate(`/user-info/${user._id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No verification requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        <div>
          <select
            id="limit"
            value={limit}
            onChange={handleLimitChange}
            className="w-full p-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default RequestToBeHost;
