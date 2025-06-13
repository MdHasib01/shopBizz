import { apiConfig } from "@/configs/apiRoutes";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

// fetch user data
const fetchSeller = async () => {
  const response = await axiosInstance.get(apiConfig.routes.getSeller);
  return response.data.seller;
};

export const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  return { seller, isLoading, isError, refetch };
};
