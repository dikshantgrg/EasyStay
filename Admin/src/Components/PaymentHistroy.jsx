import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "./Pagination";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("paymentDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const getAllPayment = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/admin/payment-history",
        {
          params: {
            searchTerm: searchTerm.trim() || undefined,
            paymentStatus: statusFilter || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            page,
            pageSize,
            sortBy: sortBy || undefined,
            sortOrder: sortOrder || undefined,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const {
        payments,
        page: currentPage,
        pageSize: responsePageSize,
        total,
      } = response.data;

      setPayments(payments);
      setPage(currentPage);
      setPageSize(responsePageSize);
      setTotalPayments(total);
      setTotalPages(Math.ceil(total / responsePageSize));
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      getAllPayment();
    }, 300);
    return () => clearTimeout(timer);
  }, [
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    page,
    pageSize,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    setPage(1); // Reset to page 1 when filters or sort change
  }, [
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    pageSize,
    sortBy,
    sortOrder,
  ]);

  return (
    <div className="ml-64 w-[calc(100%-16rem)] p-6 bg-gray-100 min-h-screen flex flex-col">
      <h2 className="text-3xl font-bold mb-6">Payment History</h2>

      {/* Filter Section */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by Booking ID or Transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort Controls */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="paymentDate">Date</option>
                <option value="amount">Amount</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt- flex justify-end">
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setStartDate("");
              setEndDate("");
              setSortBy("paymentDate");
              setSortOrder("desc");
              setPage(1);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-grow">
        <table className="min-w-full bg-white shadow-sm rounded-lg border table-fixed">
          <thead className="bg-gray-200 text-sm">
            <tr className="text-left">
              <th className="p-3 font-medium w-[5%]">Payment ID</th>
              <th className="p-3 font-medium w-[10%]">Booking ID</th>
              <th className="p-3 font-medium w-[15%]">User</th>
              <th className="p-3 font-medium w-[10%]">Amount </th>
              <th className="p-3 font-medium w-[10%]">Status</th>
              <th className="p-3 font-medium w-[10%]">Method</th>
              <th className="p-3 font-medium w-[15%]">Date</th>
              <th className="p-3 font-medium w-[15%]">Transaction ID</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment._id} className="border-b even:bg-gray-50">
                  <td className="p-3 truncate">{payment.paymentId}</td>
                  <td className="p-3 truncate">{payment.bookingId}</td>
                  <td className="p-3 truncate">
                    {payment.userId?.FirstName} {payment.userId?.LastName} (
                    {payment.userId?.UserId})
                  </td>
                  <td className="p-3">Rs {payment.amount / 100}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-lg ${
                        payment.paymentStatus === "completed"
                          ? "bg-green-100 text-green-600"
                          : payment.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3 truncate">{payment.paymentMethod}</td>
                  <td className="p-3 truncate">
                    {new Date(payment.paymentDate).toLocaleString()}
                  </td>
                  <td className="p-3 truncate">{payment.transactionId}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination and Page Size */}
      <div className="mt-4 mb-4 flex justify-between items-center">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
          disabled={loading}
        />
        <select
          value={pageSize}
          onChange={(e) => setPageSize(parseInt(e.target.value))}
          className="p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1">1 / page</option>
          <option value="5">5 / page</option>
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>
      </div>
    </div>
  );
};

export default PaymentHistory;
