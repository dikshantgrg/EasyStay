import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { IoIosArrowBack } from "react-icons/io";

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/user-info/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ); 
        console.log("User Info Response:", response.data);
        setUser(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  
  if (loading) {
    return (
      <div className="ml-64 w-[calc(100%-16rem)] p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="ml-64 w-[calc(100%-16rem)] p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || "No user data available"}</div>
      </div>
    );
  }

  return (
    <div className="ml-64 w-[calc(100%-16rem)] p-6 bg-gray-100 min-h-screen">
      {/* Go Back Button */}
      <button
        onClick={() => navigate(-1)} // Navigate back to the previous page
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <IoIosArrowBack   className="w-5 h-5 mr-2"/>
       
        Go Back
      </button>

      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-2xl font-bold">
          {user.profileImage ? (
            <img
              src={`http://localhost:8000/${user.profileImage}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            `${user.FirstName.charAt(0)}${user.LastName.charAt(0)}`
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {user.FirstName} {user.LastName}
          </h1>
          <p className="text-gray-600">{user.Email}</p>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              user.IdVerfication === "approved"
                ? "bg-green-100 text-green-800"
                : user.IdVerfication === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {user.IdVerfication
              ? user.IdVerfication.charAt(0).toUpperCase() +
                user.IdVerfication.slice(1)
              : "Not Verified"}
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h2 className="font-semibold mb-2 text-lg">Basic Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Phone:</span>{" "}
              {user.phoneNumber || "Not provided"}
            </p>
            <p>
              <span className="font-medium">Role:</span>{" "}
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
            <p>
              <span className="font-medium">Joined:</span>{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {user.role === "host" && user.govtId && (
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="font-semibold mb-2 text-lg">Host Verification</h2>
            <div className="space-y-4">
              <div>
                <p>
                  <span className="font-medium">ID Type:</span>{" "}
                  {user.govtId.type
                    ? user.govtId.type.charAt(0).toUpperCase() +
                      user.govtId.type.slice(1)
                    : "Not provided"}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.govtId.front && (
                  <div className="p-2 bg-gray-50 rounded border">
                    <p className="text-sm font-medium mb-1">Front</p>
                    <img
                      src={`http://localhost:8000/${user.govtId.front}`}
                      alt="ID Front"
                      className="w-full h-40 object-contain rounded"
                    />
                  </div>
                )}
                {user.govtId.back && (
                  <div className="p-2 bg-gray-50 rounded border">
                    <p className="text-sm font-medium mb-1">Back</p>
                    <img
                      src={`http://localhost:8000/${user.govtId.back}`}
                      alt="ID Back"
                      className="w-full h-40 object-contain rounded"
                    />
                  </div>
                )}
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  user.IdVerfication === "approved"
                    ? "bg-green-100 text-green-800"
                    : user.IdVerfication === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {user.IdVerfication === "approved"
                  ? "ID Verified"
                  : user.IdVerfication === "rejected"
                  ? "ID Rejected"
                  : "ID Verification Pending"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;