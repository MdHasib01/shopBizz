import { apiConfig } from "@/configs/apiRoutes";
import { ChangePasswordForm } from "@/types/auth/forgotPassword.types";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

const useChangePassword = (
  setServerError: (error: string | null) => void,
  router: AppRouterInstance,
  startResendTimer: () => void,
  setSelectedTab: (showOtp: number) => void,
  setCanResend: (canResend: boolean) => void,
  setTimer: (timer: number) => void
) => {
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordForm) => {
      const response = await axios.post(
        `${apiConfig.baseUrl}${apiConfig.routes.resetPassword}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      router.push("/login");
      setSelectedTab(1);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
      setServerError(null);
      toast.success("Password Changed Successfully");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message || "Wrong OTP";
      setServerError(errorMessage);
      toast.error(errorMessage);
    },
  });

  return { changePasswordMutation };
};
export default useChangePassword;
