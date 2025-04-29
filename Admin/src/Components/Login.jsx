import React, { useState } from "react";
import { GrUserAdmin } from "react-icons/gr";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../features/user/userSlice";
import { useNavigate } from "react-router-dom";
import side from "../assets/sideimage.png";
const Login = () => {
  const [formData, setFormData] = useState({
    Email: "admin@gmail.com",
    password: "Admin123456",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

        if (user.role !== "admin") {
          setErrorMessage("Access Denied: Only admins are allowed.");
          return;
        }

        localStorage.setItem("token", token);
        dispatch(login(user));
        navigate("/dashboard");
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
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 h-full relative overflow-hidden">
        <img
          src={side}
          alt="Admin Login Background"
          className="absolute w-full h-full object-cover object-center"
        />
        <div className="absolute w-full h-full bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-white text-center px-8">
            <h1 className="text-4xl font-bold mb-4">Admin Portal</h1>
            <p className="text-xl">Secure Access to System Administration</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="bg-blue-600 p-3 rounded-full flex items-center justify-center w-16 h-16">
                <GrUserAdmin className="text-9xl text-white p-2" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Login
            </h2>
            <p className="text-gray-600">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={formData.Email}
                onChange={(e) =>
                  setFormData({ ...formData, Email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>
            {errorMessage && (
              <div className="text-red-500 text-sm mb-4 text-">
                {errorMessage}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
