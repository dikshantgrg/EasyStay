import "./App.css";
import Navbar from "./User/Components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./features/user/userSlice";
import { jwtDecode } from "jwt-decode";
import { Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BecomeAHost from "./User/pages/BecomeAHost";
import Home from "./User/pages/Home";
import "leaflet/dist/leaflet.css";
import PropertyDetails from "./User/pages/PropertyDetails";
import Dashboard from "./Host/Pages/Dashboard";
import Property from "./Host/Pages/Property";
import PropertyEdit from "./Host/Pages/PropertyEdit";
import MultiForm from "./Host/Components/MultiForm";
import BookingPage from "./User/pages/Bookingpage";
import UserBooking from "./User/pages/UserBooking";
import BookingDetails from "./User/pages/BookingDetails";
import HostBookingDetail from "./Host/Pages/HostBookingDetail";
import ToReviewPage from "./User/pages/ToReviewPage";
import PropertyReview from "./Host/Pages/PropertyReview";
import PropertyFilterPage from "./User/Components/PropertyFilterPage";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const userData = jwtDecode(token);
        dispatch(setUser(userData));
      } catch (error) {
        console.error("Invalid Token:", error.message);
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false); // Set loading to false after checking token
  }, [dispatch]);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <div>Loading...</div>; // Show a loading state while checking token
    }
    return user ? children : <Navigate to="/" />;
  };
  const [showModal, setShowModal] = useState(false);
  return (
    <>
    {/* <PropertyReview /> */}
      <Navbar />
     
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/properties" element={<PropertyFilterPage />} />
        {/* User Protected Routes */}
        <Route
          path="/becomeahost"
          element={
            <ProtectedRoute>
              <BecomeAHost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <UserBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/details/:id"
          element={
            <ProtectedRoute>
              <BookingDetails />
            </ProtectedRoute>
          }
        />
          <Route
          path="/bookings/review"
          element={
            <ProtectedRoute>
              <ToReviewPage />
            </ProtectedRoute>
          }
        />

        {/* Host Protected Routes */}
        <Route
          path="/hosting/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hosting/property"
          element={
            <ProtectedRoute>
              <Property />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/property/:id"
          element={
            <ProtectedRoute>
              <PropertyEdit />
            </ProtectedRoute>
          }
        />
          <Route
          path="/host/property/reviews/:id"
          element={
            <ProtectedRoute>
              <PropertyReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hosting/form"
          element={
            <ProtectedRoute>
              <MultiForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/host/booking/details/:id"
          element={
            <ProtectedRoute>
              <HostBookingDetail />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
