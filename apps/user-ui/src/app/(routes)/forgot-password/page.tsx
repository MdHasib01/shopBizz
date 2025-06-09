"use client";

import GoogleButton from "@/components/ui/googleButton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OtpVerification from "./otpVarification";
import ForgotPasswordForm from "./forgotPasswordForm";
import {
  ChangePasswordForm,
  ForgotPasswordSubmitForm,
} from "@/types/auth/forgotPassword.types";
import useForgotPassword from "@/hooks/forgot-password/useForgotPassword";
import useOtp from "@/hooks/forgot-password/useOtp";
import ChangePassword from "./changePassword";
import useChangePassword from "@/hooks/forgot-password/useChangePassword";

const Page = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(1);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<ForgotPasswordSubmitForm | null>(
    null
  );

  const router = useRouter();

  // OTP hook
  const { startResendTimer, verifyOtpMutation, handleResendOtp } = useOtp(
    setServerError,
    otp,
    router,
    setTimer,
    setCanResend,
    setSelectedTab
  );

  // Forgot password Hook
  const { forgotPasswordMutation } = useForgotPassword(
    setServerError,
    router,
    startResendTimer,
    setUserData,
    setSelectedTab,
    setCanResend,
    setTimer
  );
  // Change password Hook
  const { changePasswordMutation } = useChangePassword(
    setServerError,
    router,
    startResendTimer,
    setSelectedTab,
    setCanResend,
    setTimer
  );

  const handleSignupSubmit = (data: ForgotPasswordSubmitForm) => {
    forgotPasswordMutation.mutate(data);
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
          {selectedTab === 1 ? (
            <ForgotPasswordForm
              onSubmit={handleSignupSubmit}
              isLoading={forgotPasswordMutation.isPending}
              serverError={serverError}
              passwordVisible={passwordVisible}
              setPasswordVisible={setPasswordVisible}
            />
          ) : selectedTab === 2 ? (
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
          ) : (
            selectedTab === 3 && (
              <ChangePassword
                onSubmit={(data) =>
                  changePasswordMutation.mutate({ ...data, ...userData })
                }
                isLoading={forgotPasswordMutation.isPending}
                serverError={serverError}
                passwordVisible={passwordVisible}
                setPasswordVisible={setPasswordVisible}
              />
            )
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
