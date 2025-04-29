import { useEffect, useState } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./features/user/userSlice";
import LeftSidebar from "./Components/LeftSidebar";
import Login from "./Components/Login";
import AllUser from "./Components/AllUser";
import RequestToBeHost from "./Components/RequestToBeHost";
import ListingRequest from "./Components/ListingRequest";
import Dashboard from "./Components/Dashboard";
import AllReview from "./Components/AllReview";
import AllProperty from "./Components/AllProperty";
import PaymentHistroy from "./Components/PaymentHistroy";
import AllBooking from "./Components/AllBooking";
import UserInfo from "./Components/UserInfo";
import Reports from "./Components/Report";
import PropertyType from "./Components/PropertyType";
import PropertyDetails from "./Components/PropertyDetails";
import BookingDetails from "./Components/BookingDetails";

// Layout component for protected routes
const ProtectedLayout = ({ children }) => (
  <div className="flex h-screen w-full bg-gray-100">
    <LeftSidebar />
    {children}
  </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ user, component: Component }) => {
  return user ? (
    <ProtectedLayout>
      <Component />
    </ProtectedLayout>
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Root Redirect */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute user={user} component={Dashboard} />}
      />
      <Route
        path="/properties"
        element={<ProtectedRoute user={user} component={AllProperty} />}
      />
      <Route
        path="/user"
        element={<ProtectedRoute user={user} component={AllUser} />}
      />
      <Route
        path="/reviews"
        element={<ProtectedRoute user={user} component={AllReview} />}
      />
      <Route
        path="/ID-verfication"
        element={<ProtectedRoute user={user} component={RequestToBeHost} />}
      />
      <Route
        path="/listing-request"
        element={<ProtectedRoute user={user} component={ListingRequest} />}
      />
      <Route
        path="/bookings"
        element={<ProtectedRoute user={user} component={AllBooking} />}
      />
      <Route
        path="/payment-history"
        element={<ProtectedRoute user={user} component={PaymentHistroy} />}
      />
      <Route
        path="/user-info/:id"
        element={<ProtectedRoute user={user} component={UserInfo} />}
      />
      <Route
        path="/report"
        element={<ProtectedRoute user={user} component={Reports} />}
      />
      <Route
        path="/property/:id"
        element={<ProtectedRoute user={user} component={PropertyDetails} />}
      />
      <Route
        path="/property-type"
        element={<ProtectedRoute user={user} component={PropertyType} />}
      />
      <Route
        path="//booking/details/:id"
        element={<ProtectedRoute user={user} component={BookingDetails} />}
      />
      {/* Fallback for undefined routes */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
    
  );
}

export default App;
