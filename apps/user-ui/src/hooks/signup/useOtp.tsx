import { apiConfig } from "@/configs/apiRoutes";
import { SignUpFormData } from "@/types/auth/signup.types";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

const useOtp = (
  setServerError: (error: string | null) => void,
  otp: string[],
  router: AppRouterInstance,
  setTimer: (prevTimer: any) => void,
  setCanResend: (canResend: boolean) => void,
  setShowOtp: (showOtp: boolean) => void
) => {
  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prevTimer: any) => {
        if (prevTimer === 0) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const verifyOtpMutation = useMutation({
    mutationFn: async (userData: SignUpFormData | null) => {
      if (!userData) return;
      const response = await axios.post(
        `${apiConfig.baseUrl}${apiConfig.routes.verifyOtp}`,
        {
          ...userData,
          otp: otp.join(""),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push("/login");
      setServerError(null);
      toast.success("Signup successful");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid credentials";
      setServerError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleResendOtp = () => {
    setShowOtp(true);
    setCanResend(false);
    setTimer(60);
  };
  return {
    startResendTimer,

    verifyOtpMutation,
    handleResendOtp,
  };
};

export default useOtp;
