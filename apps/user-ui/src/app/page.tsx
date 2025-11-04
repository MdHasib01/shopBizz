"use client";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import SectionTitle from "@/components/SectionTitle";
import ShopCard from "@/components/ShopCard";
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
        // "/product/api/get-all-products?page=1&limit=12"
        "/recommendation/api/get-recommended-products"
      );
      // return res.data.products;
      return res.data.recommendations.products;
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
  const { data: latestProducts } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=12&type=latest"
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
  const { isLoading: offerLoading, data: offers } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-events?page=1&limit=12"
      );
      return res.data.events;
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const { data: shops, isLoading: shopLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/top-shops");
      return res.data.top10Shops;
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return (
    <div className="">
      <HeroSection />

      {/* New Arrivals  */}
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
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {products?.length === 0 && (
          <p className="text-center">No products found!</p>
        )}
      </div>

      {/* Latest Products */}
      <div className="md:w-[80%] w-[90%] m-auto my-10">
        <div className="mb-8">
          <SectionTitle title="Latest Products" />
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
            {latestProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {products?.length === 0 && (
          <p className="text-center">No products found!</p>
        )}
      </div>
      {/* Top Shops */}
      <div className="md:w-[80%] w-[90%] m-auto my-10">
        <div className="mb-8">
          <SectionTitle title="Top Shops" />
        </div>

        {shopLoading && (
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
            {shops?.map((shop: any) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}

        {shops?.length === 0 && <p className="text-center">No shops found!</p>}
      </div>

      {/* Offers*/}
      <div className="md:w-[80%] w-[90%] m-auto my-10">
        <div className="mb-8">
          <SectionTitle title="Offers" />
        </div>

        {offerLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="w-full h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}

        {!offerLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {offers?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {offers?.length === 0 && (
          <p className="text-center">No offers found!</p>
        )}
      </div>
    </div>
  );
};

export default page;
