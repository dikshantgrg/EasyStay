import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../../features/user/userSlice";
import { RxCross1 } from "react-icons/rx";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

const LoginModal = ({ isOpen, onClose, openSignupModal }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({ Email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.Email || !formData.password) {
      setErrorMessage("Please fill out both fields.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/login",
        formData
      );
    
      console.log(response.data);
      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        dispatch(login(user));
        toast.success("Successfully logged in!");
        onClose();
      }
    } catch (error) {
      console.log(error);

      if (error.response?.data?.errors?.length > 0) {
        const errorMsg = error.response.data.errors[0].msg;
        setErrorMessage(errorMsg);
       
      } else if (error.response?.status === 401) {
        const errorMsg = error.response.data.msg || "Invalid credentials";
        setErrorMessage(errorMsg);
       
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data.msg || "User not found";
        setErrorMessage(errorMsg);
       
      } else {
        const errorMsg = "An unknown error occurred. Please try again.";
        setErrorMessage(errorMsg);
       
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative transform transition-all duration-300 ease-in-out">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none text-2xl"
          onClick={onClose}
        >
          <RxCross1 />
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Welcome Back
        </h2>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              autocomplete="username"
              type="email"
              value={formData.Email}
              onChange={(e) =>
                setFormData({ ...formData, Email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold transition-colors duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{" "}
          <span
            className="text-blue-600 font-semibold hover:text-blue-700 cursor-pointer transition-colors duration-200"
            onClick={() => {
              onClose();
              openSignupModal();
            }}
          >
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
