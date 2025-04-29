import React, { useEffect } from "react";
import { TfiAlignJustify } from "react-icons/tfi";
import { CgProfile, CgLogOut } from "react-icons/cg";
import { FiHome, FiUser, FiBriefcase, FiBookmark } from "react-icons/fi";
import { HiMiniCalendarDateRange } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { MdOutlineRateReview } from "react-icons/md";
import { useSelector } from "react-redux";

const DropdownMenu = ({
  isOpen,
  toggleDropdown,
  handleLogout,
  isHostMode,
  toggleHostMode,
  userRole,
}) => {
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const closeDropdown = (e) => {
      const dropdown = document.querySelector('.dropdown-menu');
      const trigger = document.querySelector('.dropdown-trigger');
      
      if (isOpen && dropdown && trigger) {
        if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
          toggleDropdown();
        }
      }
    };

    document.addEventListener('mousedown', closeDropdown);
    return () => document.removeEventListener('mousedown', closeDropdown);
  }, [isOpen, toggleDropdown]);

  return (
    <div className="relative">
      <div
        className="dropdown-trigger ml-5 px-4 py-2 hover:bg-gray-50 rounded-full border border-gray-400 cursor-pointer flex items-center gap-3 transition-all duration-200"
        onClick={toggleDropdown}
        aria-label="User menu"
      >
        <TfiAlignJustify className="text-gray-600" />
        {user?.profileImage ? (
          <img
            src={`http://localhost:8000/${user.profileImage}`}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
            {user?.FirstName?.charAt(0)}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="dropdown-menu absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-lg z-50 transform transition-all duration-200 origin-top-right">
          <div className="p-3">
            {/* User Info Header */}
            <div className="flex items-center gap-3 p-2 mb-2 border-b border-gray-100 pb-3">
              {user?.profileImage ? (
                <img
                  src={`http://localhost:8000/${user.profileImage}`}
                  alt="Profile"
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                  {user?.FirstName?.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-900">{user?.FirstName} {user?.LastName}</h4>
              
              </div>
            </div>

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

              {(userRole === "host") && (
                <>

                {!isHostMode && (

                  <li
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors duration-200 cursor-pointer text-gray-700 hover:text-blue-600"
                    onClick={toggleHostMode}
                  >
                    <FiBriefcase className="h-5 w-5" />
                    <span className="text-sm font-medium flex-1">
                      Host Dashboard
                    </span>
                  
                     
                    
                  </li>
                )}
               
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
