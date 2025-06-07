"use client";
import { apiConfig } from "@/configs/apiRoutes";
import { LoginFormData } from "@/types/auth/login.types";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

const useLogin = (
  setServerError: (error: string | null) => void,
  router: AppRouterInstance
) => {
  // Login mutation --
  const loginMutation = useMutation<any, AxiosError, LoginFormData>({
    mutationFn: async (data: LoginFormData) => {
      const response = await axios.post(
        `${apiConfig.baseUrl}${apiConfig.routes.login}`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      router.push("/");
      toast.success("Login successful");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid credentials";
      setServerError(errorMessage);
      toast.error(errorMessage);
    },
  });

  return loginMutation;
};

export default useLogin;
