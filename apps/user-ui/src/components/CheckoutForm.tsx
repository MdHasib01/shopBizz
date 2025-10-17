import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { stat } from "fs";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import React, { useState } from "react";
import { set } from "react-hook-form";

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

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?sessionId=${sessionId}`,
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
  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 my-10">
      <form
        className="bg-white w-full max-w-lg p-8 rouded-md shadow space-y-6"
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
                {item.quantity} x {item.name}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="flex justify-between font-semibold pt-2 border-t border-t-gray-500">
            {!!coupon?.discountAmount && (
              <>
                <span>Discount</span>
                <span className="text-green-600">
                  -${(coupon?.discountAmount).toFixed(2)}
                </span>
              </>
            )}
          </div>
          <div className="flex justify-between font-semibold mt-2">
            <span>Total</span>
            <span>${(total - (coupon?.discountAmount || 0)).toFixed(2)}</span>
          </div>
        </div>
        <PaymentElement />
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">
          {loading && <Loader2 className="annimate-spin w-5 h-5" />}
          {loading ? "Processing..." : "Pay Now"}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
              <XCircle className="w-5 h-5" />
              {error}
            </div>
          )}
          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600 text-sm justify-center">
              <CheckCircle className="w-5 h-5" />
              Paymet Successfull!
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;
