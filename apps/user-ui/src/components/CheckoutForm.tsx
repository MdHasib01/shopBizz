"use client"; // If using Next.js App Router

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import React, { useState } from "react";

const CheckoutForm = ({
  clientSecret,
  cartItems,
  coupon,
  sessionId,
}: {
  clientSecret: string;
  cartItems: any[];
  coupon: any;
  sessionId: string | null;
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const safeNumber = (value: any) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const resolveItemPrice = (item: any) =>
    safeNumber(item?.sale_price ?? item?.price ?? item?.totalPrice);
  const resolveItemQuantity = (item: any) =>
    Math.max(safeNumber(item?.quantity), 0);
  const resolveItemName = (item: any, index: number) =>
    item?.title ?? item?.name ?? item?.productName ?? `Item ${index + 1}`;

  const discountAmount = safeNumber(coupon?.discountAmount);

  const total = cartItems.reduce((acc, item) => {
    const linePrice = resolveItemPrice(item) * resolveItemQuantity(item);
    return acc + linePrice;
  }, 0);

  const orderTotal = Math.max(total - discountAmount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      // Elements not ready yet—don’t proceed
      setLoading(false);
      return;
    }

    // Optional: validate PaymentElement before confirming
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(
        submitError.message ?? "Please check your details and try again."
      );
      setLoading(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?sessionId=${
          sessionId ?? ""
        }`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setStatus("failed");
      setError(result.error.message || "Something went wrong");
    } else {
      setStatus("success");
    }
    setLoading(false);
  };

  if (!clientSecret) {
    return (
      <p className="text-red-600">
        Missing client secret. Cannot render payment form.
      </p>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 my-10">
      <form
        className="bg-white w-full max-w-lg p-8 rounded-md shadow space-y-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-semibold text-gray-800">
          Secure Payment Checkout
        </h2>
        <p className="text-gray-500">
          Complete your order by providing your payment details.
        </p>

        {/* dynamic order summary  */}
        <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-700 space-y-4">
          {cartItems.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm pb-1">
              <span>
                {resolveItemQuantity(item)} x {resolveItemName(item, idx)}
              </span>
              <span>
                $
                {(resolveItemPrice(item) * resolveItemQuantity(item)).toFixed(
                  2
                )}
              </span>
            </div>
          ))}

          {discountAmount > 0 && (
            <div className="flex justify-between font-semibold pt-2 border-t border-t-gray-200">
              <span>Discount</span>
              <span className="text-green-600">
                -${discountAmount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between font-semibold mt-2">
            <span>Total</span>
            <span>${orderTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Only render when clientSecret exists (it does, checked above) */}
        <PaymentElement />

        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium cursor-pointer disabled:opacity-60"
          type="submit"
          disabled={loading || !stripe || !elements}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="animate-spin w-5 h-5" />
              Processing...
            </span>
          ) : (
            "Pay Now"
          )}
        </button>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-600 text-sm justify-center">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {status === "success" && (
          <div className="mt-3 flex items-center gap-2 text-green-600 text-sm justify-center">
            <CheckCircle className="w-5 h-5" />
            Payment Successful!
          </div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;
