"use client";
import ProductCard from "@/components/ProductCard";
import ShopCard from "@/components/ShopCard";
import { categories } from "@/configs/categories";
import { countries } from "@/configs/countries";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ShopPage = () => {
  const router = useRouter();
  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [shops, setShops] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);

  const fetchFilteredShops = async () => {
    setIsShopLoading(true);
    try {
      const query = new URLSearchParams();

      if (selectedCategories.length > 0)
        query.set("categories", selectedCategories.join(","));
      if (selectedCountries.length > 0)
        query.set("countries", selectedCountries.join(","));
      query.set("page", page.toString());
      query.set("limit", "12");

      const res = await axiosInstance.get(
        `/product/api/get-filtered-shops?${query.toString()}`
      );

      setShops(res.data.shops);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch filtered products", error);
    } finally {
      setIsShopLoading(false);
    }
  };
  const updateURL = () => {
    const params = new URLSearchParams();
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }
    if (selectedCountries.length > 0) {
      params.set("countries", selectedCountries.join(","));
    }
    params.set("page", page.toString());

    router.replace(`/shops?${decodeURIComponent(params.toString())}`);
  };

  useEffect(() => {
    updateURL();
    fetchFilteredShops();
  }, [selectedCategories, selectedCountries, page]);

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat) => cat !== label)
        : [...prev, label]
    );
  };

  const toggleCountry = (label: string) => {
    setSelectedCountries((prev) =>
      prev.includes(label)
        ? prev.filter((country) => country !== label)
        : [...prev, label]
    );
  };

  return (
    <div className="w-full bg-[#f5f5f5] pb-10">
      <div className="w-[90%] lg:w-[80%] m-auto">
        <h1 className="pb-[50px] md:pt-[40px] font-medium text-[40px] leading-[40px]">
          All Shops
        </h1>

        <Link href="/" className="text-[#55585b] hover:underline">
          Home
        </Link>

        <span className="inline-block text-[#55585b] mx-1">/</span>

        <span className=" rounded-full text-[#55585b] px-[5px]">All Shops</span>
        <div className="w-full flex flex-col lg:flex-row gap-8 mt-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-[270px] rounded bg-white p-4 space-y-4">
            {/* Categories  */}
            <h3 className="text-xl font-poppins font-medium border-b border-b-slate-300 pb-1">
              Categories
            </h3>
            <ul className="space-y-2 !mt-3">
              {categories?.map((category: any) => (
                <li
                  key={category.label}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => toggleCategory(category.value)}
                      className="accent-blue-600"
                    />
                    {category.value}
                  </label>
                </li>
              ))}
            </ul>
            {/* Countries  */}
            <h3 className="text-xl font-poppins font-medium border-b border-b-slate-300 pb-1">
              Countries
            </h3>
            <ul className="space-y-2 !mt-3">
              {countries?.map((country: any) => (
                <li key={country} className="flex items-center justify-between">
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(country)}
                      onChange={() => toggleCategory(country)}
                      className="accent-blue-600"
                    />
                    {country}
                  </label>
                </li>
              ))}
            </ul>
          </aside>

          {/* products grid  */}
          <div className="flex-1 px-2 lg:px-3">
            {isShopLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-full h-[250px] animate-pulse bg-gray-300 rounded-xl"
                  ></div>
                ))}
              </div>
            ) : shops?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {shops?.map((shop: any) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <p className="text-center">No shops found!</p>
            )}

            {/* Pagination  */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`${
                      page === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600"
                    } px-3 py-1 rounded`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
