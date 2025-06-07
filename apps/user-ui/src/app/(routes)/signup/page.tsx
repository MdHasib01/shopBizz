"use client";

import GoogleButton from "@/components/ui/googleButton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignUpFormData } from "@/types/auth/signup.types";
import useOtp from "@/hooks/signup/useOtp";
import useSignup from "@/hooks/signup/useSignup";
import SignupForm from "./signupForm";
import OtpVerification from "./otpVarification";

const Page = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<SignUpFormData | null>(null);

  const router = useRouter();

  // OTP hook
  const { startResendTimer, verifyOtpMutation, handleResendOtp } = useOtp(
    setServerError,
    otp,
    router,
    setTimer,
    setCanResend,
    setShowOtp
  );

  // Signup Hook
  const { signupMutation } = useSignup(
    setServerError,
    router,
    startResendTimer,
    setUserData,
    setShowOtp,
    setCanResend,
    setTimer
  );

  const handleSignupSubmit = (data: SignUpFormData) => {
    signupMutation.mutate(data);
  };

  const handleVerifyOtp = () => {
    verifyOtpMutation.mutate(userData);
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Sign up
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Signup
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          {!showOtp ? (
            <SignupForm
              onSubmit={handleSignupSubmit}
              isLoading={signupMutation.isPending}
              serverError={serverError}
              passwordVisible={passwordVisible}
              setPasswordVisible={setPasswordVisible}
            />
          ) : (
            <OtpVerification
              otp={otp}
              setOtp={setOtp}
              userData={userData}
              isVerifying={verifyOtpMutation.isPending}
              canResend={canResend}
              timer={timer}
              serverError={serverError}
              onVerifyOtp={handleVerifyOtp}
              onResendOtp={handleResendOtp}
            />
          )}

          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-2">or Sign in with Google</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
          <GoogleButton />
        </div>
      </div>
    </div>
  );
};

export default Page;
