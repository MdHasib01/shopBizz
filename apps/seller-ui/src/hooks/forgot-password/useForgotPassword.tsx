import { apiConfig } from "@/configs/apiRoutes";
import { ForgotPasswordSubmitForm } from "@/types/auth/forgotPassword.types";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

const useForgotPassword = (
  setServerError: (error: string | null) => void,
  router: AppRouterInstance,
  startResendTimer: () => void,
  setUserData: (userData: ForgotPasswordSubmitForm) => void,
  setSelectedTab: (showOtp: number) => void,
  setCanResend: (canResend: boolean) => void,
  setTimer: (timer: number) => void
) => {
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordSubmitForm) => {
      const response = await axios.post(
        `${apiConfig.baseUrl}${apiConfig.routes.forgotPassword}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setSelectedTab(2);
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

  return { forgotPasswordMutation };
};

export default useForgotPassword;
