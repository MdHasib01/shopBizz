"use client";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import SectionTitle from "@/components/SectionTitle";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const page = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=12"
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
  const { data: latestProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=12&type=latest"
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
  return (
    <div className="">
      <HeroSection />
      <div className="md:w-[80%] w-[90%] m-auto my-10">
        <div className="mb-8">
          <SectionTitle title="New Arrivals" />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="w-full h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
