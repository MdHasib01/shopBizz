"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignUpFormData } from "@/types/auth/signup.types";
import useOtp from "@/hooks/signup/useOtp";
import useSignup from "@/hooks/signup/useSignup";
import SignupForm from "./signupForm";
import OtpVerification from "./otpVarification";
import CreateShop from "./createShop";
import ConnectBank from "./connectBank";

const Page = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<SignUpFormData | null>(null);
  const [sellerId, setSellerId] = useState("");

  const router = useRouter();

  // OTP hook
  const { startResendTimer, verifyOtpMutation, handleResendOtp } = useOtp(
    setServerError,
    otp,
    router,
    setTimer,
    setCanResend,
    setShowOtp,
    setSellerId,
    setActiveStep
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
    <div className="w-full flex flex-col items-center pt-10 min-h-screen">
      {/* steps  */}
      <div className="relative flex items-center justify-between md:w-[50%] mb-8">
        <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10" />

        {[1, 2, 3].map((step) => (
          <div key={step}>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full  text-white ${
                step <= activeStep ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              {step}
            </div>
            <span className="ml-[-15px]">
              {step === 1
                ? "Create Account"
                : step === 2
                ? "Setup Shop"
                : "Connect Bank"}
            </span>
          </div>
        ))}
      </div>
      {/* Setp Content  */}
      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {activeStep === 1 && (
          <>
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
          </>
        )}

        {activeStep === 2 && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}
        {activeStep === 3 && (
          <ConnectBank sellerId={sellerId} setActiveStep={setActiveStep} />
        )}
      </div>
    </div>
  );
};

export default Page;
