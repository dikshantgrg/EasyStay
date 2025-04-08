import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract query parameters from the URL
  const params = new URLSearchParams(location.search);
  const pidx = params.get("pidx");
  const transactionId = params.get("transaction_id");
  const amount = params.get("amount");
  const purchaseOrderId = params.get("purchase_order_id");

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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Verifying Payment...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">
        {paymentStatus === "success"
          ? "Payment Successful!"
          : "Payment Failed!"}
      </h1>
      {paymentStatus === "success" && (
        <p className="text-lg mb-8">Your booking is confirmed. Thank you!</p>
      )}
      {paymentStatus === "failure" && (
        <p className="text-lg mb-8">
          There was an issue with your payment. Please try again.
        </p>
      )}
      {error && <p className="text-red-500 mb-8">{error}</p>}
      <Link
        to="/"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default PaymentSuccess;
