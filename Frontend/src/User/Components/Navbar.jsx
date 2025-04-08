import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import LoginModal from "./LoginModal";
import DropdownMenu from "./DropdownMenu";
import { logout } from "../../features/user/userSlice";
import {
  toggleHostMode,
  resetHostMode,
} from "../../features/user/hostModeSlice";
import SignupModal from "./SignUPModal";


const Navbar = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const isHostMode = useSelector((state) => state.hostMode.isHostMode);

  const handleToggleHostMode = () => {
    dispatch(toggleHostMode());
    navigate(isHostMode ? "/" : "/hosting/Dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(resetHostMode());
    dispatch(logout(user));
    setIsDropdownOpen(false);
    navigate("/");
  };

  return (
    <>
      <div className="bg-white shadow-md border-b border-gray-300">
        <nav className="container mx-auto max-w-7xl py-4 px-10">
          <div className="flex justify-between items-center px-4">
            {/* Logo */}
            <div className="text-3xl font-bold">
              <Link
                to={isHostMode ? "/hosting/dashboard" : "/"}
                onClick={() => navigate(isHostMode ? "/hosting/dashboard" : "/")}
              >
                EasyStay
              </Link>
            </div>
            {/* {window.location.pathname !== "/" && <SearchBar isHomePage={false} />} */}
            {/* Navigation Links */}
            <div
              className={`flex-1 ${
                isHostMode ? "flex justify-center" : "flex justify-end"
              } space-x-6 p-3`}
            >
              {isHostMode ? (
                <>
                  <Link
                    to="/hosting/dashboard"
                    className="text-lg font-semibold hover:text-blue-700"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/hosting/property"
                    className="text-lg font-semibold hover:text-blue-700"
                  >
                    Listings
                  </Link>
                  <Link
                    to="/host/reservations"
                    className="text-lg font-semibold hover:text-blue-700"
                  >
                    Reservations
                  </Link>
                </>
              ) : (
                <Link
                  to={
                    user?.role === "host" || user?.hostApprovalStatus === "pending"
                      ? "/hosting/Dashboard"
                      : "/BecomeaHost"
                  }
                  className="text-lg font-semibold hover:text-blue-700 mr-2"
                  onClick={() => {
                    if (
                      (user?.role === "host" || user?.hostApprovalStatus === "pending") &&
                      !isHostMode
                    ) {
                      dispatch(toggleHostMode());
                    }
                  }}
                >   
                     

                  {user?.role === "host" || user?.hostApprovalStatus === "pending"
                    ? "Go to Hosting Dashboard"
                    : "Become a Host"}

                    
                </Link>
              )}
            </div>

            {/* Authentication/Account Section */}
            <div>
              {user ? (
                <DropdownMenu className="z-50"
                  isOpen={isDropdownOpen}
                  toggleDropdown={() => setIsDropdownOpen((prev) => !prev)}
                  handleLogout={handleLogout}
                  isHostMode={isHostMode}
                  toggleHostMode={handleToggleHostMode}
                  userRole={user?.role}
                  isApproved={user?.hostApprovalStatus}
                />
              ) : (
                <div className="space-x-3">
                  <button
                    className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-all duration-300"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    Login
                  </button>
                  <button
                    className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-all duration-300"
                    onClick={() => setIsSignupModalOpen(true)}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar - only shown when not on home page */}
         
        </nav>

        {/* Modals */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          openSignupModal={() => setIsSignupModalOpen(true)}
        />
        <SignupModal
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
          openLoginModal={() => setIsLoginModalOpen(true)}
        />
      </div>
    </>
  );
};

export default Navbar;