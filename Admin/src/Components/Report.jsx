import React, { useState, useEffect } from "react";
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
  LabelList,
} from "recharts";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("bookings");
  const [topProperties, setTopProperties] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    type: "monthly",
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      let response;
      switch (selectedReport) {
        case "top-properties":
          response = await axios.get(
            "http://localhost:8000/api/admin/top-propertise",
            {
              params: { ...dateRange, period: dateRange.type },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setTopProperties(Array.isArray(response.data) ? response.data : []);
          break;

        case "earnings":
          response = await axios.get(
            "http://localhost:8000/api/admin/earnings",
            {
              params: { ...dateRange },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setEarnings(Array.isArray(response.data) ? response.data : []);
          break;

        case "bookings":
          response = await axios.get(
            "http://localhost:8000/api/admin/booking-count",
            {
              params: { ...dateRange },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setBookings(Array.isArray(response.data) ? response.data : []);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      switch (selectedReport) {
        case "top-properties":
          setTopProperties([]);
          break;
        case "earnings":
          setEarnings([]);
          break;
        case "bookings":
          setBookings([]);
          break;
        default:
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedReport, dateRange]);

  // Prepare data for Bookings chart (only completed bookings)
  const bookingsChartData = bookings.map((b) => ({
    name: new Date(b._id + "-01").toLocaleString('default', { month: 'long' }) || "Unknown",
    completed: b.count || 0,
  }));

  // Prepare data for Earnings chart
  const earningsChartData = earnings.map((e) => ({
    name: new Date(e._id + "-01").toLocaleString('default', { month: 'long' }) || "Unknown",
    totalEarnings: e.totalEarnings || 0,
  }));

  const renderReport = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-gray-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
            ></path>
          </svg>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      );
    }

    switch (selectedReport) {
      case "top-properties":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-2">Most Booked Properties</h2>
            {topProperties.length === 0 ? (
              <p>No data available</p>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Bookings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topProperties.map((prop) => (
                      <tr
                        key={prop._id || prop.title}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="p-3 text-sm text-gray-700 font-medium">
                          {prop.title || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {prop.bookingCount || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "earnings":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Earnings
            </h2>
            {earningsChartData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-2">No data available</p>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={earningsChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#eee"
                    />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Month",
                        position: "insideBottom",
                        offset: -10,
                      }}
                    />
                    <YAxis
                      tickFormatter={(value) => `Rs ${value}`}
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Total Earnings (RS)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [`Rs${value}`, "Total Earnings"]}
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        color: "#fff",
                        borderRadius: "4px",
                      }}
                    />
                    
                    <Bar
                      dataKey="totalEarnings"
                      fill="#4f46e5"
                      name="Total Earnings"
                      barSize={30}
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey="totalEarnings"
                        position="top"
                        formatter={(value) => `Rs${value}`}
                        style={{ fontSize: 12, fill: "#333" }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );

      case "bookings":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Monthly Completed Bookings
            </h2>
            {bookingsChartData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-2">No data available</p>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={bookingsChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#eee"
                    />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Month",
                        position: "insideBottom",
                        offset: -10,
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Bookings Count",
                        angle: -90,
                        position: "insideLeft",
                      }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        color: "#fff",
                        borderRadius: "4px",
                      }}
                    />
                    
                    <Bar
                      dataKey="completed"
                      fill="#10b981"
                      name="Completed Bookings"
                      barSize={30}
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey="completed"
                        position="top"
                        style={{ fontSize: 12, fill: "#333" }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ml-64 w-[calc(100%-16rem)] p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
            <p className="text-sm text-gray-500 mt-1">
              Analyze your property performance
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="p-2.5 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="top-properties">Most Booked Properties</option>
              <option value="earnings">Earnings</option>
              <option value="bookings">Bookings</option>
            </select>

            <div className="flex gap-2 flex-wrap">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => {
                    const newStartDate = e.target.value;
                    if (
                      prev.endDate &&
                      newStartDate &&
                      new Date(newStartDate) > new Date(prev.endDate)
                    ) {
                      alert("Start date must be before end date");
                      return prev;
                    }
                    return { ...prev, startDate: newStartDate };
                  })
                }
                className="p-2.5 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => {
                    const newEndDate = e.target.value;
                    if (
                      prev.startDate &&
                      newEndDate &&
                      new Date(newEndDate) < new Date(prev.startDate)
                    ) {
                      alert("End date must be after start date");
                      return prev;
                    }
                    return { ...prev, endDate: newEndDate };
                  })
                }
                className="p-2.5 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {renderReport()}
        </div>
      </div>
    </div>
  );
};

export default Reports;