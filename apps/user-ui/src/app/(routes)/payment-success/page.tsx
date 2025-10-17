"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Truck } from "lucide-react";
import confetti from "canvas-confetti";
import { useStore } from "@/store";

const PaymentSuccessPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") ?? "";

  // Clear cart & trigger confetti once on mount
  useEffect(() => {
    // Clear cart in your Zustand store (adjust if your store uses an action)
    if (typeof useStore?.setState === "function") {
      useStore.setState({ cart: [] });
    }

    // Confetti burst
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      scalar: 1.05,
      ticks: 200,
    });
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg max-w-md w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-500 w-16 h-16 mx-auto" />
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Payment Successful
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          Thank you for your purchase! Your order has been placed successfully.
        </p>

        <button
          onClick={() => router.push("/profile?active=my-orders")}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Truck className="w-4 h-4" />
          Track Order
        </button>

        <div className="mt-8 text-xs text-gray-400">
          Payment Session ID: <span className="font-mono">{sessionId}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
