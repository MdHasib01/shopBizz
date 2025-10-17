"use client";

import axiosInstance from "@/utils/axiosInstance";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";

const STRIPE_PK =
  "pk_test_51RZHscQPB8ZnEpvwCfVicmF5Rwm5r554KlFD1RdmdX4SAKlumJrmqOKTbCx5RfleTDppyzGslwvctQvZSIztbNUg00FCF4SBRP";

// Create the promise once (module scope is fine)
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : Promise.resolve(null);

export default function Page() {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [couponState, setCouponState] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  useEffect(() => {
    const fetchSessionAndClientSecret = async () => {
      if (!sessionId) {
        setError("Invalid session. Please try again.");
        setLoading(false);
        return;
      }

      try {
        // Verify session
        const verifyRes = await axiosInstance.get(
          `/order/api/verifying-payment-session?sessionId=${sessionId}`
        );

        const {
          cart,
          totalAmount,
          sellers,
          coupon: sessionCoupon,
        } = verifyRes.data.session ?? {};

        if (
          !Array.isArray(sellers) ||
          sellers.length === 0 ||
          !Array.isArray(cart) ||
          totalAmount == null
        ) {
          throw new Error("Invalid payment session data.");
        }

        setCartItems(cart);
        setCouponState(sessionCoupon ?? null);

        const sellerStripeAccountId = sellers[0]?.stripeAccountId;

        // Create payment intent (server should do amount-in-cents math)
        const intentRes = await axiosInstance.post(
          `/order/api/create-payment-intent`,
          {
            amount: sessionCoupon?.discountAmount
              ? totalAmount - sessionCoupon.discountAmount
              : totalAmount,
            totalAmount,
            coupon: sessionCoupon?.discountAmount ?? 0,
            sellerStripeAccountId,
            sessionId,
          }
        );

        setClientSecret(intentRes.data.clientSecret);
      } catch (err: any) {
        console.error(err);
        setError("Something went wrong while preparing your payment.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndClientSecret();
  }, [sessionId]);

  const appearance: Appearance = useMemo(() => ({ theme: "stripe" }), []);

  if (!STRIPE_PK) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-red-600 font-medium">
          Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Add it to your <code>.env.local</code> and restart the dev server.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] px-4 text-center">
        <div className="flex justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-red-500 w-10 h-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Payment Failed
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {error}
          <br className="hidden sm:block" />
          Please go back and try checking out again.
        </p>
        <button
          onClick={() => router.push("/cart")}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-md transition-all"
        >
          Go Back to Cart
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return null; // or a small placeholder until clientSecret is set
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <CheckoutForm
        clientSecret={clientSecret}
        cartItems={cartItems}
        coupon={couponState}
        sessionId={sessionId}
      />
    </Elements>
  );
}
