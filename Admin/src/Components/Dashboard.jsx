import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaHotel,
  FaMoneyBillWave,
  FaChartLine,
  FaRegBuilding,
  FaRegBookmark,
} from "react-icons/fa";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    totalHosts: 0,
    totalEarnings: 0,
    upcomingBookings:0,
    activeBookings:0,
    completedBookings:0

  });


  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fetchData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await axios.get(
        "http://localhost:8000/api/admin/dashboard-stats",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Log the response to inspect its structure
      console.log("Stats Response:", statsResponse.data);

      // Fetch recent bookings
      const bookingsResponse = await axios.get(
        "http://localhost:8000/api/admin/recent-bookings",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Bookings Response:", bookingsResponse.data);

      setDashboardData({
        totalUsers: statsResponse.data.data.totalUsers || 0,
        totalProperties: statsResponse.data.data.totalProperties || 0,
        totalBookings: statsResponse.data.data.totalBookings || 0,
        totalHosts: statsResponse.data.data.totalHosts || 0,
        totalEarnings: statsResponse.data.data.totalEarnings || 0,
        upcomingBookings: statsResponse.data.data.upcomingBookings || 0,
        activeBookings: statsResponse.data.data.activeBookings || 0,
        completedBookings: statsResponse.data.data.completedBookings || 0,})

      // Ensure recentBookings is an array
      const bookingsData = Array.isArray(bookingsResponse.data.data)
        ? bookingsResponse.data.data
        : [];
      setRecentBookings(bookingsData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setRecentBookings([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare data for Recharts
  // const chartData = [
  //   { name: "Upcoming", count: bookingsByStatus.upcoming, fill: "#FFC107" },
  //   { name: "Active", count: bookingsByStatus.active, fill: "#4CAF50" },
  //   { name: "Completed", count: bookingsByStatus.completed, fill: "#F44336" },
  // ];

  return (
    <div className="ml-64 w-[calc(100%-16rem)] p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-2xl font-bold mt-2">{dashboardData.totalUsers.toLocaleString()}</p>
            </div>
            <div className="text-3xl">
              <FaUsers className="text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Properties Listed</p>
              <p className="text-2xl font-bold mt-2">{dashboardData.totalProperties.toLocaleString()}</p>
            </div>
            <div className="text-3xl">
              <FaRegBuilding className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold mt-2">{dashboardData.totalBookings.toLocaleString()}</p>
            </div>
            <div className="text-3xl">
              <FaRegBookmark className="text-purple-500" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Hosts</p>
              <p className="text-2xl font-bold mt-2">{dashboardData.totalHosts.toLocaleString()}</p>
            </div>
            <div className="text-3xl">
              <FaUsers className="text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold mt-2">Rs {dashboardData.totalEarnings.toLocaleString()}</p>
            </div>
            <div className="text-3xl">
              <FaMoneyBillWave className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Active Bookings</p>
              <p className="text-2xl font-bold mt-2">{dashboardData.activeBookings.toLocaleString()}</p>
            </div>
            <div className="text-3xl">
              <FaRegBookmark className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Upcoming Bookings</p>
              <p className="text-2xl font-bold mt-2">{dashboardData.upcomingBookings.toLocaleString()}</p>
            </div>
            <div className="text-3xl">
              <FaRegBookmark className="text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Completed Bookings</p>
              <p className="text-2xl font-bold mt-2">{dashboardData.completedBookings.toLocaleString()}</p>
            </div>
            <div className="text-3xl">
              <FaRegBookmark className="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings By Status Bar Chart */}
      

      {/* Recent Bookings */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4"> 
        <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
          <button className="text-blue-500 hover:text-blue-700 font-semibold text-sm" onClick={() => navigate("/bookings")}>
            View All Bookings
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Booked Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(recentBookings) && recentBookings.length > 0 ? (
                recentBookings.map((booking, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.property}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-sm rounded-full ${
                          booking.status === "active"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "upcoming"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No recent bookings available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 