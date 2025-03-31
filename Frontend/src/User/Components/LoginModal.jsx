import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../../features/user/userSlice";
import { RxCross1 } from "react-icons/rx";


const LoginModal = ({ isOpen, onClose, openSignupModal }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({ Email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
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
      console.log("Response:", JSON.stringify(response, null, 2));

      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        dispatch(login(user));

        onClose();
      }
    } catch (error) {
      console.log(error);

      if (error.response?.data?.errors?.length > 0) {
        const errorMsg = error.response.data.errors[0].msg;
        setErrorMessage(errorMsg);
        return;
      } else {
        setErrorMessage("An unknown error occurred.");
      }

      if (error.response.status === 401) {
        const errorMsg = error.response.data.msg;
        setErrorMessage(errorMsg);
        return;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-lg relative">
        {/* Close Button */}
        <button
          className="absolute top-1 right-4 text-gray-500 hover:text-gray-700 focus:outline-none  text-3xl"
          onClick={onClose}
        >
        <RxCross1 />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Log In
        </h2>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              autocomplete="username"
              type="email"
              value={formData.Email}
              onChange={(e) =>
                setFormData({ ...formData, Email: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              autoComplete="current-password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>
          {errorMessage && (
            <div className="text-red-500 text-sm mb-4 text-">
              {errorMessage}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold"
          >
            Log In
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <span
            className="text-blue-500 font-medium hover:underline cursor-pointer"
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
