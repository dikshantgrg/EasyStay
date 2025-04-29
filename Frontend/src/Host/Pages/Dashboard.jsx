import React, { useEffect, useState } from "react";
import Footer from "../../User/Components/Footer";
import { Link } from "react-router-dom";
import axios from "axios";
import GuestCard from "../Components/Guestcard";
import { useDispatch, useSelector } from "react-redux";

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("Checking Out");
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const categories = [
    "Checking Out",
    "Current Guest",
    "Arriving Soon",
    "Upcoming",
    "Completed",
  ];

  const user = useSelector((state) => state.user.user);

  const fetchReservations = async (category) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/host-booking/${category}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          
            params: {
              limit: 5,
          }
        }
      );
      setReservations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/host/dashboard-stats",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Dashboard Stats:", response);
      
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    fetchReservations(category);
  };

  useEffect(() => {
    fetchReservations(selectedCategory);
    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-10 flex-1 w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.FirstName}!
            </h1>
            <p className="text-gray-500 mt-2">
              Manage your listings and reservations
            </p>
          </div>
          <Link
            to="/hosting/form?type=add-property"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <span>Add New Listing</span>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
        
          {statsLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Properties
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalProperties}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Bookings
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">
                  Completed Bookings
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.completedBookings}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Earnings
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  Rs {stats.totalEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Reservation Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Reservations
          </h2>

          <div className="overflow-x-auto pb-4">
            <ul className="flex gap-3 w-max">
              {categories.map((status) => (
                <li key={status}>
                  <button
                    className={`flex items-center gap-2 font-medium border border-gray-600 px-5 py-2.5 rounded-full transition-colors duration-200 ${
                      selectedCategory === status
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => handleCategoryClick(status)}
                  >
                    <span>{status}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Content Area */}
          <div className="mt-8 min-h-[400px] rounded-xl">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : reservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-8 min-h-[400px] rounded-xl text-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 text-blue-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No {selectedCategory} Reservations
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {selectedCategory === "Upcoming"
                    ? "You don't have any upcoming reservations. New bookings will appear here."
                    : "When you have reservations in this category, they'll appear here."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                {reservations.map((reservation) => (
                  <GuestCard
                    key={reservation._id}
                    reservation={reservation}
                    category={selectedCategory}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;