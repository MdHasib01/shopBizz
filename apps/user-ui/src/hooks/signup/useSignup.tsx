import { apiConfig } from "@/configs/apiRoutes";
import { SignUpFormData } from "@/types/auth/signup.types";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

const useSignup = (
  setServerError: (error: string | null) => void,
  router: AppRouterInstance,
  startResendTimer: () => void,
  setUserData: (userData: SignUpFormData) => void,
  setShowOtp: (showOtp: boolean) => void,
  setCanResend: (canResend: boolean) => void,
  setTimer: (timer: number) => void
) => {
  const signupMutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
      const response = await axios.post(
        `${apiConfig.baseUrl}${apiConfig.routes.signup}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
      setServerError(null);
      toast.success("OTP has been sent to your email");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid credentials";
      setServerError(errorMessage);
      toast.error(errorMessage);
    },
  });

  return { signupMutation };
};

export default useSignup;
