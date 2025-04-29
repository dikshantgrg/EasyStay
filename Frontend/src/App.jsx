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

import PaymentSuccess from "./User/Components/PaymentSuccess";
import PaymentFailure from "./User/Components/PaymentFailure";
import Profile from "./User/pages/Profile";
import BecomeHostForm from "./User/Components/BecomeHostForm";
import Reservation from "./Host/Pages/Reservation";
import PropertyFilterPage from "./User/pages/PropertyFilterPage";
import { Toaster } from "react-hot-toast";
import Footer from "./User/Components/Footer";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const userData = jwtDecode(token);
        // Check if token is expired
        const currentTime = Date.now() / 1000; // Convert to seconds
        if (userData.exp < currentTime) {
          console.warn("Token has expired");
          localStorage.removeItem("token");
          dispatch(setUser(null));
        } else {
          dispatch(setUser(userData));
        }
      } catch (error) {
        console.error("Invalid Token:", error.message);
        localStorage.removeItem("token");
        dispatch(setUser(null));
      }
    }
    setIsLoading(false);
  }, [dispatch, setIsLoading]);
  console.log(user);

  // Enhanced Protected Route Component with role check
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return <Navigate to="/" />;
    }

    // Check if user has the required role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }

    return children;
  };

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/properties" element={<PropertyFilterPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/bookings/review" element={<ToReviewPage />} />
        <Route path="/bookings" element={<UserBooking />} />
        <Route path="/becomeahost" element={<BecomeAHost />} />
        {/* User Protected Routes */}

        <Route
          path="/hosting/form/become-a-host"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <BecomeHostForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/details/:id"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <BookingDetails />
            </ProtectedRoute>
          }
        />

        {/* Host Protected Routes */}
        <Route
          path="/hosting/dashboard"
          element={
            <ProtectedRoute allowedRoles={["host"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hosting/property"
          element={
            <ProtectedRoute allowedRoles={["host"]}>
              <Property />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/property/:id"
          element={
            <ProtectedRoute allowedRoles={["host"]}>
              <PropertyEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/property/reviews/:id"
          element={
            <ProtectedRoute allowedRoles={["host"]}>
              <PropertyReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hosting/form"
          element={
            <ProtectedRoute allowedRoles={["host"]}>
              <MultiForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/host/booking/details/:id"
          element={
            <ProtectedRoute allowedRoles={["host"]}>
              <HostBookingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/reservations"
          element={
            <ProtectedRoute allowedRoles={["host"]}>
              <Reservation />
            </ProtectedRoute>
          }
        />

        {/* Payment Routes */}
        <Route path="/booking/success/" element={<PaymentSuccess />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
      {/* <Footer /> */}
    </>
  );
}

export default App;
