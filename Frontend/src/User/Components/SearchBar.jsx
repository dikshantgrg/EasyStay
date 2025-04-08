import React, { useState, useEffect } from "react";
import moment from "moment";
import { MapPin, Users, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const SearchBar = ({
  onSearch,
  initialDestination = "",
  initialCheckIn = null,
  initialCheckOut = null,
  initialGuests = "1",
}) => {
  const [destination, setDestination] = useState(initialDestination);
  const [dateRange, setDateRange] = useState({
    from: initialCheckIn,
    to: initialCheckOut,
  });
  const [guests, setGuests] = useState(initialGuests);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setDestination(initialDestination);
    setDateRange({
      from: initialCheckIn,
      to: initialCheckOut,
    });
    setGuests(initialGuests);
  }, [initialDestination, initialCheckIn, initialCheckOut, initialGuests]);

  const handleSearch = (e) => {
    e.preventDefault();
    setError(null);

    if (!destination.trim()) {
      setError("Please enter a destination");
      return;
    }

    if (
      dateRange.from &&
      dateRange.to &&
      moment(dateRange.from).isAfter(dateRange.to)
    ) {
      setError("Check-out date must be after check-in date");
      return;
    }

    setIsSearching(true);
    const searchData = {
      destination,
      checkIn: dateRange.from,
      checkOut: dateRange.to,
      guests,
    };
    if (onSearch) onSearch(e, searchData);
    setTimeout(() => setIsSearching(false), 1500);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl shadow-xl p-2 grid grid-cols-1 lg:grid-cols-4 space-x-4 max-w-7xl mx-auto border"
    >
      {/* Destination Field */}
      <div className="space-y-2 relative">
        <div className="relative">
          <Label
            htmlFor="destination"
            className="absolute top-1 left-8 bg-white px-1 text-sm font-medium text-gray-500"
          >
            Destination
          </Label>
          <MapPin className=" absolute left-1 top-4 h-6 w-6 text-black" />
          <Input
            id="destination"
            type="text"
            placeholder="Where are you going?"
            value={destination || ""}
            onChange={(e) => setDestination(e.target.value)}
            className=" pl-9 pt-4 h-14  rounded-xl  text-2xl focus-visible:ring-offset-0"
          />
        </div>
      </div>

      {/* Dates Field */}
      <div className="space-y-2">
        <div className="relative">
          <Label className="absolute top-1 left-9  px-1 text-sm font-medium text-gray-500">
            Dates
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-14 justify-start text-left font-normal rounded-xl pl-10",
                  !dateRange.from && !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarRange className="absolute left-3 text-xl text-black" />
                <span className=" pt-3 rounded-xl  text-sm focus-visible:ring-offset-0">
                  {dateRange.from
                    ? dateRange.to
                      ? `${moment(dateRange.from).format("MMM D")} - ${moment(
                          dateRange.to
                        ).format("MMM D, YYYY")}`
                      : moment(dateRange.from).format("MMM D, YYYY")
                    : "Select travel dates"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1 h" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                disabled={(date) => date < new Date()}
                initialFocus
                numberOfMonths={2}
                className="rounded-xl"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Guests Field */}
      <div className="space-y-2">
        <div className="relative">
          <Label
            htmlFor="guests"
            className="absolute top-1 left-9 bg-white px-1 text-xs font-medium text-gray-500"
          >
            Guests
          </Label>
          <Users className=" absolute left-2 top-4 h-6 w-6 text-black" />
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="flex h-14 w-full rounded-xl border border-input bg-background px-9 pt-3 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Button */}
      <div className="flex items-end">
        <Button
          type="submit"
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg transition-colors"
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Find Your Stay
            </>
          )}
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </form>
  );
};

export default SearchBar;
