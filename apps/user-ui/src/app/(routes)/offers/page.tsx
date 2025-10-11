"use client";
import ProductCard from "@/components/ProductCard";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Range } from "react-range";

const MIN = 0;
const MAX = 1199;

const colors = [
  { name: "Black", code: "#000000" },
  { name: "Red", code: "#ff0000" },
  { name: "Green", code: "#00ff00" },
  { name: "Blue", code: "#0000ff" },
  { name: "Yellow", code: "#ffff00" },
  { name: "Magenta", code: "#ff00ff" },
  { name: "Cyan", code: "#00ffff" },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const OffersPage = () => {
  const router = useRouter();
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1199]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);

  const fetchFilteredProducts = async () => {
    setIsProductLoading(true);
    try {
      const query = new URLSearchParams();

      query.set("priceRange", priceRange.join(","));

      if (selectedCategories.length > 0)
        query.set("categories", selectedCategories.join(","));
      if (selectedColors.length > 0)
        query.set("colors", selectedColors.join(","));
      if (selectedSizes.length > 0) query.set("sizes", selectedSizes.join(","));

      query.set("page", page.toString());
      query.set("limit", "12");

      const res = await axiosInstance.get(
        `/product/api/get-filtered-offers?${query.toString()}`
      );

      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch filtered products", error);
    } finally {
      setIsProductLoading(false);
    }
  };
  const updateURL = () => {
    const params = new URLSearchParams();

    params.set("priceRange", priceRange.join(","));

    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }

    if (selectedColors.length > 0) {
      params.set("colors", selectedColors.join(","));
    }

    if (selectedSizes.length > 0) {
      params.set("sizes", selectedSizes.join(","));
    }

    params.set("page", page.toString());

    router.replace(`/products?${decodeURIComponent(params.toString())}`);
  };

  useEffect(() => {
    updateURL();
    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedColors, selectedSizes, page]);
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat) => cat !== label)
        : [...prev, label]
    );
  };

  const toggleColor = (label: string) => {
    setSelectedColors((prev) =>
      prev.includes(label)
        ? prev.filter((color) => color !== label)
        : [...prev, label]
    );
  };

  const toggleSize = (label: string) => {
    setSelectedSizes((prev) =>
      prev.includes(label)
        ? prev.filter((size) => size !== label)
        : [...prev, label]
    );
  };
  return (
    <div className="w-full bg-[#f5f5f5] pb-10">
      <div className="w-[90%] lg:w-[80%] m-auto">
        <h1 className="pb-[50px] md:pt-[40px] font-medium text-[40px] leading-[40px]">
          All Products
        </h1>

        <Link href="/" className="text-[#55585b] hover:underline">
          Home
        </Link>

        <span className="inline-block text-[#55585b] mx-1">/</span>

        <span className=" rounded-full text-[#55585b] px-[5px]">
          All Products
        </span>
        <div className="w-full flex flex-col lg:flex-row gap-8 mt-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-[270px] rounded bg-white p-4 space-y-4">
            {/* Price Filter  */}
            <h3 className="text-xl font-poppins font-medium">Price Filter</h3>

            <div className="ml-2">
              <Range
                step={1}
                min={MIN}
                max={MAX}
                values={tempPriceRange}
                onChange={(values) => setTempPriceRange(values)}
                renderTrack={({ props, children }) => {
                  const [min, max] = tempPriceRange;
                  const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                  const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;

                  return (
                    <div
                      {...props}
                      className="h-[6px] bg-blue-200 rounded relative"
                      style={{ ...props.style }}
                    >
                      <div
                        className="absolute h-full bg-blue-600 rounded"
                        style={{
                          left: `${percentageLeft}%`,
                          width: `${percentageRight - percentageLeft}%`,
                        }}
                      />
                      {children}
                    </div>
                  );
                }}
                renderThumb={({ props }) => {
                  const { key, ...rest } = props;
                  return (
                    <div
                      key={key}
                      {...rest}
                      className="w-[16px] h-[16px] bg-blue-600 rounded-full shadow"
                    />
                  );
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-600">
                ${tempPriceRange[0]} - ${tempPriceRange[1]}
              </div>
              <button
                onClick={() => {
                  setPriceRange(tempPriceRange);
                  setPage(1);
                }}
                className="text-sm px-4 py-1 bg-gray-200 hover:bg-blue-600 hover:text-white rounded transition"
              >
                Apply
              </button>
            </div>

            {/* Categories  */}
            <h3 className="text-xl font-poppins font-medium border-b border-b-slate-300 pb-1">
              Categories
            </h3>
            <ul className="space-y-2 !mt-3">
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                data?.categories?.map((category: any) => (
                  <li
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="accent-blue-600"
                      />
                      {category}
                    </label>
                  </li>
                ))
              )}
            </ul>

            {/* colors  */}
            <h3 className="text-xl font-poppins font-medium border-b border-b-slate-300 pb-1">
              Filtere by Color
            </h3>
            <ul className="space-y-2 !mt-3">
              {colors?.map((color: any) => (
                <li
                  key={color.name}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color.name)}
                      onChange={() => toggleColor(color.name)}
                      className="accent-blue-600"
                    />
                    <span
                      className="w-5 h-5 rounded-full border-gray-300"
                      style={{ backgroundColor: color.code }}
                    ></span>
                    {color.name}
                  </label>
                </li>
              ))}
            </ul>

            {/* Size  */}
            <h3 className="text-xl font-poppins font-medium border-b border-b-slate-300 pb-1">
              Filtere by Size
            </h3>
            <ul className="space-y-2 !mt-3">
              {sizes?.map((size: any) => (
                <li key={size} className="flex items-center justify-between">
                  <label className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => toggleColor(size)}
                      className="accent-blue-600"
                    />
                    <span className="w-5 h-5 rounded-full border-gray-300"></span>
                    {size}
                  </label>
                </li>
              ))}
            </ul>
          </aside>

          {/* products grid  */}
          <div className="flex-1 px-2 lg:px-3">
            {isProductLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-full h-[250px] animate-pulse bg-gray-300 rounded-xl"
                  ></div>
                ))}
              </div>
            ) : products?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data?.products?.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-center">No products found!</p>
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

export default OffersPage;
