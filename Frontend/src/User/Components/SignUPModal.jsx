import React, { useState } from "react";
import axios from "axios";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import toast from "react-hot-toast";

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
        toast.success("Signup successful! Please log in.");
        onClose();
        openLoginModal();
      }
    } catch (error) {
      console.log(error);

      // Handle server validation errors
      if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
        toast.error("Email already exists");
        return;
      }

      if (error.response?.data?.errors) {
        const firstError = error.response.data.errors[0];
        if (firstError.params === "FirstName" || firstError.params === "LastName") {
          toast.error("Names must be at least 3 characters");
          return;
        }
        if (firstError.params === "password") {
          toast.error("Password must be at least 8 characters");
          return;
        }
      }

      toast.error(error.response?.data?.msg || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl w-full max-w-md p-8 shadow-2xl relative animate-fadeIn">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none text-xl"
          onClick={onClose}
        >
          <RxCross1 />
        </button>

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Create Account</h2>
        <p className="text-gray-500 text-center mb-8">Join EasyStay to find your perfect accommodation</p>

       

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Name Fields - Side by side layout */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.FirstName}
                onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.LastName}
                onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Password Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-500 hover:text-gray-700 items-center"
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>

          {/* Remove the error message from here since it's now at the top */}
          {errorMessage && (
            <div className="text-red-500 text-sm py-2 px-3 bg-red-50 border border-red-100 rounded-lg">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-md hover:shadow-lg mt-4"
          >
            Create Account
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6 text-sm">
          Already have an account?{" "}
          <span
            className="text-blue-600 font-medium hover:underline cursor-pointer"
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