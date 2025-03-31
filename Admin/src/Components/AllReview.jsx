import React, { useState, useEffect } from "react";
import axios from "axios";
import GovtIDViewer from "./GovtIDViewer";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

const AllReview = () => {
  const [reviews,     setReview] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReview();
  }, []);

  const fetchReview = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/admin/property-review");
        setReview(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users. Please try again later."); // Toast for fetch error
    } finally {
      setLoading(false);
    }
  };

 
  const filteredUsers = users.filter((user) =>
    (roleFilter === "" || user.role === roleFilter) &&
    (Object.values(user).some(
      (val) =>
        typeof val === "string" &&
        val.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
      (user.govtId &&
        Object.values(user.govtId).some(
          (val) =>
            typeof val === "string" &&
            val.toLowerCase().includes(searchTerm.toLowerCase())
        )))
  );

  return (
    <div className="w-full max-w-8xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6">Pending to be Host</h2>
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-2/3 p-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-1/3 p-2 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="host">Host</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-sm rounded-lg border">
          <thead className="bg-gray-200 text-sm">
            <tr className="text-left">
              <th className="p-3">First Name</th>
              <th className="p-3">Last Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Approval</th>
              <th className="p-3">GovtID Type</th>
              <th className="p-3">GovtID Image</th>
              <th className="p-3">View</th>
              <th className="p-3">Delete</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (

                
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-b even:bg-gray-50">
                  <td className="p-2">{user.FirstName}</td>
                  <td className="p-2">{user.LastName}</td>
                  <td className="p-2">{user.Email}</td>
                  <td className="p-2">{user.phoneNumber}</td>
                  <td className="p-2">
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
                  <td className="p-2">{user.govtId?.type || "N/A"}</td>
                  <td className="p-2">
                    <GovtIDViewer govtId={user.govtId} />
                  </td>
                  <td className="p-2 text-blue-400 cursor-pointer hover:text-blue-600">
                    View
                  </td>
                  <td className="p-2 text-red-500 cursor-pointer hover:text-red-700">
                    Delete
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Toast container for displaying messages */}
      <ToastContainer />
    </div>
  );
};

export default AllReview;