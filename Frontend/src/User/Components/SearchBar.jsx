import React, { useState, useEffect } from "react";
import moment from "moment";
import { FaMapMarkerAlt, FaUsers, FaSearch, FaSpinner } from "react-icons/fa";

const SearchBar = ({
  onSearch,
  initialDestination = "",
  initialCheckIn = null,
  initialCheckOut = null,
  initialGuests = "1",
}) => {
  const [destination, setDestination] = useState(initialDestination);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setDestination(initialDestination);
    setCheckIn(initialCheckIn);
    setCheckOut(initialCheckOut);
    setGuests(initialGuests);
  }, [initialDestination, initialCheckIn, initialCheckOut, initialGuests]);

  const handleSearch = (e) => {
    e.preventDefault();
    setError(null);

    if (!destination.trim()) {
      setError("Please enter a destination");
      return;
    }

    if (checkIn && checkOut && moment(checkIn).isAfter(checkOut)) {
      setError("Check-out date must be after check-in date");
      return;
    }

    setIsSearching(true);
    const searchData = { destination, checkIn, checkOut, guests };
    if (onSearch) onSearch(e, searchData);
    setTimeout(() => setIsSearching(false), 1500);
  };

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value ? new Date(e.target.value) : null;
    setCheckIn(newCheckIn);
    // If check-out exists and is before new check-in, reset it
    if (newCheckIn && checkOut && moment(newCheckIn).isAfter(checkOut)) {
      setCheckOut(null);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto"
    >
      <div className="flex flex-col min-h-[6rem]">
        <label htmlFor="destination" className="text-sm font-medium mb-1 block">
          Destination
        </label>
        <div className="relative">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="destination"
            type="text"
            placeholder="Where are you going?"
            value={destination || ""}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="h-6 mt-1">
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
      </div>

      <div className="flex flex-col min-h-[6rem] justify-between">
        <label htmlFor="check-in" className="text-sm font-medium mb-1 block">
          Check-in
        </label>
        <input
          id="check-in"
          type="date"
          min={moment().format("YYYY-MM-DD")}
          value={checkIn ? moment(checkIn).format("YYYY-MM-DD") : ""}
          onChange={handleCheckInChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="h-6" />
      </div>

      <div className="flex flex-col min-h-[6rem] justify-between">
        <label htmlFor="check-out" className="text-sm font-medium mb-1 block">
          Check-out
        </label>
        <input
          id="check-out"
          type="date"
          min={checkIn ? moment(checkIn).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD")}
          value={checkOut ? moment(checkOut).format("YYYY-MM-DD") : ""}
          onChange={(e) => setCheckOut(e.target.value ? new Date(e.target.value) : null)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="h-6" />
      </div>

      <div className="flex flex-col min-h-[6rem] justify-between">
        <label htmlFor="guests" className="text-sm font-medium mb-1 block">
          Guests
        </label>
        <div className="relative">
          <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
        </div>
        <div className="h-6" />
      </div>

      <div className="flex flex-col min-h-[6rem] justify-between">
        <div className="h-6" />
        <button
          type="submit"
          disabled={isSearching}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
        >
          {isSearching ? (
            <>
              <FaSpinner className="mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <FaSearch className="mr-2" />
              Find Your Stay
            </>
          )}
        </button>
        <div className="h-6" />
      </div>
    </form>
  );
};

export default SearchBar;