import { useEffect, useState } from "react";
import "./App.css";
import LeftSidebar from "./Components/LeftSidebar";
import RightContent from "./Components/RightContent";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./Components/Login";
import { jwtDecode } from "jwt-decode";
import RequestToBeHost from "./Components/RequestToBeHost";
import ListingRequest from "./Components/ListingRequest";
import Dashboard from "./Components/Dashboard";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./features/user/userSlice"; // Ensure this action is imported
import AllReview from "./Components/AllReview";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const userData = jwtDecode(token);

        if (userData.role !== "admin") {
          console.error("Access Denied: Only admins are allowed.");
          localStorage.removeItem("token");
          return;
        }

        dispatch(setUser(userData));
      } catch (error) {
        console.error("Invalid Token:", error.message);
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, [dispatch]);

  // Show a loading screen while checking the token
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* If not logged in, redirect to /login */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />

        {/* Protected Routes (Only accessible when logged in) */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <div className="flex h-screen w-full bg-gray-100">
                <LeftSidebar />
                <Dashboard />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/user"
          element={
            user ? (
              <div className="flex h-screen w-full bg-gray-100">
                <LeftSidebar />
                <RightContent />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/review"
          element={
            user ? (
              <div className="flex h-screen w-full bg-gray-100">
                <LeftSidebar />
                <AllReview />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/to-be-host"
          element={
            user ? (
              <div className="flex h-screen w-full bg-gray-100">
                <LeftSidebar />
                <RequestToBeHost />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/listing-request"
          element={
            user ? (
              <div className="flex h-screen w-full bg-gray-100">
                <LeftSidebar />
                <ListingRequest />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
