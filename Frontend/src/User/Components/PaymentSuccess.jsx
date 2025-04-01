import React from "react";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-lg mb-8">Your booking is confirmed. Thank you!</p>
      <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Go to Home
      </Link>
    </div>
  );
};

export default PaymentSuccess;