import { apiConfig } from "@/configs/apiRoutes";
import { ShopFormData } from "@/types/shop/shop.types";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const useCreateShop = (
  setServerError: (error: string | null) => void,
  setActiveStep: (activeStep: number) => void,
  sellerId: string
) => {
  const createShopMutaiton = useMutation({
    mutationFn: async (data: ShopFormData) => {
      const response = await axios.post(
        `${apiConfig.baseUrl}${apiConfig.routes.createShop}`,
        { ...data, sellerId }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setServerError(null);
      setActiveStep(3);
      toast.success("Shop created successfully");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid credentials";
      setServerError(errorMessage);
      toast.error(errorMessage);
    },
  });

  return createShopMutaiton;
};

export default useCreateShop;
