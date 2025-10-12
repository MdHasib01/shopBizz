"use client";
import axiosInstance from "@/utils/axiosInstance";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
const stripePrommise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const page = () => {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [coupon, setCoupon] = useState<any>(null);
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
        //  Verify session
        const verifyRes = await axiosInstance.get(
          `/order/api/verifying-payment-session?sessionId=${sessionId}`
        );

        const { cart, totalAmount, sellers, coupon } = verifyRes.data.session;

        if (
          !sellers ||
          sellers.length === 0 ||
          !cart ||
          totalAmount === undefined ||
          totalAmount === null
        ) {
          throw new Error("Invalid payment session data.");
        }

        setCartItems(cart);
        setCoupon(coupon ?? null);
        const sellerStripeAccountId = sellers[0].stripeAccountId;

        // ✅ Create payment intent
        const intentRes = await axiosInstance.post(
          `/order/api/create-payment-intent`,
          {
            amount: coupon?.discountAmount
              ? totalAmount - coupon.discountAmount
              : totalAmount,
            totalAmount,
            coupon: coupon?.discountAmount ?? 0,
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

  const appearance: Appearance = {
    theme: "stripe",
  };
  if (loading) {
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="animate-spi rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>;
  }
  if (loading) return <div>Loading...</div>;
  if (error) {
    return (
      // 👇 This entire JSX block
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

  return (
    clientSecret && (
      <Elements stripe={stripePrommise} options={{ clientSecret, appearance }}>
        <CheckoutForm
          clientSecret={clientSecret}
          cartItems={cartItems}
          coupon={coupon}
          sessionId={sessionId}
        />
      </Elements>
    )
  );
};

export default page;
