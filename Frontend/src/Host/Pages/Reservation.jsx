import React, { useEffect, useState } from "react";
import Footer from "../../User/Components/Footer";
import axios from "axios";
import { useSelector } from "react-redux";
import { format, isBefore, startOfDay } from "date-fns"; // date-fns v3.6.0
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"; // Adjust path based on your shadcn/ui setup
import { Button } from "@/components/ui/button"; // Adjust path based on your shadcn/ui setup
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Adjust path based on your shadcn/ui setup
import { Calendar } from "@/components/ui/calendar"; // Adjust path based on your shadcn/ui setup

import { cn } from "@/lib/utils"; // shadcn/ui utility for className merging
import { CalendarIcon } from "lucide-react";
import GuestCard from "../Components/Guestcard";

const Reservation = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null); // Separate start date
  const [endDate, setEndDate] = useState(null); // Separate end date
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const categories = ["All", "Upcoming", "Active", "Completed"];

  const user = useSelector((state) => state.user.user);

  const fetchReservations = async (
    category,
    search,
    startDate,
    endDate,
    pageNum
  ) => {
    try {
      setLoading(true);
      const params = {
        search,
        page: pageNum,
        limit: pagination.limit,
      };
      if (startDate && endDate) {
        // Format dates using date-fns in local timezone
        params.startDate = format(startDate, "yyyy-MM-dd");
        params.endDate = format(endDate, "yyyy-MM-dd");
      }
      const response = await axios.get(
        `http://localhost:8000/api/host-booking/${category}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params,
        }
      );
      console.log("Reservations:", response);
      setReservations(response.data.data || []);
      setPagination(
        response.data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      );
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setPage(1); // Reset to first page when changing category
    fetchReservations(category, searchTerm, startDate, endDate, 1);
  };

  const handleSearchClick = () => {
    if (startDate && endDate && isBefore(endDate, startDate)) {
      alert("End date cannot be before start date");
      return;
    }
    setPage(1); // Reset to first page when searching
    fetchReservations(selectedCategory, searchTerm, startDate, endDate, 1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setStartDate(null); // Clear start date
    setEndDate(null); // Clear end date
    setPage(1);
    fetchReservations(selectedCategory, "", null, null, 1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      fetchReservations(
        selectedCategory,
        searchTerm,
        startDate,
        endDate,
        newPage
      );
    }
  };

  useEffect(() => {
    fetchReservations(selectedCategory, searchTerm, startDate, endDate, page);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-1 flex-1 w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Your Reservations, {user.FirstName}!
          </h1>
          <p className="text-gray-500 mt-2">
            View and manage your reservations
          </p>
        </div>

        {/* Reservation Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Reservations
          </h2>

          {/* Search Input, Date Pickers, and Buttons */}
          <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:flex-row sm:items-end sm:gap-4">
            {/* Search Input with Label */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Reservations
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchClick();
                  }
                }}
                placeholder="Search by booking ID (e.g., BK-M982DNOH-6VIK) or guest name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date Range with Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => isBefore(date, startOfDay(new Date()))}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => 
                        isBefore(date, startOfDay(new Date())) || 
                        (startDate && isBefore(date, startDate))
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 self-end">
              <Button 
                onClick={handleSearchClick}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Search
              </Button>
              {(searchTerm || startDate || endDate) && (
                <Button 
                  onClick={handleClearSearch}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Category Buttons */}
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
                    : selectedCategory === "All"
                    ? "You don't have any reservations yet. New bookings will appear here."
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

          {/* Pagination Controls */}
         
            <div className="mt-6 flex items-center justify-between">
              <div className="text-gray-600">
                Showing {reservations.length} of {pagination.total} reservations
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(page - 1)}
                      className={
                        page === 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {[...Array(pagination.totalPages).keys()].map((i) => {
                    const pageNum = i + 1;
                    // Show only a few pages around the current page for brevity
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= page - 2 && pageNum <= page + 2)
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={page === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    // Add ellipsis for skipped pages
                    if (
                      (pageNum === page - 3 && page > 4) ||
                      (pageNum === page + 3 && page < pagination.totalPages - 3)
                    ) {
                      return (
                        <PaginationItem key={`ellipsis-${pageNum}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(page + 1)}
                      className={
                        page === pagination.totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Reservation;
