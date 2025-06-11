import { useRef, useEffect } from "react";
import ErrorAlert from "@/components/ui/errorAlert";
import { SignUpFormData } from "@/types/auth/signup.types";

interface OtpVerificationProps {
  otp: string[];
  setOtp: (otp: string[]) => void;
  userData: SignUpFormData | null;
  isVerifying: boolean;
  canResend: boolean;
  timer: number;
  serverError: string | null;
  onVerifyOtp: () => void;
  onResendOtp: () => void;
}

const OtpVerification = ({
  otp,
  setOtp,
  userData,
  isVerifying,
  canResend,
  timer,
  serverError,
  onVerifyOtp,
  onResendOtp,
}: OtpVerificationProps) => {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 4).split("");

    if (digits.length > 0) {
      const newOtp = ["", "", "", ""];
      digits.forEach((digit, index) => {
        if (index < 4) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);

      const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
      const focusIndex =
        nextEmptyIndex === -1 ? 3 : Math.min(nextEmptyIndex, 3);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <>
      <h3 className="text-xl font-semibold text-center mb-4">Enter OTP</h3>

      <div className="flex justify-center gap-6">
        {otp?.map((digit, index) => (
          <input
            type="text"
            key={index}
            maxLength={1}
            ref={(el) => {
              if (el) {
                inputRefs.current[index] = el;
              }
            }}
            className="w-12 h-12 text-center border border-gray-300 outline-none rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={isVerifying}
        className="w-full bg-blue-500 disabled:bg-blue-200 disabled:text-gray-200 text-white py-2 rounded transition duration-300 mt-4"
        onClick={onVerifyOtp}
      >
        {isVerifying ? "Verifying OTP..." : "Verify OTP"}
      </button>

      <p className="text-center text-sm mt-4">
        {canResend ? (
          <button
            className="text-blue-500 cursor-pointer"
            onClick={onResendOtp}
          >
            Resend OTP
          </button>
        ) : (
          <span>Resend OTP in {timer}s</span>
        )}
      </p>

      {serverError && ErrorAlert({ message: serverError })}
    </>
  );
};

export default OtpVerification;
