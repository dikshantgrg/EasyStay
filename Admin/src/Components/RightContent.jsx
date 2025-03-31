import React, { useState } from "react";

const RightContent = () => {
  const [users] = useState([
    {
      FirstName: "John",
      LastName: "Doe",
      Email: "johndoe@example.com",
      role: "user",
      phoneNumber: "1234567890",
      hostApprovalStatus: "pending",
      govtId: { type: "passport", front: "#", back: "#" },
    },
    {
      FirstName: "Jane",
      LastName: "Smith",
      Email: "janesmith@example.com",
      role: "host",
      phoneNumber: "0987654321",
      hostApprovalStatus: "approved",
      govtId: { type: "driverLicense", front: "#", back: "#" },
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const filteredUsers = users.filter((user) =>
    (roleFilter === "" || user.role === roleFilter) &&
    (Object.values(user).some(
      (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
      (user.govtId &&
        Object.values(user.govtId).some(
          (val) => typeof val === "string" && val.toLowerCase().includes(searchTerm.toLowerCase())
        )))
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6">User Management</h2>
      
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
              <th className="p-3">Role</th>
              <th className="p-3">Phone</th>
              <th className="p-3">View</th>
              <th className="p-3">Delete</th>
             
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={index} className="border-b even:bg-gray-50">
                  <td className="p-2">{user.FirstName}</td>
                  <td className="p-2">{user.LastName}</td>
                  <td className="p-2">{user.Email}</td>
                  <td className="p-2">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-lg ${
                        user.role === "host" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-2">{user.phoneNumber}</td>
                  <td className="p-2 text-blue-400">View</td>
                  <td className="p-2 text-red-500">Delete</td>
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
    </div>
  );
};

export default RightContent;
