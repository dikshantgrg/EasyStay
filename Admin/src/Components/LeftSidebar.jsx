import React, { useState } from "react";
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaCog,
  FaChevronDown,
} from "react-icons/fa";
import { TbLogout2 } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../features/user/userSlice";
import { useDispatch, useSelector } from "react-redux";

const LeftSidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toggleDropdown = (item) => {
    setOpenDropdown(openDropdown === item ? null : item);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout(user));
    navigate("/");
  };

  return (
    <div className="w-64 bg-gray-900 text-gray-300 flex flex-col h-screen border-r border-gray-800 shadow-xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-blue-400">EasyStay</span>Admin
        </h1>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          <li>
            <a
              href="#"
              className="flex items-center gap-3 p-3 text-sm rounded-lg hover:bg-gray-700/50"
            >
              <FaHome className="text-lg opacity-75" /> Dashboard
            </a>
          </li>

          {/* Users Dropdown */}
          <li>
            <button
              onClick={() => toggleDropdown("Users")}
              className="flex justify-between items-center w-full p-3 text-sm rounded-lg hover:bg-gray-700/50"
            >
              <span className="flex items-center gap-3">
                <FaUsers className="text-lg opacity-75" /> Users
              </span>
              <FaChevronDown
                className={`text-xs transition-transform ${
                  openDropdown === "Users" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openDropdown === "Users" && (
              <ul className="pl-11 space-y-2 mt-1 animate-slideDown">
                <li>
                  <Link
                    to="/user"
                    className="flex items-center gap-2 p-2 text-sm hover:bg-gray-800/50 rounded-lg transition-all group"
                  >
                    <span className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="group-hover:text-white">All Users</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/to-be-host"
                    className="flex items-center gap-2 p-2 text-sm hover:bg-gray-800/50 rounded-lg transition-all group"
                  >
                    <span className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="group-hover:text-white">
                      Host Requests
                    </span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Properties Dropdown */}
          <li>
            <button
              onClick={() => toggleDropdown("Properties")}
              className="flex justify-between items-center w-full p-3 text-sm rounded-lg hover:bg-gray-800/50 transition-all group"
            >
              <span className="flex items-center gap-3">
                <FaBuilding className="text-lg opacity-75" /> Properties
              </span>
              <FaChevronDown
                className={`text-xs transition-transform ${
                  openDropdown === "Properties" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openDropdown === "Properties" && (
              <ul className="pl-11 space-y-2 mt-1 animate-slideDown">
                <li>
                  <Link
                    to="/properties"
                    className="flex items-center gap-2 p-2 text-sm hover:bg-gray-800/50 rounded-lg transition-all group"
                  >
                    <span className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="group-hover:text-white">
                      All Properties
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/listing-request"
                    className="flex items-center gap-2 p-2 text-sm hover:bg-gray-800/50 rounded-lg transition-all group"
                  >
                    <span className="w-2 h-2  bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="group-hover:text-white">
                      Listing Requests
                    </span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <button
              onClick={() => toggleDropdown("Review")}
              className="flex justify-between items-center w-full p-3 text-sm rounded-lg hover:bg-gray-800/50 transition-all group"
            >
              <span className="flex items-center gap-3">
                <FaBuilding className="text-lg opacity-75" /> Reviews
              </span>
              <FaChevronDown
                className={`text-xs transition-transform ${
                  openDropdown === "Review" ? "rotate-180" : ""
                }`}
              />
            </button>
            {openDropdown === "Review" && (
              <ul className="pl-11 space-y-2 mt-1 animate-slideDown">
                <li>
                  <Link
                    to="/review"
                    className="flex items-center gap-2 p-2 text-sm hover:bg-gray-800/50 rounded-lg transition-all group"
                  >
                    <span className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="group-hover:text-white">
                      All Review
                    </span>
                  </Link>
                </li>
                {/* <li>
                  <Link
                    to="/listing-request"
                    className="flex items-center gap-2 p-2 text-sm hover:bg-gray-800/50 rounded-lg transition-all group"
                  >
                    <span className="w-2 h-2  bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="group-hover:text-white">
                      Listing Requests
                    </span>
                  </Link>
                </li> */}
              </ul>
            )}
          </li>

          <li>
            <a
              href="#"
              className="flex items-center gap-3 p-3 text-sm rounded-lg hover:bg-gray-700/50"
            >
              <FaCog className="text-lg opacity-75" /> Settings
            </a>
          </li>
        </ul>
      </nav>

      <div className="p-4 mt-auto border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 text-sm rounded-lg hover:bg-gray-700/50"
        >
          <TbLogout2 className="text-lg opacity-75" /> Logout
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
