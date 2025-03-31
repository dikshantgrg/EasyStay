import React from "react";
import { TfiAlignJustify } from "react-icons/tfi";
import { CgProfile, CgLogOut } from "react-icons/cg";
import { FiHome, FiUser, FiBriefcase, FiBookmark } from "react-icons/fi";
import { HiMiniCalendarDateRange } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { MdOutlineRateReview } from "react-icons/md";

const DropdownMenu = ({
  isOpen,
  toggleDropdown,
  handleLogout,
  isHostMode,
  toggleHostMode,
  userRole,
  isApproved,
}) => {
  return (
    <div className="relative">
      <div
        className="ml-5 px-5 py-3 hover:bg-gray-50 rounded-3xl border border-gray-400 cursor-pointer flex items-center space-x-2 transition-all duration-200"
        onClick={toggleDropdown}
        aria-label="User menu"
      >
        <TfiAlignJustify className="text-gray-600" />
        <CgProfile className="h-5 w-5 text-gray-600" />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-md z-10 transform transition-all duration-200 origin-top-right">
          <div className="p-2">
            <ul className="space-y-1">
              <li>
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-gray-700 hover:text-blue-600"
                >
                  <FiUser className="h-5 w-5" />
                  <span className="text-sm font-medium">Profile</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-gray-700 hover:text-blue-600"
                  onClick={() => isHostMode && toggleHostMode()}
                >
                  <FiHome className="h-5 w-5" />
                  <span className="text-sm font-medium">Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/bookings"
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-gray-700 hover:text-blue-600"
                >
                  <HiMiniCalendarDateRange className="h-5 w-5" />
                  <span className="text-sm font-medium">My Bookings</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/bookings/review"
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-gray-700 hover:text-blue-600"
                >
                  <MdOutlineRateReview className="h-5 w-5" />
                  <span className="text-sm font-medium">To Review</span>
                </Link>
              </li>

              {(userRole === "host" || isApproved === "pending") && (
                <>
                  <div className="border-t border-gray-200 my-1"></div>
                  <li
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors duration-200 cursor-pointer text-gray-700 hover:text-blue-600"
                    onClick={toggleHostMode}
                  >
                    <FiBriefcase className="h-5 w-5" />
                    <span className="text-sm font-medium flex-1">
                      {isHostMode ? "User Mode" : "Host Mode"}
                    </span>
                    <div
                      className={`w-8 h-5 rounded-full p-1 ${
                        isHostMode ? "bg-blue-500" : "bg-gray-300"
                      } transition-colors duration-200`}
                    >
                      <div
                        className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ${
                          isHostMode ? "translate-x-3" : ""
                        }`}
                      ></div>
                    </div>
                  </li>
                </>
              )}

              <div className="border-t border-gray-200 my-1"></div>

              <li
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors duration-200 cursor-pointer text-gray-700 hover:text-red-600"
                onClick={handleLogout}
              >
                <CgLogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
