import React, { useState } from "react";
import axios from "axios";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";


const SignupModal = ({ isOpen, onClose, openLoginModal }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Client-side validations
    const { FirstName, LastName, Email, password, confirmPassword } = formData;
    if (!FirstName || !LastName || !Email || !password || !confirmPassword) {
      setErrorMessage("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      // Remove confirmPassword from data sent to server
      const { confirmPassword, ...dataToSend } = formData;
      const response = await axios.post("http://localhost:8000/api/signup", dataToSend);

      if (response.status === 200) {
        alert("Signup successful! Please log in.");
        onClose();
        openLoginModal();
      }
    } catch (error) {
      console.log(error);

      // Handle server validation errors
      if (error.response?.data?.error) {
        setErrorMessage("Email already exists");
        return;
      }

      if (error.response?.data?.errors) {
        const firstError = error.response.data.errors[0];
        if (firstError.params === "FirstName" || firstError.params === "LastName") {
          setErrorMessage("Names must be at least 3 characters");
          return;
        }
        if (firstError.params === "password") {
          setErrorMessage("Password must be at least 8 characters");
          return;
        }
      }

      setErrorMessage(error.response?.data?.msg || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-lg relative">
        <button
          className="absolute top-1 right-4 text-gray-500 hover:text-gray-700 focus:outline-none text-3xl"
          onClick={onClose}
        >
       <RxCross1 />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Sign Up</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              value={formData.FirstName}
              onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              value={formData.LastName}
              onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your last name"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-500 hover:text-gray-700 items-center"
              >
                {showPassword ?  <FaRegEye />: <FaRegEyeSlash />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-500 hover:text-gray-700"
              >
                  {showPassword ?  <FaRegEye />: <FaRegEyeSlash />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="text-red-500 text-sm mb-4 text-center">{errorMessage}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold"
          >
            Sign Up
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <span
            className="text-blue-500 font-medium hover:underline cursor-pointer"
            onClick={() => {
              onClose();
              openLoginModal();
            }}
          >
            Log In
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;