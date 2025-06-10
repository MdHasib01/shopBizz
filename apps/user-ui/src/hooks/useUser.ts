import { apiConfig } from "@/configs/apiRoutes";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

// fetch user data
const fetchUser = async () => {
  const response = await axiosInstance.get(apiConfig.routes.getUser);
  return response.data.user;
};

export const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  return { user, isLoading, isError, refetch };
};
