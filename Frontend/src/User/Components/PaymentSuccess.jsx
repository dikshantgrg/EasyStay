import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FiCheck, FiX, FiLoader, FiHome } from "react-icons/fi";

const PaymentSuccess = () => {
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract query parameters from the URL
  const params = new URLSearchParams(location.search);
  const pidxFromParams = params.get("pidx");
  const transactionId = params.get("transaction_id");
  const amount = params.get("amount");
  const purchaseOrderId = params.get("purchase_order_id");

  const pidx = pidxFromParams || localStorage.getItem("pidx");
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8000/api/payment/callback",
          {
            params: {
              pidx,
              transaction_id: transactionId,
              amount,
              purchase_order_id: purchaseOrderId,
            },
          }
        );

        if (response.status === 200) {
          setPaymentStatus("success");
        } else {
          setPaymentStatus("failure");
        }
      } catch (err) {
        setError("Payment verification failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [pidx, transactionId, amount, purchaseOrderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Processing Your Payment</h1>
          <p className="text-gray-600">Please wait while we verify your transaction...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {paymentStatus === "success" ? (
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">Your booking has been confirmed.</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold">NPR {(amount)/100}</span>
              </div>
              
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-4">
              {error || "There was an issue processing your payment. Please try again."}
            </p>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          {paymentStatus === "success" && (
            <Link
              to="/bookings"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View My Bookings
            </Link>
          )}
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FiHome className="mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
