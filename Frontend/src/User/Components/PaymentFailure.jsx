import React from "react";
import { Link } from "react-router-dom";

const PaymentFailure = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
      <p className="text-lg mb-8">Something went wrong. Please try again.</p>
      <Link to="/booking" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Try Again
      </Link>
    </div>
  );
};

export default PaymentFailure;